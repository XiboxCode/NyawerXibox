import type { Redis } from '@upstash/redis'

export function createConfigRepository(redis: Redis) {
  return {
    get(key: string): Promise<string | null> {
      return redis.get(`config:${key}`)
    },

    set(key: string, value: string): Promise<string | null> {
      return redis.set(`config:${key}`, value) as Promise<string | null>
    },

    getTargetChatId(): Promise<string | null> {
      return redis.get('config:target_chat_id')
    },

    setTargetChatId(chatId: string): Promise<string | null> {
      return redis.set('config:target_chat_id', chatId) as Promise<string | null>
    },
  }
}

export type ConfigRepository = ReturnType<typeof createConfigRepository>
