import type { StatsRepository } from '../repositories/stats.repository'
import type { LeaderboardRepository } from '../repositories/leaderboard.repository'
import { formatRupiah, formatTanggal, escapeMarkdown } from '../utils/formatter'

export function createStatsService(
  statsRepo: StatsRepository,
  leaderboardRepo: LeaderboardRepository,
) {
  async function getStats(): Promise<string> {
    const [stats, topDonor] = await Promise.all([
      statsRepo.get(),
      leaderboardRepo.getTop(1),
    ])

    const lines: string[] = ['📈 *Statistik Donasi*\n']
    lines.push(`💰 Total donasi: ${escapeMarkdown(formatRupiah(Number(stats.total_donations)))}`)
    lines.push(`👥 Total donatur: ${escapeMarkdown(String(stats.unique_donors))} orang`)
    lines.push(`📝 Total transaksi: ${escapeMarkdown(String(stats.total_transactions))} donasi`)
    if (stats.last_donation_at) {
      lines.push(`🕐 Donasi terakhir: ${escapeMarkdown(formatTanggal(stats.last_donation_at))}`)
    }
    if (topDonor.length > 0) {
      lines.push(
        `⭐ Donatur teratas: ${escapeMarkdown(topDonor[0].member)} \\(${escapeMarkdown(formatRupiah(topDonor[0].score))}\\)`,
      )
    }
    return lines.join('\n')
  }

  return { getStats }
}

export type StatsService = ReturnType<typeof createStatsService>
