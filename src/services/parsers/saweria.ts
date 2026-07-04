import type { Donation, SaweriaWebhookPayload } from '../../types/donation'

export function parseSaweria(payload: SaweriaWebhookPayload): Donation {
  return {
    source: 'saweria',
    donator_name: payload.donator_name,
    amount: payload.amount_raw,
    net_amount: payload.amount_raw - payload.cut,
    message: payload.message ?? '',
    timestamp: payload.created_at,
    raw_id: payload.id,
    unit: '',
    quantity: 1,
    media: null,
  }
}
