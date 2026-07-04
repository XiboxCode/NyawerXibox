# NyawerXibox — Agent Guide

## Commands
- `bun run dev` — `wrangler dev` (local dev server)
- `bun test` — `vitest run`
- `bun run test:watch` — `vitest` (watch mode)
- `bun run typecheck` — `tsc --noEmit`
- `bun run deploy` — `wrangler deploy`

## Architecture
4-layer: Route (`src/routes/`) → Service (`src/services/`) → Repository (`src/repositories/`) → Utils (`src/utils/`). No controllers/middleware. DI via Elysia `.derive()` lazy singleton in `src/index.ts:41`.

App built in `buildApp(env)` and cached across requests (`_cached` at `src/index.ts:58`).

## Critical Elysia/CF Worker Gotchas
- Import: `elysia/adapter/cloudflare-worker` (no `dist/` in path)
- `{ aot: false }` required in Elysia constructor (`src/index.ts:40`) + `CloudflareAdapter.beforeCompile` must be patched to no-op (`src/index.ts:20-22`) because `new Function` (AOT codegen) is blocked by CF Workers
- Must call `.compile()` before exporting (`src/index.ts:55`)
- Exported as `{ fetch, scheduled }` for CF Workers module format
- Env vars injected via `.derive()` — available as `ctx.env` in route handlers; cron handler receives `env` as function parameter directly

## Redis Quirks
- `@upstash/redis` v1: use `zrange(key, 0, 9, { rev: true })` not `zrevrange`
- `.set()` returns `Promise<string | null>` — cast as needed

## MarkdownV2
All Telegram messages use `parse_mode: 'MarkdownV2'`. Every response string must escape `_*[]()~`>#+\-=|{}.!` via `escapeMarkdown()` from `src/utils/formatter.ts`, then restore `\*` → `*` for intentional bold.

Helper pattern:
```ts
import { escapeMarkdown } from '../utils/formatter'
function fmt(s: string): string {
  return escapeMarkdown(s).replace(/\\\*/g, '*')
}
```
Apply `fmt()` to every string returned by service functions. Always escape user-controlled values (`entry.member`, `donator_name`, etc.) individually before interpolation (never after joining).

## Webhook Security
- **Trakteer**: constant-time comparison via XOR loop (`timingSafeEqual` in `src/routes/webhook.donation.ts:47`) on `X-Webhook-Token` header vs `TRAKTEER_WEBHOOK_TOKEN` env
- **Saweria**: constant-time comparison via same `timingSafeEqual` on `?secret=` query param vs `SAWERIA_SECRET` env (parsed via `new URL(url).searchParams` — `src/routes/webhook.donation.ts:57`)

Both bodies validated with `@sinclair/typebox` `Value.Check()` after security check.

## Cron
`*/5 * * * *` (`wrangler.toml:6`) retries `pending_notifications` from Redis list, max 5 attempts. Handler in `src/lib/cron.ts`, wired in `src/index.ts:scheduled`.

## Enqueue Quirk
`donation.service.ts:43` uses a **dynamic import** of `@upstash/redis` with `process.env` fallback to enqueue failed notifications — separate from the injected DI Redis instance. This is the only place raw `process.env` is used.

## Env Vars
9 vars in `.env.example`. Copy to `.dev.vars` for local dev. Deploy via `wrangler secret put <KEY>`. CI deploy workflow (`.github/workflows/deploy.yml`) needs `CF_API_TOKEN` secret.

## Testing
Tests in `tests/`. Vitest config at `vitest.config.ts` with `globals: true`. Currently one test file: `tests/services/command.service.test.ts` (3 tests covering MarkdownV2 formatting, leaderboard output, stats output).

## Adding a New Platform
1. Create `src/services/parsers/<platform>.ts` with a parse function returning `Donation`
2. Register it in `src/services/parsers/index.ts` (`parsers` + `platformNames`)
3. Add route `.post('/webhook/<platform>', ...)` in `src/routes/webhook.donation.ts`
4. Add env vars to `.env.example` and `src/types/config.ts`
No changes needed in service/repository layers.
