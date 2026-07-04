import { sendTelegramMessage } from '../lib/telegram'

export function createTelegramRepository(botToken: string) {
  return {
    sendNotification(chatId: number, text: string) {
      return sendTelegramMessage(botToken, chatId, text)
    },

    sendMessage(chatId: number, text: string) {
      return sendTelegramMessage(botToken, chatId, text)
    },
  }
}

export type TelegramRepository = ReturnType<typeof createTelegramRepository>
