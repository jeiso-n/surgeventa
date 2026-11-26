import "server-only";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { getEnvironmentReadiness, parseEnv } from "@/lib/env";
import * as schema from "./schema";

export type Database = NodePgDatabase<typeof schema>;

declare global {
  var __surgevantaPool: Pool | undefined;
}

/**
 * Returns a portable PostgreSQL Drizzle client configured for Neon's pooled
 * endpoint or any standard PostgreSQL server.
 *
 * Intentionally lazy: never attempts to connect at module import time or when
 * DATABASE_URL has not been supplied yet.
 */
export function getDb(): Database {
  const readiness = getEnvironmentReadiness();
  if (!readiness.databaseConfigured) {
    throw new Error(
      "Database is not configured. Provide a valid Neon PostgreSQL DATABASE_URL in .env.local.",
    );
  }

  const env = parseEnv();
  if (!globalThis.__surgevantaPool) {
    globalThis.__surgevantaPool = new Pool({
      connectionString: env.DATABASE_URL,
      // Keep pool compact for serverless environments and Neon Free Tier compute limits.
      max: 5,
      idleTimeoutMillis: 20_000,
      connectionTimeoutMillis: 10_000,
    });
  }

  return drizzle(globalThis.__surgevantaPool, { schema });
}
