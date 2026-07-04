import type { Donation } from '../types/donation'
import type { DonationRepository } from '../repositories/donation.repository'
import type { LeaderboardRepository } from '../repositories/leaderboard.repository'
import type { StatsRepository } from '../repositories/stats.repository'
import type { ConfigRepository } from '../repositories/config.repository'
import type { TelegramRepository } from '../repositories/telegram.repository'
import { generateDonationId } from '../utils/id'
import { formatRupiah, escapeMarkdown, formatTanggal } from '../utils/formatter'
import { parsers, platformNames } from './parsers'

export function createDonationService(
  donationRepo: DonationRepository,
  leaderboardRepo: LeaderboardRepository,
  statsRepo: StatsRepository,
  configRepo: ConfigRepository,
  telegramRepo: TelegramRepository,
) {
  function formatNotification(d: Donation): string {
    const lines: string[] = ['💝 *DONASI BARU* 💝\n']
    lines.push(`👤 Dari: ${escapeMarkdown(d.donator_name || 'Anonim 🙈')}`)
    lines.push(`💰 Jumlah: ${escapeMarkdown(formatRupiah(d.amount))}`)
    if (d.message) {
      lines.push(`💬 Pesan: "${escapeMarkdown(d.message)}"`)
    }
    lines.push(`📱 Via: ${platformNames[d.source] ?? d.source}`)
    if (d.media) {
      const media = JSON.parse(d.media)
      if (media.gif) lines.push('🎬 + GIF')
      if (media.video)
        lines.push(
          `🎥 Video ${media.video.type === 'tiktok' ? 'TikTok' : 'YouTube'}`,
        )
      if (media.voice) lines.push('🎤 Voice note')
    }
    lines.push(`🕐 ${escapeMarkdown(formatTanggal(d.timestamp))}`)
    return lines.join('\n')
  }

  async function enqueueNotification(
    chatId: string,
    text: string,
  ): Promise<void> {
    const { Redis } = await import('@upstash/redis')
    const url =
      (typeof process !== 'undefined' &&
        (process as any).env?.UPSTASH_REDIS_REST_URL) ||
      ''
    const token =
      (typeof process !== 'undefined' &&
        (process as any).env?.UPSTASH_REDIS_REST_TOKEN) ||
      ''
    if (!url || !token) return
    const redis = new Redis({ url, token })
    await redis.rpush(
      'pending_notifications',
      JSON.stringify({ chatId: Number(chatId), text, retryCount: 0 }),
    )
  }

  async function process(
    payload: unknown,
    source: string,
  ): Promise<{ status: string; note?: string }> {
    const parser = parsers[source]
    if (!parser) return { status: 'error', note: `unknown source: ${source}` }
    const donation = parser(payload)

    const donationId = generateDonationId(source, donation.raw_id)

    const exists = await donationRepo.exists(donationId)
    if (exists) return { status: 'ok', note: 'duplicate' }

    await donationRepo.create(donationId, donation)
    await leaderboardRepo.incrementScore(donation.donator_name, donation.amount)
    await statsRepo.incrementAll(donation.amount)
    const zcard = await leaderboardRepo.count()
    await statsRepo.updateUniqueDonors(zcard)
    await statsRepo.updateLastDonationAt()

    const targetChatId = await configRepo.getTargetChatId()
    if (targetChatId) {
      const message = formatNotification(donation)
      try {
        await telegramRepo.sendNotification(Number(targetChatId), message)
      } catch (e) {
        console.error('Notification send failed, enqueuing:', e)
        await enqueueNotification(targetChatId, message)
      }
    }

    return { status: 'ok' }
  }

  return { process }
}

export type DonationService = ReturnType<typeof createDonationService>
