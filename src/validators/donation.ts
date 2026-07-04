import { t } from 'elysia'

export const TrakteerBodySchema = t.Object({
  created_at: t.String(),
  transaction_id: t.String(),
  type: t.Literal('tip'),
  supporter_name: t.String(),
  supporter_avatar: t.Optional(t.String()),
  supporter_message: t.Optional(t.String()),
  media: t.Optional(t.Union([
    t.Null(),
    t.Object({
      gif: t.Optional(t.String()),
      video: t.Optional(t.Object({
        type: t.String(),
        id: t.String(),
        start: t.Number(),
      })),
      voice: t.Optional(t.String()),
    }),
  ])),
  unit: t.String(),
  unit_icon: t.Optional(t.String()),
  quantity: t.Number(),
  price: t.Number(),
  net_amount: t.Number(),
}, { additionalProperties: true })

export const SaweriaBodySchema = t.Object({
  version: t.String(),
  created_at: t.String(),
  id: t.String(),
  type: t.Literal('donation'),
  amount_raw: t.Number(),
  cut: t.Number(),
  donator_name: t.String(),
  donator_email: t.Optional(t.String()),
  donator_is_user: t.Boolean(),
  message: t.Optional(t.String()),
  etc: t.Object({
    amount_to_display: t.Number(),
  }),
}, { additionalProperties: true })
