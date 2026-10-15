import { createHash } from "node:crypto";

/**
 * In-memory rate limit for the signup endpoint: at most 5 attempts per 10 minutes per visitor.
 * Visitors are keyed by a salted SHA-256 of their IP; the raw IP is never stored.
 * Memory resets on deploy, which is fine for a waitlist.
 */
export const RATE_LIMIT = 5;
export const RATE_WINDOW_MS = 10 * 60 * 1000;

const hits = new Map<string, number[]>();

export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

/** Records an attempt; returns false once the visitor is over the limit. */
export function allowAttempt(key: string, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  // Keep the map small: forget visitors whose attempts have all expired.
  if (hits.size > 5000) {
    for (const [k, times] of hits) if (times.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(k);
  }
  return recent.length <= RATE_LIMIT;
}

/** First address in X-Forwarded-For (Railway's proxy), else X-Real-IP. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || "unknown";
}

/** Test helper. */
export function resetRateLimit() {
  hits.clear();
}
