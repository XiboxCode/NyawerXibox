import type { Donation } from '../../types/donation'
import { parseTrakteer } from './trakteer'
import { parseSaweria } from './saweria'

export type Parser = (payload: any) => Donation

export const parsers: Record<string, Parser> = {
  trakteer: parseTrakteer,
  saweria: parseSaweria,
}

export const platformNames: Record<string, string> = {
  trakteer: 'Trakteer',
  saweria: 'Saweria',
}
