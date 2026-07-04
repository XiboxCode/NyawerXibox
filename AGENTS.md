# NyawerXibox — Agent Guide

## Commands
- `bun run typecheck` — `tsc --noEmit`
- `bun test` — `vitest run`
- `bun run dev` — `wrangler dev`
- `bun run deploy` — `wrangler deploy`

## Architecture
4-layer: Route (`src/routes/`) → Service (`src/services/`) → Repository (`src/repositories/`) → Utils (`src/utils/`). No controllers, no middleware. DI via Elysia `.derive()` lazy singleton in `src/index.ts:46`.

## Critical Elysia/CF Worker Gotchas
- Import: `elysia/adapter/cloudflare-worker` (no `dist/` in path)
- Must call `.compile()` before exporting (`src/index.ts:52`)
- Exported as `{ fetch, scheduled }` for CF Workers module format
- Env vars only accessible via `cloudflare.env` in handlers (not `import { env }`)
- `ctx.request` body is consumed after Elysia parses it — for raw body access, set `parse: 'text'` in route config and read `ctx.body` as string (see Saweria webhook in `src/routes/webhook.donation.ts`)

## Redis Quirks
- `@upstash/redis` v1: use `zrange(key, 0, 9, { rev: true })` not `zrevrange`
- `.set()` returns `Promise<string | null>` — cast as needed

## MarkdownV2
All Telegram messages use `parse_mode: 'MarkdownV2'` (`src/lib/telegram.ts`). Every response string must escape `_*[]()~`>#+\-=|{}.!` via `escapeMarkdown()` from `src/utils/formatter.ts`, then restore `\*` → `*` for intentional bold markers.

Helper pattern:
```ts
import { escapeMarkdown } from '../utils/formatter'
function fmt(s: string): string {
  return escapeMarkdown(s).replace(/\\\*/g, '*')
}
```
Apply `fmt()` to every string returned by service functions. Always escape user-controlled values (`entry.member`, `donator_name`, etc.) individually before interpolation.

## Webhook Security
- **Trakteer**: constant-time comparison via XOR loop (`timingSafeEqual` in `src/routes/webhook.donation.ts`)
- **Saweria**: HMAC-SHA256 via `crypto.subtle.sign` on raw body text — route uses `parse: 'text'` so `ctx.body` is raw string, validated before `JSON.parse`

## Cron
`*/5 * * * *` retries `pending_notifications` from Redis list, max 5 attempts. Handler in `src/lib/cron.ts`, wired in `src/index.ts:scheduled`.

## Env Vars
See `.env.example` for all 10 vars. Deploy via `wrangler secret put <KEY>`.

## Testing
Tests in `tests/`. Run `bun test`. Vitest config at `vitest.config.ts` with `globals: true`. Currently 3 tests for command service formatting.

## Adding a New Platform
1. Create `src/services/parsers/<platform>.ts` with a parse function
2. Register it in `src/services/parsers/index.ts` (`parsers` + `platformNames`)
3. Add route `.post('/webhook/<platform>', ...)` in `src/routes/webhook.donation.ts`
4. Add env vars to `.env.example` and `src/types/config.ts`
No changes needed in service/repository layers.
