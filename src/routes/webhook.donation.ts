import { Elysia, t } from 'elysia'
import type { Context } from 'elysia'
import { Value } from '@sinclair/typebox/value'
import { TrakteerBodySchema, SaweriaBodySchema } from '../validators/donation'
import { timingSafeEqual, getSecretFromUrl } from '../utils/security'
import { errorResponse } from '../utils/error-response'
import type { EnvConfig } from '../types/config'
import type { DonationService } from '../services/donation.service'

type DonationRouteCtx = Context & {
  env: EnvConfig
  donationService: DonationService
}

export function webhookDonationRoutes(app: Elysia) {
  return app
    .post(
      '/webhook/trakteer',
      async (ctx: unknown) => {
        const { env, donationService, body, headers } = ctx as DonationRouteCtx
        try {
          const token = headers['x-webhook-token'] ?? ''
          if (!timingSafeEqual(token, env.TRAKTEER_WEBHOOK_TOKEN)) {
            console.warn('Trakteer: invalid token')
            return errorResponse(401, 'invalid signature')
          }
          if (!Value.Check(TrakteerBodySchema, body)) {
            const errors = [...Value.Errors(TrakteerBodySchema, body)]
            console.error('Trakteer: validation errors:', JSON.stringify(errors, null, 2))
            return errorResponse(400, 'invalid payload', errors)
          }
          const result = await donationService.process(body, 'trakteer')
          return result
        } catch (e: unknown) {
          console.error('Trakteer webhook error:', e)
          return errorResponse(500, 'internal error')
        }
      },
      { body: t.Any() },
    )
    .post(
      '/webhook/saweria',
      async (ctx: unknown) => {
        const { env, donationService, body, request } = ctx as DonationRouteCtx
        try {
          const querySecret = getSecretFromUrl(request.url)
          if (!querySecret) {
            console.warn('Saweria: missing secret query param')
            return errorResponse(400, 'missing secret')
          }
          if (!timingSafeEqual(querySecret, env.SAWERIA_SECRET)) {
            console.warn('Saweria: invalid secret')
            return errorResponse(401, 'invalid secret')
          }
          if (!Value.Check(SaweriaBodySchema, body)) {
            const errors = [...Value.Errors(SaweriaBodySchema, body)]
            console.error('Saweria: validation errors:', JSON.stringify(errors, null, 2))
            return errorResponse(400, 'invalid payload', errors)
          }
          const result = await donationService.process(body, 'saweria')
          return result
        } catch (e: unknown) {
          console.error('Saweria webhook error:', e)
          return errorResponse(500, 'internal error')
        }
      },
      { body: t.Any() },
    )
}
