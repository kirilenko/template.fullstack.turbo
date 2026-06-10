import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'

import type { Database } from '../db/index.js'
import { news, users } from '../db/schema/index.js'
import type { AuthEnv } from '../middleware/auth.js'
import { getUser, requireAdmin } from '../middleware/auth.js'
import { dbMiddleware } from '../middleware/db.js'

type Env = AuthEnv & { Variables: { db: Database } }

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
    return c.json(result)
  })

  .patch('/users/:id', dbMiddleware, async (c) => {
    const db = c.var.db
    const id = c.req.param('id')

    const body = updateUserSchema.safeParse(await c.req.json())
    if (!body.success) {
      return c.json({ details: body.error.flatten(), error: 'Validation failed' }, 400)
    }

    const [updated] = await db
      .update(users)
      .set({ ...body.data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning(userFields)

    if (!updated) return c.json({ error: 'User not found' }, 404)
    return c.json(updated)
  })

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
    return c.json(result)
  })

  .post('/news', dbMiddleware, async (c) => {
    const db = c.var.db
    const body = createNewsSchema.safeParse(await c.req.json())
    if (!body.success) {
      return c.json({ details: body.error.flatten(), error: 'Validation failed' }, 400)
    }
    const [created] = await db.insert(news).values(body.data).returning()
    return c.json(created, 201)
  })

  .patch('/news/:id', dbMiddleware, async (c) => {
    const db = c.var.db
    const id = c.req.param('id')
    const body = updateNewsSchema.safeParse(await c.req.json())
    if (!body.success) {
      return c.json({ details: body.error.flatten(), error: 'Validation failed' }, 400)
    }
    const [updated] = await db
      .update(news)
      .set({ ...body.data, updatedAt: new Date() })
      .where(eq(news.id, id))
      .returning()
    if (!updated) return c.json({ error: 'News not found' }, 404)
    return c.json(updated)
  })

  .delete('/news/:id', dbMiddleware, async (c) => {
    const db = c.var.db
    await db.delete(news).where(eq(news.id, c.req.param('id')))
    return c.json({ success: true })
  })
