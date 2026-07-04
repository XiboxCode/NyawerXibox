import type { LeaderboardRepository } from '../repositories/leaderboard.repository'
import type { StatsRepository } from '../repositories/stats.repository'
import { formatRupiah, formatTanggal, escapeMarkdown } from '../utils/formatter'

export function createLeaderboardService(
  leaderboardRepo: LeaderboardRepository,
  statsRepo: StatsRepository,
) {
  async function getLeaderboard(): Promise<string> {
    const [top, stats] = await Promise.all([
      leaderboardRepo.getTop(10),
      statsRepo.get(),
    ])

    if (top.length === 0) {
      return [
        '🏆 *LEADERBOARD DONASI* 🏆\n',
        'Belum ada donasi tercatat\\.',
        'Jadilah donatur pertama\\! 🎉\n',
        '/donasi \\- Info cara donasi',
      ].join('\n')
    }

    const medals = ['🥇', '🥈', '🥉']
    const lines: string[] = ['🏆 *LEADERBOARD DONASI* 🏆\n']
    top.forEach((entry, i) => {
      const prefix = medals[i] || `${i + 1}\\.`
      lines.push(
        `${prefix} ${escapeMarkdown(entry.member)} \\- ${escapeMarkdown(formatRupiah(entry.score))}`,
      )
    })
    lines.push('', '━━━━━━━━━━━━━━━━━━━')
    lines.push(`📊 Total donasi: ${escapeMarkdown(formatRupiah(Number(stats.total_donations)))}`)
    lines.push(`👥 Total donatur: ${escapeMarkdown(String(stats.unique_donors))} orang`)
    if (stats.last_donation_at) {
      lines.push(`🕐 Update terakhir: ${escapeMarkdown(formatTanggal(stats.last_donation_at))}`)
    }
    return lines.join('\n')
  }

  async function getMyLeaderboard(name: string): Promise<string> {
    const lowerName = name.toLowerCase()
    const [rank, score, totalDonors] = await Promise.all([
      leaderboardRepo.getRank(lowerName),
      leaderboardRepo.getScore(lowerName),
      leaderboardRepo.count(),
    ])

    if (rank === null || score === null) {
      return [
        '📊 *Peringkat Donasi Pribadi*\n',
        'Kamu belum tercatat sebagai donatur\\.',
        'Yuk donasi dulu\\! 🎉\n',
        '/donasi \\- Info cara donasi',
      ].join('\n')
    }

    return [
      '📊 *Peringkat Donasi Pribadi*\n',
      `👤 Nama: ${escapeMarkdown(name)}`,
      `💰 Total donasi: ${escapeMarkdown(formatRupiah(score))}`,
      `🏅 Peringkat: \\#${rank + 1} dari ${totalDonors} donatur`,
    ].join('\n')
  }

  return { getLeaderboard, getMyLeaderboard }
}

export type LeaderboardService = ReturnType<typeof createLeaderboardService>
