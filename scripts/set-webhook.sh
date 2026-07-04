#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────
# set-webhook.sh — Set webhook Telegram Bot
# ──────────────────────────────────────────────
# Mendaftarkan URL worker ke Telegram Bot API
# agar Telegram mengirim update ke worker.
# ──────────────────────────────────────────────

PASS="\033[32m\u2713\033[0m"
FAIL="\033[31m\u2717\033[0m"
BOLD="\033[1m"
NC="\033[0m"
env_file=".dev.vars"

echo ""
echo -e "${BOLD}Setup Webhook Telegram${NC}"
echo ""

# ── Ambil worker_url ──
if [ $# -ge 1 ]; then
  worker_url="${1%/}"
else
  echo -n "  Masukkan URL worker (contoh: https://nyawer-xibox.<subdomain>.workers.dev): "
  read -r worker_url
  worker_url="${worker_url%/}"
  echo ""
fi

if [[ ! "$worker_url" =~ ^https?://[a-zA-Z0-9._-]+\.workers\.dev$ ]] && \
   [[ ! "$worker_url" =~ ^https?://[a-zA-Z0-9._-]+\.[a-zA-Z]{2,} ]]; then
  echo -e "${FAIL} URL tidak valid. Contoh: https://nyawer-xibox.<subdomain>.workers.dev"
  exit 1
fi

telegram_url="$worker_url/webhook/telegram"

# ── Ambil TELEGRAM_BOT_TOKEN ──
if [ -z "${TELEGRAM_BOT_TOKEN:-}" ]; then
  if [ -f "$env_file" ]; then
    token=$(grep '^TELEGRAM_BOT_TOKEN=' "$env_file" | cut -d= -f2- || true)
  fi
fi

if [ -z "${token:-}" ]; then
  echo "  Telegram Bot Token diperlukan. Dapatkan dari @BotFather."
  echo -n "  Masukkan TELEGRAM_BOT_TOKEN: "
  read -rs token
  echo ""
  echo ""
fi

echo "  Mendaftarkan webhook ke Telegram API..."
echo "    URL: $telegram_url"
echo ""

# ── Panggil setWebhook ──
res=$(curl -s "https://api.telegram.org/bot$token/setWebhook?url=$telegram_url")

# Parse response
if command -v jq &>/dev/null; then
  ok=$(echo "$res" | jq -r '.ok')
  desc=$(echo "$res" | jq -r '.description // empty')
else
  ok=$(echo "$res" | grep -o '"ok":[^,}]*' | cut -d: -f2 || echo "false")
  desc=$(echo "$res" | grep -o '"description":"[^"]*"' | cut -d\" -f4 || echo "")
fi

if [ "$ok" = "true" ]; then
  echo -e "${PASS} Webhook berhasil didaftarkan!"
  echo ""
  echo "  Telegram akan mengirim update ke:"
  echo "    $telegram_url"
  echo ""
  echo "  Verifikasi dengan:"
  echo "    curl -s https://api.telegram.org/bot<TOKEN>/getWebhookInfo | jq ."
else
  echo -e "${FAIL} Gagal: ${desc:-'(tidak ada detail)'}"
  echo ""
  echo "  Periksa token dan URL, lalu coba lagi."
  exit 1
fi
echo ""
