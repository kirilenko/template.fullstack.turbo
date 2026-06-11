import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const news = pgTable('news', {
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  published: boolean('published').notNull().default(false),
  title: text('title').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
