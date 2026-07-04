export interface EnvConfig {
  TELEGRAM_BOT_TOKEN: string
  UPSTASH_REDIS_REST_URL: string
  UPSTASH_REDIS_REST_TOKEN: string
  TRAKTEER_WEBHOOK_TOKEN: string
  SAWERIA_SECRET: string
  TRAKTEER_URL?: string
  SAWERIA_URL?: string
  ADMIN_CHAT_ID?: string
  ENVIRONMENT?: 'production' | 'development'
}
