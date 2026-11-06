import { NextResponse, type NextRequest } from "next/server";
import { query } from "@/lib/db";
import { errorText, withRequestLog, type LogContext } from "@/lib/log";
import { sweepAttempts } from "@/lib/rate-limit";

/**
 * GET /api/health for uptime monitors and Railway's health check. 200 when the site and the
 * database both answer, 503 otherwise. Only failures are logged. Reveals nothing about signups.
 */
export const dynamic = "force-dynamic";

const DB_TIMEOUT_MS = 3000;

export const GET = withRequestLog("health", handleHealth, { quietOk: true });

async function handleHealth(_req: NextRequest, ctx: LogContext) {
  const started = performance.now();
  try {
    await Promise.race([
      query("select 1"),
      new Promise((_, reject) => setTimeout(() => reject(new Error("database timed out")), DB_TIMEOUT_MS)),
    ]);
    const dbMs = Math.round(performance.now() - started);
    // Housekeeping: uptime pings clear expired rate-limit rows even when nobody signs up.
    void sweepAttempts().catch(() => undefined);
    return NextResponse.json({ ok: true, db: "ok", db_ms: dbMs }, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    ctx.fields.reason = "db_unreachable";
    ctx.fields.error = errorText(err);
    return NextResponse.json({ ok: false, db: "down" }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
