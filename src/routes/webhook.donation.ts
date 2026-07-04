import { Elysia, t } from 'elysia'
import { Value } from '@sinclair/typebox/value'
import type { EnvConfig } from '../types/config'

const TrakteerBodySchema = t.Object({
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

const SaweriaBodySchema = t.Object({
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

function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder()
  const aBuf = enc.encode(a)
  const bBuf = enc.encode(b)
  if (aBuf.length !== bBuf.length) return false
  let result = 0
  for (let i = 0; i < aBuf.length; i++) result |= aBuf[i] ^ bBuf[i]
  return result === 0
}

function getSecretFromUrl(url: string): string | null {
  try {
    return new URL(url).searchParams.get('secret')
  } catch {
    return null
  }
}

export function webhookDonationRoutes(app: Elysia) {
  return app
    .post(
      '/webhook/trakteer',
      async (ctx: any) => {
        try {
          const body = ctx.body as any
          const env = ctx.env as EnvConfig
          const donationService = ctx.donationService
          if (
            !timingSafeEqual(
              ctx.headers['x-webhook-token'] ?? '',
              env.TRAKTEER_WEBHOOK_TOKEN,
            )
          ) {
            console.warn('Trakteer: invalid token')
            return new Response(
              JSON.stringify({ error: 'invalid signature' }),
              { status: 401 },
            )
          }
          if (!Value.Check(TrakteerBodySchema, body)) {
            const errors = [...Value.Errors(TrakteerBodySchema, body)]
            console.error('Trakteer: validation errors:', JSON.stringify(errors, null, 2))
            return new Response(
              JSON.stringify({ error: 'invalid payload', details: errors }),
              { status: 400 },
            )
          }
          const result = await donationService.process(body, 'trakteer')
          return { status: 'ok', ...result }
        } catch (e) {
          console.error('Trakteer webhook error:', e)
          return new Response(
            JSON.stringify({ error: 'internal error' }),
            { status: 500 },
          )
        }
      },
      {
        body: t.Any(),
      },
    )
    .post(
      '/webhook/saweria',
      async (ctx: any) => {
        try {
          const body = ctx.body as any
          const env = ctx.env as EnvConfig
          const donationService = ctx.donationService
          const querySecret = getSecretFromUrl(ctx.request.url)
          if (!querySecret) {
            console.warn('Saweria: missing secret query param')
            return new Response(
              JSON.stringify({ error: 'missing secret' }),
              { status: 400 },
            )
          }
          if (!timingSafeEqual(querySecret, env.SAWERIA_SECRET)) {
            console.warn('Saweria: invalid secret', {
              queryLen: querySecret.length,
            })
            return new Response(
              JSON.stringify({ error: 'invalid secret' }),
              { status: 401 },
            )
          }
          if (!Value.Check(SaweriaBodySchema, body)) {
            const errors = [...Value.Errors(SaweriaBodySchema, body)]
            console.error('Saweria: validation errors:', JSON.stringify(errors, null, 2))
            return new Response(
              JSON.stringify({ error: 'invalid payload', details: errors }),
              { status: 400 },
            )
          }
          const result = await donationService.process(body, 'saweria')
          return { status: 'ok', ...result }
        } catch (e) {
          console.error('Saweria webhook error:', e)
          return new Response(
            JSON.stringify({ error: 'internal error' }),
            { status: 500 },
          )
        }
      },
      {
        body: t.Any(),
      },
    )
}
