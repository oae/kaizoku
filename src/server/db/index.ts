import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

import { env } from "@/env";
import * as schema from "./schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  client: Client | undefined;
};

export const client =
  globalForDb.client ?? createClient({ url: env.DATABASE_URL });
if (env.NODE_ENV !== "production") globalForDb.client = client;

export const db = drizzle(client, { schema });

async function runMigrate() {
  console.log("⏳ Running migrations...");
  const start = Date.now();
  await migrate(db, {
    migrationsFolder: "./src/server/db/migrations",
  });
  const end = Date.now();
  console.log(`✅ Migrations completed in ${end - start}ms`);
}

runMigrate().catch((e) => {
  console.error("Failed to run migrations:", e);
  process.exit(1);
});
