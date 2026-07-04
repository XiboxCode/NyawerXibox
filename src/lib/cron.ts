import type { Redis } from '@upstash/redis'

interface PendingNotification {
  chatId: number
  text: string
  retryCount: number
}

const MAX_RETRIES = 5

export async function handleRetry(
  redis: Redis,
  botToken: string,
  adminChatId?: string,
): Promise<void> {
  const queueKey = 'pending_notifications'
  const length = await redis.llen(queueKey)

  for (let i = 0; i < length; i++) {
    const raw = await redis.lindex(queueKey, 0)
    if (!raw) break

    const item: PendingNotification =
      typeof raw === 'string' ? JSON.parse(raw) : raw

    try {
      const res = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: item.chatId,
            text: item.text,
            parse_mode: 'MarkdownV2',
          }),
        },
      )

      await redis.lpop(queueKey)

      if (res.ok) continue

      if (item.retryCount + 1 < MAX_RETRIES) {
        await redis.rpush(
          queueKey,
          JSON.stringify({
            ...item,
            retryCount: item.retryCount + 1,
          }),
        )
      } else if (adminChatId) {
        await fetch(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: adminChatId,
              text: `⚠️ Notifikasi gagal dikirim setelah ${MAX_RETRIES}x percobaan.\nChat ID: ${item.chatId}`,
            }),
          },
        )
      }
    } catch {
      await redis.lpop(queueKey)
      if (item.retryCount + 1 < MAX_RETRIES) {
        await redis.rpush(
          queueKey,
          JSON.stringify({
            ...item,
            retryCount: item.retryCount + 1,
          }),
        )
      }
    }
  }
}
