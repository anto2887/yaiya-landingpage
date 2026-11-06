import { NextResponse, type NextRequest } from "next/server";

/**
 * Structured server logs. One JSON line per API request, which Railway's log view can filter by
 * field (e.g. @route:signup, @status:429, @reason:rate_limited, @req_id:...).
 *
 * Never put an email address, free text or an IP address in a log field. The signup id is fine.
 */

type Level = "info" | "warn" | "error";
type Fields = Record<string, string | number | boolean | null | undefined>;

export function log(level: Level, message: string, fields: Fields = {}) {
  const line = JSON.stringify({ level, message, ...fields, time: new Date().toISOString() });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

/**
 * A short, readable cause for a log line. Connection failures in Node often have an empty message
 * and only a code (ECONNREFUSED), or wrap several errors (AggregateError); this finds the useful part.
 */
export function errorText(err: unknown): string {
  if (!(err instanceof Error)) return String(err).slice(0, 300) || "unknown error";
  const e = err as Error & { code?: string; errors?: unknown[] };
  const parts = [e.code, e.message].filter(Boolean);
  if (!parts.length && Array.isArray(e.errors) && e.errors.length) return errorText(e.errors[0]);
  return (parts.join(": ") || e.name || "unknown error").slice(0, 300);
}

/** What a handler adds to its request's log line: why it rejected, the signup id, and so on. */
export type LogContext = { fields: Fields };

type Handler = (req: NextRequest, ctx: LogContext) => Promise<NextResponse>;

/**
 * Wraps an API route so every request logs one line with a request id, status and duration,
 * and an unexpected exception becomes a logged 500 instead of a crash. The request id is also
 * returned as the x-request-id header, so a visitor's failed request can be found in the logs.
 */
export function withRequestLog(route: string, handler: Handler, opts: { quietOk?: boolean } = {}) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const reqId = req.headers.get("x-railway-request-id") || crypto.randomUUID();
    const started = performance.now();
    const ctx: LogContext = { fields: {} };
    let res: NextResponse;
    try {
      res = await handler(req, ctx);
    } catch (err) {
      ctx.fields.reason = "unhandled";
      ctx.fields.error = errorText(err);
      res = NextResponse.json({ ok: false, error: "server" }, { status: 500 });
    }
    res.headers.set("x-request-id", reqId);
    // Standard rate-limit hint; tells a visitor (and us, when debugging) how many tries are left.
    if (typeof ctx.fields.rl_remaining === "number") res.headers.set("x-ratelimit-remaining", String(ctx.fields.rl_remaining));

    const status = res.status;
    const level: Level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";
    // Health checks every few minutes would drown the log; only their failures are worth a line.
    if (!(opts.quietOk && status < 400)) {
      log(level, `${req.method} /api/${route} ${status}`, {
        route,
        req_id: reqId,
        status,
        ms: Math.round(performance.now() - started),
        ...ctx.fields,
      });
    }
    return res;
  };
}
