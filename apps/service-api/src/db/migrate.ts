import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    console.error('[migrate] DATABASE_URL is required')
    process.exit(1)
  }

  console.log('[migrate] Connecting to database...')
  const client = postgres(databaseUrl, { max: 1 })
  const db = drizzle(client)

  console.log('[migrate] Running migrations...')
  try {
    await migrate(db, { migrationsFolder: './drizzle' })
    console.log('[migrate] Done')
  } catch (error) {
    console.error('[migrate] Failed:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

runMigrations().catch((error: unknown) => {
  console.error('[migrate] Unexpected error:', error)
  process.exit(1)
})
