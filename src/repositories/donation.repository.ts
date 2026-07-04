import type { Redis } from '@upstash/redis'
import type { Donation } from '../types/donation'

export function createDonationRepository(redis: Redis) {
  return {
    exists(donationId: string): Promise<number> {
      return redis.exists(`donation:${donationId}`)
    },

    create(donationId: string, donation: Donation): Promise<number> {
      return redis.hset(`donation:${donationId}`, donation as unknown as Record<string, unknown>)
    },

    findById(donationId: string): Promise<Donation | null> {
      return redis.hgetall(`donation:${donationId}`) as Promise<Donation | null>
    },
  }
}

export type DonationRepository = ReturnType<typeof createDonationRepository>
