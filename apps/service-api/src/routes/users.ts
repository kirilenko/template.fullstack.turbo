import { zValidator } from '@hono/zod-validator'
import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'

import type { Database } from '../db/index.js'
import { users } from '../db/schema/index.js'
import type { AuthEnv } from '../middleware/auth.js'
import { getUserId, requireAuth } from '../middleware/auth.js'
import { dbMiddleware } from '../middleware/db.js'

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
})

type Env = AuthEnv & { Variables: { db: Database } }

type UserRow = {
  id: string; name: string; email: string; role: string | null
  emailVerified: boolean; image: string | null
  createdAt: string; updatedAt: string
}

export const usersRoute = new Hono<Env>()
  .use(requireAuth)
  .use(dbMiddleware)

  .get('/me', async (c) => {
    const db = c.var.db
    const userId = getUserId(c)

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)

    if (!user) return c.json({ error: 'User not found' }, 404)

    return c.json(user as unknown as UserRow)
  })

  .patch('/me', zValidator('json', updateProfileSchema), async (c) => {
    const db = c.var.db
    const userId = getUserId(c)
    const data = c.req.valid('json')

    const [updated] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning()

    return c.json(updated as unknown as UserRow)
  })

  .delete('/me', async (c) => {
    const db = c.var.db
    const userId = getUserId(c)

    await db.delete(users).where(eq(users.id, userId))

    return c.json({ success: true })
  })
