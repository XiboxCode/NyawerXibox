import type { Redis } from '@upstash/redis'
import { sendTelegramMessage } from './telegram'
import { createNotificationRepository } from '../repositories/notification.repository'

const MAX_RETRIES = 5

export async function handleRetry(
  redis: Redis,
  botToken: string,
  adminChatId?: string,
): Promise<void> {
  const queue = createNotificationRepository(redis)
  const count = await queue.count()

  for (let i = 0; i < count; i++) {
    const item = await queue.dequeue()
    if (!item) break

    try {
      await sendTelegramMessage(botToken, item.chatId, item.text)
    } catch {
      if (item.retryCount + 1 < MAX_RETRIES) {
        await queue.requeue(item)
      } else if (adminChatId) {
        await sendTelegramMessage(
          botToken,
          Number(adminChatId),
          `⚠️ Notifikasi gagal dikirim setelah ${MAX_RETRIES}x percobaan.\nChat ID: ${item.chatId}`,
        ).catch(() => {})
      }
    }
  }
}
