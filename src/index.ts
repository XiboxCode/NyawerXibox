import { Elysia } from 'elysia'
import { CloudflareAdapter } from 'elysia/adapter/cloudflare-worker'
import type { EnvConfig } from './types/config'
import { getRedis } from './lib/redis'
import { handleRetry } from './lib/cron'
import { createDonationRepository } from './repositories/donation.repository'
import { createLeaderboardRepository } from './repositories/leaderboard.repository'
import { createStatsRepository } from './repositories/stats.repository'
import { createConfigRepository } from './repositories/config.repository'
import { createTelegramRepository } from './repositories/telegram.repository'
import { createNotificationRepository } from './repositories/notification.repository'
import { createDonationService } from './services/donation.service'
import { createLeaderboardService } from './services/leaderboard.service'
import { createStatsService } from './services/stats.service'
import { createCommandService } from './services/command.service'
import { webhookDonationRoutes } from './routes/webhook.donation'
import { webhookTelegramRoutes } from './routes/webhook.telegram'
import { healthRoutes } from './routes/health'

CloudflareAdapter.beforeCompile = function () {}

function buildApp(env: EnvConfig) {
  const redis = getRedis({
    UPSTASH_REDIS_REST_URL: env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: env.UPSTASH_REDIS_REST_TOKEN,
  })

  const donationRepo = createDonationRepository(redis)
  const leaderboardRepo = createLeaderboardRepository(redis)
  const statsRepo = createStatsRepository(redis)
  const configRepo = createConfigRepository(redis)
  const telegramRepo = createTelegramRepository(env.TELEGRAM_BOT_TOKEN)
  const notificationRepo = createNotificationRepository(redis)

  const donationService = createDonationService(
    donationRepo, leaderboardRepo, statsRepo, configRepo, telegramRepo, notificationRepo,
  )
  const leaderboardService = createLeaderboardService(leaderboardRepo, statsRepo)
  const statsService = createStatsService(statsRepo, leaderboardRepo)
  const commandService = createCommandService(leaderboardService, statsService)

  return new Elysia({ aot: false, adapter: CloudflareAdapter })
    .derive(() => ({ env, donationService, commandService, configRepo, telegramRepo }))
    .onError((ctx) => {
      const err: unknown = ctx.error
      const errorInfo = err instanceof Error
        ? { message: err.message, name: err.name, stack: err.stack }
        : { message: String(err) }
      console.error('Elysia error:', JSON.stringify({
        path: ctx.path,
        method: ctx.request.method,
        status: ctx.code,
        ...errorInfo,
      }, null, 2))
    })
    .use(webhookDonationRoutes)
    .use(webhookTelegramRoutes)
    .use(healthRoutes)
    .compile()
}

let _cached: ReturnType<typeof buildApp> | null = null

export default {
  fetch(request: Request, env: Record<string, string>) {
    if (!_cached) _cached = buildApp(env as unknown as EnvConfig)
    return _cached.fetch(request)
  },

  async scheduled(
    _event: unknown,
    env: Record<string, string>,
    ctx: { waitUntil: (p: Promise<unknown>) => void },
  ): Promise<void> {
    const e = env as unknown as EnvConfig
    ctx.waitUntil(
      handleRetry(
        getRedis({
          UPSTASH_REDIS_REST_URL: e.UPSTASH_REDIS_REST_URL,
          UPSTASH_REDIS_REST_TOKEN: e.UPSTASH_REDIS_REST_TOKEN,
        }),
        e.TELEGRAM_BOT_TOKEN,
        e.ADMIN_CHAT_ID,
      ),
    )
  },
}
