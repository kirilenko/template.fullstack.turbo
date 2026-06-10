import { zValidator } from '@hono/zod-validator'
import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'

import type { Database } from '../db/index.js'
import { news, users } from '../db/schema/index.js'
import type { AuthEnv } from '../middleware/auth.js'
import { getUser, requireAdmin } from '../middleware/auth.js'
import { dbMiddleware } from '../middleware/db.js'

type Env = AuthEnv & { Variables: { db: Database } }

// Explicit serialized shapes — Drizzle returns Date for timestamps,
// but JSON.stringify converts them to ISO strings. These types reflect runtime reality.
type UserRow = {
  id: string; name: string; email: string; role: string | null
  emailVerified: boolean; createdAt: string
}
type NewsRow = {
  id: string; title: string; content: string; published: boolean
  createdAt: string; updatedAt: string
}

const createNewsSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  published: z.boolean().default(false),
})

const updateNewsSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  published: z.boolean().optional(),
})

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.enum(['admin', 'user']).optional(),
})

const userFields = {
  id: users.id,
  name: users.name,
  email: users.email,
  role: users.role,
  emailVerified: users.emailVerified,
  createdAt: users.createdAt,
}

export const adminRoute = new Hono<Env>()
  .use(requireAdmin)

  .get('/stats', (c) => c.json({ message: 'Admin stats — implement me' }))

  .get('/users', dbMiddleware, async (c) => {
    const db = c.var.db
    const result = await db.select(userFields).from(users).orderBy(users.createdAt)
    return c.json(result as unknown as UserRow[])
  })

  .patch(
    '/users/:id',
    dbMiddleware,
    zValidator('json', updateUserSchema),
    async (c) => {
      const db = c.var.db
      const id = c.req.param('id')
      const data = c.req.valid('json')

      const [updated] = await db
        .update(users)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning(userFields)

      if (!updated) return c.json({ error: 'User not found' }, 404)
      return c.json(updated as unknown as UserRow)
    },
  )

  .delete('/users/:id', dbMiddleware, async (c) => {
    const db = c.var.db
    const id = c.req.param('id')
    const currentUser = getUser(c)

    if (id === currentUser.id) {
      return c.json({ error: 'Нельзя удалить свой аккаунт' }, 400)
    }

    await db.delete(users).where(eq(users.id, id))
    return c.json({ success: true })
  })

  // --- News ---

  .get('/news', dbMiddleware, async (c) => {
    const db = c.var.db
    const result = await db.select().from(news).orderBy(news.createdAt)
    return c.json(result as unknown as NewsRow[])
  })

  .post(
    '/news',
    dbMiddleware,
    zValidator('json', createNewsSchema),
    async (c) => {
      const db = c.var.db
      const data = c.req.valid('json')
      const [created] = await db.insert(news).values(data).returning()
      return c.json(created as unknown as NewsRow, 201)
    },
  )

  .patch(
    '/news/:id',
    dbMiddleware,
    zValidator('json', updateNewsSchema),
    async (c) => {
      const db = c.var.db
      const id = c.req.param('id')
      const data = c.req.valid('json')
      const [updated] = await db
        .update(news)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(news.id, id))
        .returning()
      if (!updated) return c.json({ error: 'News not found' }, 404)
      return c.json(updated as unknown as NewsRow)
    },
  )

  .delete('/news/:id', dbMiddleware, async (c) => {
    const db = c.var.db
    await db.delete(news).where(eq(news.id, c.req.param('id')))
    return c.json({ success: true })
  })
