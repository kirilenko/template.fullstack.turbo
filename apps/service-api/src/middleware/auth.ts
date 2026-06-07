import type { Context, MiddlewareHandler } from 'hono'

import type { auth } from '../auth.js'

type AuthUser = typeof auth.$Infer.Session.user
type AuthSession = typeof auth.$Infer.Session.session

export type AuthEnv = {
  Variables: {
    user: AuthUser | null
    session: AuthSession | null
  }
}

export const requireAuth: MiddlewareHandler<AuthEnv> = async (c, next) => {
  if (!c.get('user')) return c.json({ error: 'Unauthorized' }, 401)
  await next()
}

export const requireAdmin: MiddlewareHandler<AuthEnv> = async (c, next) => {
  const user = c.get('user')
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  if (user.role !== 'admin') return c.json({ error: 'Forbidden' }, 403)
  await next()
}

export function getUser(c: Context): AuthUser {
  return c.get('user')!
}

export function getUserId(c: Context): string {
  return c.get('user')!.id
}
