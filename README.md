# NyawerXibox

NyawerXibox is a Telegram bot that provides donation notifications from Trakteer and Saweria, along with a donator leaderboard. Runs serverless on Cloudflare Workers with Upstash Redis.

## Key Features

- **Real-time Donation Notifications**: Sends incoming donation notifications from Trakteer and Saweria directly to the target Telegram group.
- **Donator Leaderboard**: Displays the top 10 donators based on cumulative donation amounts.
- **Donation Statistics**: Provides a quick summary of total donations, unique donators, transaction count, and the last donation time.
- **Flexible Group Configuration**: Group administrators configure the notification target via `/setgroup`.
- **Notification Retry**: Retries pending notifications every 5 minutes (cron), max 5 attempts.
- **Secure Webhook Verification**:
  - Trakteer: constant-time token comparison via `X-Webhook-Token` header.
  - Saweria: constant-time secret comparison via `?secret=` query parameter.

## Tech Stack

- **Runtime**: Cloudflare Workers (Elysia Cloudflare adapter)
- **Framework**: Elysia.js (non-AOT mode, `aot: false`, dynamic handlers)
- **Database**: Upstash Redis v1
- **Local Runtime**: Bun
- **Testing**: Vitest
- **Validation**: @sinclair/typebox (runtime via `Value.Check()`, no `new Function()`)

## Architecture

4-layer: Route → Service → Repository → Utils.

- **Routes** (`src/routes/`): HTTP endpoints (webhooks, health check). No controllers or middleware.
- **Services** (`src/services/`): Business logic (donation processing, leaderboard, stats, commands).
- **Repositories** (`src/repositories/`): Data access layer (Redis via @upstash/redis).
- **Utils** (`src/utils/`): Helpers (`formatRupiah`, `escapeMarkdown`, `generateDonationId`).
- **Parsers** (`src/services/parsers/`): Platform-specific payload parsers. Register new platforms here.

Dependency injection via Elysia `.derive()` lazy singleton in `src/index.ts`.

## Environment Variables

Copy `.env.example` to `.dev.vars` for local development, or configure via `wrangler secret put <KEY>` for production.

| Variable | Required | Description |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Yes | Telegram Bot API token (from @BotFather) |
| `UPSTASH_REDIS_REST_URL` | Yes | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Yes | Upstash Redis REST token |
| `TRAKTEER_WEBHOOK_TOKEN` | Yes | Webhook token from Trakteer integration settings |
| `SAWERIA_SECRET` | Yes | Your own secret string. Must match the `?secret=` query param in Saweria webhook URL |
| `TRAKTEER_URL` | No | Profile link for /donasi command |
| `SAWERIA_URL` | No | Profile link for /donasi command |
| `ADMIN_CHAT_ID` | No | Telegram chat ID for system error notifications (cron retry failures) |
| `ENVIRONMENT` | No | `development` or `production` |

## Webhook Setup

### Trakteer
1. Set `TRAKTEER_WEBHOOK_TOKEN` in `.dev.vars` (or `wrangler secret put`).
2. In Trakteer dashboard → Integrasi → Webhook, set URL to `https://your-worker.workers.dev/webhook/trakteer`.
3. Copy the token from Trakteer dashboard to `.dev.vars`.

### Saweria
1. Generate a random secret (e.g. `openssl rand -hex 16`).
2. Set `SAWERIA_SECRET=<secret>` in `.dev.vars`.
3. In Saweria dashboard, set webhook URL to `https://your-worker.workers.dev/webhook/saweria?secret=<same_secret>`.

## Development Scripts

- `bun run dev` — Start local dev server (Wrangler).
- `bun run test` — Run unit tests (Vitest).
- `bun run typecheck` — TypeScript type check (`tsc --noEmit`).
- `bun run deploy` — Deploy to Cloudflare Workers (`wrangler deploy`).
