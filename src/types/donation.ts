export interface TrakteerWebhookPayload {
  created_at: string
  transaction_id: string
  type: 'tip'
  supporter_name: string
  supporter_avatar?: string
  supporter_message?: string
  media?: {
    gif?: string
    video?: { type: string; id: string; start: number }
    voice?: string
  }
  unit: string
  unit_icon?: string
  quantity: number
  price: number
  net_amount: number
}

export interface SaweriaWebhookPayload {
  version: string
  created_at: string
  id: string
  type: 'donation'
  amount_raw: number
  cut: number
  donator_name: string
  donator_email?: string
  donator_is_user: boolean
  message?: string
  etc: {
    amount_to_display: number
  }
}

export interface Donation {
  source: 'trakteer' | 'saweria'
  donator_name: string
  amount: number
  net_amount: number
  message: string
  timestamp: string
  raw_id: string
  unit: string
  quantity: number
  media: string | null
}
