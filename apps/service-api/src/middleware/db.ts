import type { MiddlewareHandler } from 'hono'

import { createDb, type Database } from '../db/index.js'

let db: Database | undefined

export const dbMiddleware: MiddlewareHandler<{
  Variables: { db: Database }
}> = async (c, next) => {
  if (!db) {
    const url = process.env.DATABASE_URL
    if (!url) return c.json({ error: 'Database not configured' }, 503)
    db = createDb(url)
  }
  c.set('db', db)
  await next()
}
