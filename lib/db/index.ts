import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Lazily connected so the marketing page builds and deploys before Supabase
 * exists. Anything that actually needs the database calls `db()` and gets a
 * clear error if it isn't configured yet.
 */
let client: ReturnType<typeof postgres> | null = null;
let instance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function db() {
  if (instance) return instance;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add the Supabase pooled connection string to the environment.",
    );
  }

  // prepare:false is required for transaction-mode connection poolers.
  client = postgres(url, { prepare: false, max: 5 });
  instance = drizzle(client, { schema });
  return instance;
}

export { schema };
