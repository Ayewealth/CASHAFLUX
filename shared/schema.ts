import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

// Better Auth manages its own tables automatically via the Drizzle adapter.
// To generate the auth schema run:
//   npx better-auth generate
// then paste the output here or import it from a separate file.

// Example application table — replace with your own domain models.
export const posts = pgTable('posts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Zod schemas derived from the table — single source of truth.
// Use insertPostSchema on the server to validate request bodies.
// Use Post/InsertPost types on the client for form state.
export const insertPostSchema = createInsertSchema(posts).omit({ createdAt: true, updatedAt: true })
export type InsertPost = z.infer<typeof insertPostSchema>
export type Post = typeof posts.$inferSelect
