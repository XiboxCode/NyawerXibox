import type { Redis } from '@upstash/redis'

export function createLeaderboardRepository(redis: Redis) {
  return {
    incrementScore(name: string, amount: number): Promise<number> {
      return redis.zincrby('leaderboard', amount, name.toLowerCase())
    },

    async getTop(limit = 10): Promise<{ member: string; score: number }[]> {
      const data = await redis.zrange<string[]>(
        'leaderboard', 0, limit - 1,
        { rev: true, withScores: true },
      )
      const result: { member: string; score: number }[] = []
      for (let i = 0; i < data.length; i += 2) {
        result.push({ member: data[i], score: Number(data[i + 1]) })
      }
      return result
    },

    getRank(name: string): Promise<number | null> {
      return redis.zrevrank('leaderboard', name.toLowerCase())
    },

    getScore(name: string): Promise<number | null> {
      return redis.zscore('leaderboard', name.toLowerCase())
    },

    count(): Promise<number> {
      return redis.zcard('leaderboard')
    },
  }
}

export type LeaderboardRepository = ReturnType<typeof createLeaderboardRepository>
