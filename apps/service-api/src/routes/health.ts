import { Hono } from 'hono'

const health = new Hono().get('/', (c) =>
  c.json({ service: process.env.APP_NAME ?? 'service-api', status: 'ok' }),
)

export { health }
