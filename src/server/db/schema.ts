// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  index,
  int,
  integer,
  sqliteTableCreator,
  text,
} from "drizzle-orm/sqlite-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator((name) => `kaizoku_${name}`);

export const users = createTable(
  "users",
  {
    id: text("id", { length: 21 }).primaryKey(),
    userName: text("user_name", { length: 255 }).unique().notNull(),
    email: text("email", { length: 255 }).unique().notNull(),
    avatar: text("avatar", { length: 2000 }).notNull(),
    hashedPassword: text("hashed_password", { length: 255 }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .default(sql`CURRENT_TIMESTAMP`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => ({
    emailIdx: index("email_idx").on(t.email),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const sessions = createTable(
  "sessions",
  {
    id: text("id", { length: 255 }).primaryKey(),
    userId: text("user_id", { length: 21 })
      .notNull()
      .references(() => users.id),
    expiresAt: int("expires_at").notNull(),
  },
  (t) => ({
    userIdx: index("session_user_idx").on(t.userId),
  }),
);
