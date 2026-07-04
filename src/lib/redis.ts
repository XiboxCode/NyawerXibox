import { Redis } from '@upstash/redis'

let redis: Redis | null = null

export function getRedis(env: {
  UPSTASH_REDIS_REST_URL: string
  UPSTASH_REDIS_REST_TOKEN: string
}): Redis {
  if (!redis) {
    redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
  return redis
}
