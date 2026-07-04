import type { Redis } from '@upstash/redis'

export interface PendingNotification {
  chatId: number
  text: string
  retryCount: number
}

export function createNotificationRepository(redis: Redis) {
  return {
    async enqueue(chatId: number, text: string): Promise<void> {
      await redis.rpush(
        'pending_notifications',
        JSON.stringify({ chatId, text, retryCount: 0 } satisfies PendingNotification),
      )
    },

    async peek(index = 0): Promise<PendingNotification | null> {
      const raw: unknown = await redis.lindex('pending_notifications', index)
      if (!raw) return null
      return JSON.parse(raw as string) as PendingNotification
    },

    async dequeue(): Promise<PendingNotification | null> {
      const raw: unknown = await redis.lpop('pending_notifications')
      if (!raw) return null
      return JSON.parse(raw as string) as PendingNotification
    },

    async requeue(notification: PendingNotification): Promise<void> {
      if (notification.retryCount >= 5) return
      await redis.rpush(
        'pending_notifications',
        JSON.stringify({ ...notification, retryCount: notification.retryCount + 1 }),
      )
    },

    async count(): Promise<number> {
      return redis.llen('pending_notifications')
    },
  }
}

export type NotificationRepository = ReturnType<typeof createNotificationRepository>
