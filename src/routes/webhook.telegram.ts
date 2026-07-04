import { Elysia, t } from 'elysia'
import type { Context } from 'elysia'
import { checkTelegramAdmin } from '../lib/telegram'
import type { EnvConfig } from '../types/config'
import type { TelegramUpdate } from '../types/telegram'
import type { CommandService } from '../services/command.service'
import type { ConfigRepository } from '../repositories/config.repository'
import type { TelegramRepository } from '../repositories/telegram.repository'

type TelegramRouteCtx = Context & {
  env: EnvConfig
  commandService: CommandService
  configRepo: ConfigRepository
  telegramRepo: TelegramRepository
}

export function webhookTelegramRoutes(app: Elysia) {
  return app.post(
    '/webhook/telegram',
    async (ctx: unknown) => {
      const { env, commandService, configRepo, telegramRepo, body } = ctx as TelegramRouteCtx
      const msg = (body as TelegramUpdate).message
      if (!msg?.text) return { status: 'ok' }

      const chatId = msg.chat.id
      const text = msg.text.trim()
      const senderId = msg.from?.id
      const senderName = msg.from?.first_name || 'User'

      const [command] = text.split(/\s+/)
      const cmd = command.replace(/@\w+$/, '').toLowerCase()

      const send = async (reply: string) => {
        try {
          await telegramRepo.sendMessage(chatId, reply)
        } catch (e: unknown) {
          console.error('Failed to send command reply:', e)
        }
      }

      switch (cmd) {
        case '/start':
          await send(commandService.start())
          break
        case '/help':
          await send(commandService.help())
          break
        case '/leaderboard':
        case '/lb':
        case '/top':
          await send(await commandService.getLeaderboard())
          break
        case '/myleaderboard':
          await send(await commandService.getMyLeaderboard(senderName))
          break
        case '/stats':
          await send(await commandService.getStats())
          break
        case '/donasi':
          await send(commandService.donasi(env.TRAKTEER_URL, env.SAWERIA_URL))
          break
        case '/setgroup':
          if (msg.chat.type === 'private') {
            await send('Command ini hanya bisa digunakan di grup.')
            break
          }
          {
            const isAdmin = await checkTelegramAdmin(
              env.TELEGRAM_BOT_TOKEN,
              chatId,
              senderId!,
            )
            if (!isAdmin) {
              await send(commandService.setGroupDenied())
              break
            }
          }
          await configRepo.setTargetChatId(String(chatId))
          await send(commandService.setGroupSuccess())
          break
        case '/info':
          await send(commandService.info())
          break
      }

      return { status: 'ok' }
    },
    { body: t.Any() },
  )
}
