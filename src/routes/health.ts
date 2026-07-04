import { Elysia } from 'elysia'

export function healthRoutes(app: Elysia) {
  return app.get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }))
}
