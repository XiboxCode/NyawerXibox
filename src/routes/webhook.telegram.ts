import { Elysia, t } from 'elysia'
import type { EnvConfig } from '../types/config'
import type { TelegramUpdate } from '../types/telegram'
import { sendTelegramMessage } from '../lib/telegram'

async function checkAdmin(
  botToken: string,
  chatId: number,
  userId: number,
): Promise<boolean> {
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/getChatAdministrators`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId }),
      },
    )
    const data: any = await res.json()
    if (!data.ok) return false
    return data.result.some((a: any) => a.user.id === userId)
  } catch {
    return false
  }
}

export function webhookTelegramRoutes(app: Elysia) {
  return app.post(
    '/webhook/telegram',
    async (ctx: any) => {
      const env = ctx.env as EnvConfig
      const commandService = ctx.commandService
      const configRepo = ctx.configRepo
      const body = ctx.body as TelegramUpdate

      const msg = body.message
      if (!msg?.text) return { status: 'ok' }

      const chatId = msg.chat.id
      const text = msg.text.trim()
      const senderId = msg.from?.id
      const senderName = msg.from?.first_name || 'User'

      const [command] = text.split(/\s+/)
      const cmd = command.replace(/@\w+$/, '').toLowerCase()

      const send = async (reply: string) => {
        try {
          await sendTelegramMessage(env.TELEGRAM_BOT_TOKEN, chatId, reply)
        } catch (e) {
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
            const isAdmin = await checkAdmin(
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
