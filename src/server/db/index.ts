import "server-only";
import { sql } from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { getEnvironmentReadiness, parseEnv } from "@/lib/env";
import * as schema from "./schema";

export type Database = NodePgDatabase<typeof schema>;

export interface DatabaseHealthResult {
  configured: boolean;
  connected: boolean;
  latencyMs?: number;
  serverVersion?: string;
  schemaTablesCount?: number;
  error?: string;
}

declare global {
  var __surgeventaPool: Pool | undefined;
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
  if (!globalThis.__surgeventaPool) {
    globalThis.__surgeventaPool = new Pool({
      connectionString: env.DATABASE_URL,
      // Keep pool compact for serverless environments and Neon Free Tier compute limits.
      max: 5,
      idleTimeoutMillis: 20_000,
      connectionTimeoutMillis: 10_000,
    });
  }

  return drizzle(globalThis.__surgeventaPool, { schema });
}

/**
 * Executes a lightweight read-only connectivity and schema readiness check
 * against PostgreSQL without exposing credentials or raw connection errors.
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealthResult> {
  const readiness = getEnvironmentReadiness();
  if (!readiness.databaseConfigured) {
    return { configured: false, connected: false };
  }

  const startedAt = Date.now();
  try {
    const db = getDb();
    const versionResult = await db.execute<{
      server_version: string;
      tables_count: number;
    }>(sql`
      SELECT
        current_setting('server_version') AS server_version,
        (
          SELECT count(*)::int
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_name IN (
              'users',
              'auth_sessions',
              'auth_accounts',
              'auth_verifications',
              'social_accounts',
              'media_assets',
              'posts',
              'post_targets',
              'post_media_attachments'
            )
        ) AS tables_count
    `);

    const row = versionResult.rows[0];
    return {
      configured: true,
      connected: true,
      latencyMs: Date.now() - startedAt,
      serverVersion: row?.server_version ?? "unknown",
      schemaTablesCount: Number(row?.tables_count ?? 0),
    };
  } catch (err) {
    const code =
      typeof err === "object" && err !== null && "code" in err
        ? String((err as { code?: unknown }).code ?? "DB_ERROR")
        : "DB_ERROR";
    return {
      configured: true,
      connected: false,
      latencyMs: Date.now() - startedAt,
      error: `Database unreachable (${code})`,
    };
  }
}
