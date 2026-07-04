#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────
# deploy.sh — Deploy NyawerXibox ke Cloudflare Workers
# ──────────────────────────────────────────────
# 1. Baca environment variables dari file (default: .dev.vars)
# 2. Upload semua secret ke Cloudflare
# 3. Deploy worker
# ──────────────────────────────────────────────

PASS="\033[32m\u2713\033[0m"
FAIL="\033[31m\u2717\033[0m"
BOLD="\033[1m"
NC="\033[0m"

env_file="${1:-.dev.vars}"

echo ""
echo -e "${BOLD}NyawerXibox — Deploy ke Cloudflare Workers${NC}"
echo ""

# ── Step 0: Validasi file env ──
if [ ! -f "$env_file" ]; then
  echo -e "${FAIL} File environment '$env_file' tidak ditemukan."
  echo ""
  echo "  Buat file .dev.vars dari contoh:"
  echo "    cp .env.example .dev.vars"
  echo ""
  echo "  Lalu isi semua nilai yang diperlukan."
  echo "  Alternatif: bash $0 <path-ke-file-env>"
  exit 1
fi

total=$(grep -v '^#' "$env_file" | grep -v '^$' | wc -l || true)
echo -e "  ${PASS} File $env_file ditemukan ($total variable)"
echo ""

# ── Step 1: CF_API_TOKEN ──
echo -e "${BOLD}[1/3] Autentikasi Cloudflare${NC}"
echo "  Untuk deploy, kamu perlu CF_API_TOKEN dari Cloudflare Dashboard."
echo "  Cara buat: https://dash.cloudflare.com/profile/api-tokens"
echo "  Required permissions: Workers > Edit, Account Resources > Workers Scripts > Edit"
echo ""

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
  echo "  Token tidak ditemukan di environment."
  echo -n "  Masukkan CF_API_TOKEN (input tidak akan tampil): "
  read -rs CLOUDFLARE_API_TOKEN
  echo ""
  echo ""
  export CLOUDFLARE_API_TOKEN
else
  echo -e "  ${PASS} CLOUDFLARE_API_TOKEN terbaca dari environment"
  echo ""
fi

# ── Step 2: Upload secrets ──
echo -e "${BOLD}[2/3] Mengupload secret environment variables${NC}"
echo "  Setiap variable dari $env_file akan diupload sebagai secret"
echo "  ke Cloudflare Workers via wrangler secret put"
echo ""

while IFS='=' read -r key value; do
  [ -z "$key" ] && continue
  [[ "$key" == *"#"* ]] && continue
  echo "$value" | wrangler secret put "$key" &>/dev/null
  echo -e "  ${PASS} $key"
done < <(grep -v '^#' "$env_file" | grep -v '^$' || true)
echo ""

# ── Step 3: Deploy ──
echo -e "${BOLD}[3/3] Deploy${NC}"
echo "  Menjalankan wrangler deploy..."
echo ""

deploy_output=$(wrangler deploy 2>&1)
echo "$deploy_output"

# Ambil URL worker dari output deploy
worker_url=$(echo "$deploy_output" | grep -oE 'https?://[^ ]+\.workers\.dev' | head -1)

echo ""
echo -e "${BOLD}Selesai!${NC}"
echo ""

if [ -n "$worker_url" ]; then
  echo "  Worker URL: $worker_url"
  echo ""
  echo "  Setup webhook Telegram:"
  echo "    bash scripts/set-webhook.sh $worker_url"
  echo ""
  echo "  Setup dashboard donasi:"
  echo "    Trakteer: $worker_url/webhook/trakteer"
  if grep -q '^SAWERIA_SECRET=' "$env_file" 2>/dev/null; then
    echo "    Saweria:  $worker_url/webhook/saweria?secret=<SAWERIA_SECRET>"
  fi
  echo ""
  echo "  Setelah itu, kirim /setgroup di grup Telegram target."
fi
echo ""
