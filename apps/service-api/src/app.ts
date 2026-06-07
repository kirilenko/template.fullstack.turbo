import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

import { auth } from './auth.js'
import { requireAdmin } from './middleware/auth.js'
import { health } from './routes/health.js'
import { usersRoute } from './routes/users.js'

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null
    session: typeof auth.$Infer.Session.session | null
  }
}>()
  .use('*', logger())
  .use(
    '*',
    cors({
      origin: (process.env.PUBLIC_APP_URL ?? '').split(',').map((u) => u.trim()).filter(Boolean),
      credentials: true,
    }),
  )
  .use('*', async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    c.set('user', session?.user ?? null)
    c.set('session', session?.session ?? null)
    await next()
  })
  .on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))
  .route('/', health)
  .route('/api/users', usersRoute)

// Example admin-only route group — extend with your own routes
const adminRoute = new Hono()
  .use(requireAdmin)
  .get('/stats', (c) => c.json({ message: 'Admin stats — implement me' }))

app.route('/api/admin', adminRoute)

app.notFound((c) => c.json({ error: 'Not found' }, 404))
app.onError((err, c) => {
  console.error(err)
  return c.json({ error: 'Internal server error' }, 500)
})

export type AppType = typeof app
export { app }
