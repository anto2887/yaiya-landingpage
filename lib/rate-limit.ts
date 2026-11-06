import { createHash } from "node:crypto";
import { query } from "@/lib/db";

/**
 * Rate limit for the signup endpoint: at most 5 attempts per 10 minutes per visitor.
 * Visitors are keyed by a salted SHA-256 of their IP; the raw IP is never stored. Counts live in
 * Postgres so every server instance shares them (an in-memory map gave each instance its own
 * count; found in M7 with two instances live). Old rows are swept on every attempt.
 */
export const RATE_LIMIT = 5;
export const RATE_WINDOW_MS = 10 * 60 * 1000;

export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

/** Records an attempt and returns how many remain in the window (negative once over the limit). */
export async function recordAttempt(key: string): Promise<{ allowed: boolean; remaining: number }> {
  const window = `${RATE_WINDOW_MS / 1000} seconds`;
  const res = await query<{ n: string }>(
    `with swept as (delete from signup_attempts where created_at < now() - $2::interval),
          ins as (insert into signup_attempts (key_hash) values ($1))
     select count(*) + 1 as n from signup_attempts where key_hash = $1 and created_at >= now() - $2::interval`,
    [key, window],
  );
  const used = Number(res.rows[0]?.n ?? 1);
  return { allowed: used <= RATE_LIMIT, remaining: Math.max(0, RATE_LIMIT - used) };
}

/** Deletes rows outside the window. Called by the health check so old rows go even when nobody signs up. */
export async function sweepAttempts(): Promise<void> {
  await query("delete from signup_attempts where created_at < now() - $1::interval", [`${RATE_WINDOW_MS / 1000} seconds`]);
}

/** First address in X-Forwarded-For (Railway's proxy), else X-Real-IP. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || "unknown";
}
