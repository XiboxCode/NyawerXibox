# NyawerXibox

[![Deploy](https://github.com/XiboxCode/NyawerXibox/actions/workflows/deploy.yml/badge.svg)](https://github.com/XiboxCode/NyawerXibox/actions/workflows/deploy.yml)

NyawerXibox is a Telegram bot that provides donation notifications from Trakteer and Saweria, along with a donator leaderboard. Runs serverless on Cloudflare Workers with Upstash Redis.

## Key Features

- **Real-time Donation Notifications**: Sends incoming donation notifications from Trakteer and Saweria directly to the target Telegram group.
- **Donator Leaderboard**: Displays the top 10 donators based on cumulative donation amounts.
- **Donation Statistics**: Provides a quick summary of total donations, unique donators, transaction count, and the last donation time.
- **Flexible Group Configuration**: Group administrators configure the notification target via `/setgroup`.
- **Notification Retry**: Retries pending notifications every 5 minutes (cron), max 5 attempts, with admin alert on exhaustion.
- **Secure Webhook Verification**:
  - Trakteer: constant-time token comparison via `X-Webhook-Token` header.
  - Saweria: constant-time secret comparison via `?secret=` query parameter.

> [!IMPORTANT]
>
> - Bot: [@nyawerxibox_bot](https://t.me/nyawerxibox_bot)
> - Community: [t.me/xiboxcode_community](https://t.me/xiboxcode_community)
> - Trakteer: <https://trakteer.id/ikhsan3adi>
> - Saweria: <https://saweria.co/xiboxann>

## Installation

### 1. Prerequisites
- [Bun](https://bun.sh) - JavaScript runtime
- [Cloudflare](https://dash.cloudflare.com) account (free tier)
- [Upstash Redis](https://upstash.com) database (free tier)
- Telegram bot token from [@BotFather](https://t.me/BotFather)

### 2. Clone and install
```bash
git clone https://github.com/XiboxCode/NyawerXibox.git
cd NyawerXibox
bun install
```

### 3. Setup environment
```bash
cp .env.example .dev.vars
```
Fill in all values in `.dev.vars`:
- `TELEGRAM_BOT_TOKEN` - token from @BotFather
- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` - from Upstash dashboard
- `TRAKTEER_WEBHOOK_TOKEN` - from Trakteer dashboard (Integrasi > Webhook)
- `SAWERIA_SECRET` - generate your own, e.g. `openssl rand -hex 16`

### 4. Deploy
```bash
bun run deploy:full
```
The script will prompt for `CF_API_TOKEN` (create at [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens) - permission: Workers Edit), upload all secrets, and deploy the worker.

### 5. Setup Telegram webhook
```bash
bun run webhook:set -- https://nyawer-xibox.<subdomain>.workers.dev
```

### 6. Setup donation dashboard
| Platform | Webhook URL                                                                            |
| -------- | -------------------------------------------------------------------------------------- |
| Trakteer | `https://nyawer-xibox.<subdomain>.workers.dev/webhook/trakteer`                        |
| Saweria  | `https://nyawer-xibox.<subdomain>.workers.dev/webhook/saweria?secret=<SAWERIA_SECRET>` |

### 7. Final steps
1. **@BotFather** > `/setprivacy` > select bot > **Disable**
2. Add bot to your Telegram group
3. Send `/setgroup` in the group

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Elysia.js
- **Database**: Upstash Redis
- **Local Runtime**: Bun
- **Testing**: Vitest
- **Validation**: @sinclair/typebox

## Architecture

4-layer: Route > Service > Repository > Utils.

- **Routes** (`src/routes/`): HTTP endpoints (webhooks, health check). No controllers or middleware.
- **Services** (`src/services/`): Business logic (donation processing, leaderboard, stats, commands).
- **Repositories** (`src/repositories/`): Data access layer (Redis via @upstash/redis).
- **Utils** (`src/utils/`): Helpers (`formatRupiah`, `escapeMarkdown`, `generateDonationId`, `error-response`, `security`).
- **Validators** (`src/validators/`): TypeBox schemas for webhook payload validation.
- **Parsers** (`src/services/parsers/`): Platform-specific payload parsers. Register new platforms here.

Dependency injection via Elysia `.derive()` lazy singleton in `src/index.ts`.

## Environment Variables

Copy `.env.example` to `.dev.vars` for local development, or use `wrangler secret put <KEY>` for production.

| Variable                   | Required | Description                                                                          |
| -------------------------- | -------- | ------------------------------------------------------------------------------------ |
| `TELEGRAM_BOT_TOKEN`       | Yes      | Telegram Bot API token (from @BotFather)                                             |
| `UPSTASH_REDIS_REST_URL`   | Yes      | Upstash Redis REST URL                                                               |
| `UPSTASH_REDIS_REST_TOKEN` | Yes      | Upstash Redis REST token                                                             |
| `TRAKTEER_WEBHOOK_TOKEN`   | Yes      | Webhook token from Trakteer integration settings                                     |
| `SAWERIA_SECRET`           | Yes      | Your own secret string. Must match the `?secret=` query param in Saweria webhook URL |
| `TRAKTEER_URL`             | No       | Profile link for /donasi command                                                     |
| `SAWERIA_URL`              | No       | Profile link for /donasi command                                                     |
| `ADMIN_CHAT_ID`            | No       | Telegram chat ID for cron retry failure alerts                                       |
| `ENVIRONMENT`              | No       | `development` or `production`                                                        |

## Scripts

- `bun run dev` - Start local dev server (Wrangler)
- `bun run test` - Run unit tests (Vitest)
- `bun run typecheck` - TypeScript type check (`tsc --noEmit`)
- `bun run deploy` - Deploy to Cloudflare Workers
- `bun run deploy:full` - Upload secrets + deploy
- `bun run webhook:set -- <url>` - Set Telegram webhook
