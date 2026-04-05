import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

// Better Auth manages its own tables automatically via the Drizzle adapter.
// To generate the auth schema run:
//   pnpm --filter @template/server exec better-auth generate
// then paste the output here or import it from a separate file.

// Example application table — replace with your own domain models.
export const posts = pgTable('posts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
