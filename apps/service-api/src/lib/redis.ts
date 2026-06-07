import type { ConnectionOptions } from 'bullmq'

export function getRedisConnection(): ConnectionOptions {
  const url = process.env.REDIS_URL
  if (!url) throw new Error('REDIS_URL is not configured')

  const parsed = new URL(url)
  return {
    db: parsed.pathname ? Number(parsed.pathname.slice(1)) || 0 : 0,
    host: parsed.hostname,
    password: parsed.password || undefined,
    port: Number(parsed.port) || 6379,
  }
}
