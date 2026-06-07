import { serve } from '@hono/node-server'

import { app } from './app.js'

const port = Number(process.env.PORT) || 3001
const hostname = process.env.BIND_HOST || '0.0.0.0'

const server = serve({ fetch: app.fetch, hostname, port }, (info) => {
  console.log(`service-api listening on http://${hostname}:${info.port}`)
})

const shutdown = () => {
  console.log('Shutting down...')
  server.close(() => process.exit(0))
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
