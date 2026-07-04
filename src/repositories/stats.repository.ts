import type { Redis } from '@upstash/redis'

export function createStatsRepository(redis: Redis) {
  return {
    async incrementAll(amount: number): Promise<void> {
      await Promise.all([
        redis.incrby('stats:total_donations', amount),
        redis.incr('stats:total_transactions'),
      ])
    },

    async updateLastDonationAt(): Promise<void> {
      await redis.set('stats:last_donation_at', new Date().toISOString())
    },

    async updateUniqueDonors(zcard: number): Promise<void> {
      await redis.set('stats:unique_donors', zcard)
    },

    async get(): Promise<{
      total_donations: string
      total_transactions: string
      unique_donors: string
      last_donation_at: string
    }> {
      const [totalDonations, totalTransactions, uniqueDonors, lastDonationAt] =
        await Promise.all([
          redis.get('stats:total_donations'),
          redis.get('stats:total_transactions'),
          redis.get('stats:unique_donors'),
          redis.get('stats:last_donation_at'),
        ])
      return {
        total_donations: (totalDonations ?? '0') as string,
        total_transactions: (totalTransactions ?? '0') as string,
        unique_donors: (uniqueDonors ?? '0') as string,
        last_donation_at: (lastDonationAt ?? '') as string,
      }
    },
  }
}

export type StatsRepository = ReturnType<typeof createStatsRepository>
