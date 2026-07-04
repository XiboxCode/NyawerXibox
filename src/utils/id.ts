export function generateDonationId(
  source: string,
  raw_id: string,
): string {
  return `don:${source}:${raw_id}`
}
