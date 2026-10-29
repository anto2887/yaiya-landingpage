// Applies db/schema.sql. Safe to run repeatedly (every statement is "if not exists").
// Runs before `next start`. Without DATABASE_URL it skips, so the page still serves.
import { readFile } from "node:fs/promises";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.warn(JSON.stringify({ level: "warn", message: "[migrate] DATABASE_URL is not set. Skipping migration." }));
  process.exit(0);
}

const sql = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
const client = new pg.Client({ connectionString: url });

try {
  await client.connect();
  await client.query(sql);
  console.info(JSON.stringify({ level: "info", message: "[migrate] Schema is up to date." }));
} catch (err) {
  console.error(JSON.stringify({ level: "error", message: "[migrate] Failed", error: err instanceof Error ? err.message : String(err) }));
  process.exit(1);
} finally {
  await client.end().catch(() => {});
}
