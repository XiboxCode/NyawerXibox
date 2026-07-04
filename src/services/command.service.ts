import type { LeaderboardService } from './leaderboard.service'
import type { StatsService } from './stats.service'
import { escapeMarkdown } from '../utils/formatter'

export function createCommandService(
  leaderboardService: LeaderboardService,
  statsService: StatsService,
) {
  function start(): string {
    return [
      '🎉 Selamat datang di NyawerXibox\\!\n',
      'Saya adalah bot notifikasi donasi untuk streamer\\/creator\\.',
      'Saya akan mengirimkan notifikasi setiap kali ada donasi masuk\\.\n',
      '📋 *Daftar Command:*',
      '/leaderboard \\- Lihat 10 donatur teratas',
      '/donasi \\- Info cara donasi',
      '/stats \\- Statistik donasi',
      '/help \\- Bantuan lengkap\n',
      'Powered by NyawerXibox 🚀',
    ].join('\n')
  }

  function help(): string {
    return [
      '🆘 *Bantuan NyawerXibox*\n',
      'Bot ini menerima webhook dari Trakteer \\& Saweria',
      'dan mengirim notifikasi ke grup Telegram\\.\n',
      '*Command:*',
      '/leaderboard \\- Top 10 donatur',
      '/myleaderboard \\- Peringkat pribadi',
      '/donasi \\- Tautan donasi',
      '/stats \\- Statistik ringkas',
      '/setgroup \\- Set grup \\(admin only\\)\n',
      '*Cara Setup:*',
      '1\\. Tambah bot ke grup sebagai admin',
      '2\\. Kirim /setgroup di grup tersebut',
      '3\\. Konfigurasi webhook di Trakteer \\& Saweria',
      '   mengarah ke endpoint bot\n',
      'Ada pertanyaan? Hubungi creator bot\\.',
    ].join('\n')
  }

  function donasi(trakteerUrl?: string, saweriaUrl?: string): string {
    const lines: string[] = [
      '💝 *Dukung Creator\\!*\n',
      'Kamu bisa donasi melalui platform berikut:\n',
    ]
    if (trakteerUrl) lines.push(`🔗 Trakteer: ${escapeMarkdown(trakteerUrl)}`)
    if (saweriaUrl) lines.push(`🔗 Saweria: ${escapeMarkdown(saweriaUrl)}`)
    lines.push('\nTerima kasih atas dukungannya\\! 🙏')
    return lines.join('\n')
  }

  function info(): string {
    return [
      'ℹ️ *NyawerXibox*\n',
      'Bot notifikasi donasi Trakteer \\& Saweria',
      'Versi: 1\\.0\\.0',
      'Runtime: Cloudflare Workers \\+ Elysia\\.js',
      'Database: Upstash Redis',
    ].join('\n')
  }

  function setGroupSuccess(): string {
    return [
      '✅ Grup ini telah diatur sebagai target notifikasi donasi\\.',
      'Semua notifikasi donasi akan dikirim ke grup ini\\.',
    ].join('\n')
  }

  function setGroupDenied(): string {
    return '⛔ Maaf, command ini hanya untuk admin grup\\.'
  }

  return {
    start,
    help,
    donasi,
    info,
    setGroupSuccess,
    setGroupDenied,
    getLeaderboard: () => leaderboardService.getLeaderboard(),
    getMyLeaderboard: (name: string) =>
      leaderboardService.getMyLeaderboard(name),
    getStats: () => statsService.getStats(),
  }
}

export type CommandService = ReturnType<typeof createCommandService>
