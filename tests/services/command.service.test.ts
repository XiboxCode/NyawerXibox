import { describe, it, expect, vi } from 'vitest'
import { createCommandService } from '../../src/services/command.service'
import { createLeaderboardService } from '../../src/services/leaderboard.service'
import { createStatsService } from '../../src/services/stats.service'

describe('Command Service & Formatting Tests', () => {
  it('should format start command without double escaping or unescaped dots/dashes', () => {
    const mockLeaderboardService = {} as any
    const mockStatsService = {} as any
    const service = createCommandService(mockLeaderboardService, mockStatsService)

    const startText = service.start()
    
    // Check that '.' is escaped (e.g. 'streamer\/creator\.' or 'masuk\.')
    expect(startText).toContain('streamer\\/creator\\.')
    expect(startText).toContain('masuk\\.')
    // Bold tags should be unescaped '*'
    expect(startText).toContain('*Daftar Command:*')
    // Standard hyphen should be escaped
    expect(startText).toContain('\\- Lihat 10 donatur')
    // No double backslashes for standard escapes
    expect(startText).not.toContain('\\\\.')
    expect(startText).not.toContain('\\\\-')
  })

  it('should escape leaderboard user input exactly once and avoid double escaping', async () => {
    const mockLeaderboardRepo = {
      getTop: vi.fn().mockResolvedValue([
        { member: 'budi_tampan', score: 50000 }
      ]),
    } as any
    const mockStatsRepo = {
      get: vi.fn().mockResolvedValue({
        total_donations: '50000',
        unique_donors: 1,
        last_donation_at: '2026-07-04T12:00:00Z'
      }),
    } as any

    const service = createLeaderboardService(mockLeaderboardRepo, mockStatsRepo)
    const result = await service.getLeaderboard()

    // Budi's underscore should be escaped once (budi\_tampan) but not twice (budi\\_tampan)
    expect(result).toContain('budi\\_tampan')
    expect(result).not.toContain('budi\\\\_tampan')
    
    // The dot in Rp50.000 should be escaped once (Rp50\.000)
    expect(result).toContain('Rp50\\.000')
    expect(result).not.toContain('Rp50\\\\.000')
    
    // Check dot at the end of 'Belum ada donasi tercatat' is not evaluated here since top.length > 0
    expect(result).toContain('🏆 *LEADERBOARD DONASI* 🏆')
  })

  it('should escape stats output correctly', async () => {
    const mockStatsRepo = {
      get: vi.fn().mockResolvedValue({
        total_donations: '150000',
        unique_donors: 2,
        total_transactions: 3,
        last_donation_at: '2026-07-04T12:00:00Z'
      }),
    } as any
    const mockLeaderboardRepo = {
      getTop: vi.fn().mockResolvedValue([
        { member: 'budi(tampan)', score: 100000 }
      ]),
    } as any

    const service = createStatsService(mockStatsRepo, mockLeaderboardRepo)
    const result = await service.getStats()

    // Budi's parentheses should be escaped once (budi\(tampan\))
    expect(result).toContain('budi\\(tampan\\)')
    expect(result).not.toContain('budi\\\\(tampan\\\\)')
    
    // Dots in money should be escaped
    expect(result).toContain('Rp150\\.000')
    expect(result).toContain('Rp100\\.000')
  })
})
