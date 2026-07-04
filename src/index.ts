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
import { createDonationService } from './services/donation.service'
import { createLeaderboardService } from './services/leaderboard.service'
import { createStatsService } from './services/stats.service'
import { createCommandService } from './services/command.service'
import { webhookDonationRoutes } from './routes/webhook.donation'
import { webhookTelegramRoutes } from './routes/webhook.telegram'
import { healthRoutes } from './routes/health'

// Patch CloudflareAdapter to skip AOT codegen (new Function blocked by CF Workers)
CloudflareAdapter.beforeCompile = function () {
  // AOT codegen not supported in CF Workers — let lazy dynamic handlers do the work
}

function buildApp(env: EnvConfig) {
  const redis = getRedis(env as any)

  const donationRepo = createDonationRepository(redis)
  const leaderboardRepo = createLeaderboardRepository(redis)
  const statsRepo = createStatsRepository(redis)
  const configRepo = createConfigRepository(redis)
  const telegramRepo = createTelegramRepository(env.TELEGRAM_BOT_TOKEN)

  const donationService = createDonationService(
    donationRepo, leaderboardRepo, statsRepo, configRepo, telegramRepo,
  )
  const leaderboardService = createLeaderboardService(leaderboardRepo, statsRepo)
  const statsService = createStatsService(statsRepo, leaderboardRepo)
  const commandService = createCommandService(leaderboardService, statsService)

  return new Elysia({ aot: false, adapter: CloudflareAdapter })
    .derive(() => ({ env, donationService, commandService, configRepo }))
    .onError((ctx) => {
      const err = ctx.error as any
      console.error('Elysia error:', JSON.stringify({
        path: ctx.path,
        method: ctx.request.method,
        status: ctx.code,
        type: err?.type ?? typeof err,
        message: err?.message ?? String(err),
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
    _event: any,
    env: Record<string, string>,
    ctx: any,
  ): Promise<void> {
    const e = env as unknown as EnvConfig
    ctx.waitUntil(
      handleRetry(
        getRedis(e as any),
        e.TELEGRAM_BOT_TOKEN,
        e.ADMIN_CHAT_ID,
      ),
    )
  },
}
