// Server only: imported by API routes, never by a client component.
import { Pool } from "pg";

/**
 * One shared pg pool for the whole server (guide/docs/10-signup-backend.md).
 * Created on first use so the page still builds and serves without DATABASE_URL.
 * Parameterized queries only.
 */
let pool: Pool | undefined;

export function getPool(): Pool {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  pool = new Pool({ connectionString, max: 5, idleTimeoutMillis: 30_000 });
  return pool;
}

export async function query<T extends Record<string, unknown> = Record<string, unknown>>(text: string, params: unknown[] = []) {
  return getPool().query<T>(text, params);
}
