import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema/index.js'

export function createDb(url: string) {
  const client = postgres(url)
  return drizzle(client, { schema })
}

export type Database = ReturnType<typeof createDb>

let dbInstance: Database | undefined

export function getDb(): Database {
  if (!dbInstance) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('DATABASE_URL is not configured')
    dbInstance = createDb(url)
  }
  return dbInstance
}
