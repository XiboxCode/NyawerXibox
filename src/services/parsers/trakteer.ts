import type { Donation, TrakteerWebhookPayload } from '../../types/donation'

export function parseTrakteer(payload: TrakteerWebhookPayload): Donation {
  return {
    source: 'trakteer',
    donator_name: payload.supporter_name,
    amount: payload.price,
    net_amount: payload.net_amount,
    message: payload.supporter_message ?? '',
    timestamp: payload.created_at,
    raw_id: payload.transaction_id,
    unit: payload.unit,
    quantity: payload.quantity,
    media: payload.media ? JSON.stringify(payload.media) : null,
  }
}
