import { NextResponse, type NextRequest } from "next/server";
import { trafficCohort } from "@/lib/cohort";
import { query } from "@/lib/db";
import { errorText, withRequestLog, type LogContext } from "@/lib/log";
import { sendLead } from "@/lib/meta";
import { clientIp, hashIp, recordAttempt } from "@/lib/rate-limit";
import { QA_COOKIE, SESSION_COOKIE, SESSION_MAX_AGE_S } from "@/lib/session";
import { MAX_BODY_BYTES, isFlavorSlug, isValidEmail, normalizeEmail, signupSchema } from "@/lib/validation";

/**
 * POST /api/signup. The nine server steps in guide/docs/10-signup-backend.md, in order.
 * Never logs an email address and never returns a signup row. Every request logs one line
 * (lib/log.ts); `reason` says why a request was turned away.
 */

type Fail = "invalid_email" | "rate_limited" | "server";

export const POST = withRequestLog("signup", handleSignup);

async function handleSignup(req: NextRequest, ctx: LogContext) {
  const fail = (error: Fail, status: number, reason: string = error) => {
    ctx.fields.reason = reason;
    return NextResponse.json({ ok: false, error }, { status });
  };

  // 1. Parse, rejecting bodies over 4 KB.
  const raw = await req.text();
  if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) return fail("invalid_email", 400, "body_too_large");
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return fail("invalid_email", 400, "bad_json");
  }
  const parsed = signupSchema.safeParse(json);
  if (!parsed.success) return fail("invalid_email", 400, "bad_body");
  const body = parsed.data;

  // 2. Honeypot: bots fill the hidden field. Pretend it worked; save nothing.
  if (body.company.trim() !== "") {
    ctx.fields.outcome = "honeypot";
    return NextResponse.json({ ok: true, duplicate: false });
  }

  // 3. Rate limit by salted IP hash.
  const ip = clientIp(req.headers);
  let rl: { allowed: boolean; remaining: number };
  try {
    rl = await recordAttempt(hashIp(ip));
  } catch (err) {
    // Without the database the signup cannot save anyway; report it as the same failure.
    ctx.fields.error = errorText(err);
    return fail("server", 500, "db_error");
  }
  ctx.fields.rl_remaining = rl.remaining;
  if (!rl.allowed) return fail("rate_limited", 429);

  // 4. Email.
  if (!isValidEmail(body.email)) return fail("invalid_email", 400);
  const email = body.email.trim();
  const emailNormalized = normalizeEmail(email);

  // 5. Cohort from attribution (never trusted from the browser), and the QA tag.
  const a = body.attribution ?? {};
  const cohort = trafficCohort(a);
  const variant = req.cookies.get(QA_COOKIE)?.value ? "qa" : process.env.LANDING_VARIANT?.trim() || "v1";
  const flavor = isFlavorSlug(body.first_flavor_click) ? body.first_flavor_click : null;
  const userAgent = req.headers.get("user-agent")?.slice(0, 500) ?? null;

  try {
    // 6. Insert; on a repeat email keep the first row and its first-touch attribution.
    const inserted = await query<{ id: string }>(
      `insert into signups (
         email, email_normalized, landing_variant, traffic_cohort,
         utm_source, utm_medium, utm_campaign, utm_content, utm_term,
         fbclid, referrer, landing_path, user_agent, first_flavor_click
       ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       on conflict (email_normalized) do nothing
       returning id`,
      [
        email,
        emailNormalized,
        variant,
        cohort,
        a.utm_source ?? null,
        a.utm_medium ?? null,
        a.utm_campaign ?? null,
        a.utm_content ?? null,
        a.utm_term ?? null,
        a.fbclid ?? null,
        a.referrer ?? null,
        a.landing_path ?? null,
        userAgent,
        flavor,
      ],
    );

    let id = inserted.rows[0]?.id;
    const duplicate = !id;
    if (!id) {
      const existing = await query<{ id: string }>("select id from signups where email_normalized = $1", [emailNormalized]);
      id = existing.rows[0]?.id;
      if (!id) throw new Error("signup row missing after conflict");
    }

    // 7. Session cookie with the signup id only.
    const res = NextResponse.json({ ok: true, duplicate });
    res.cookies.set(SESSION_COOKIE, id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_S,
    });

    // 8. Meta's server-side Lead, for new signups only, not awaited (lib/meta.ts). Same event_id
    //    as the browser pixel's Lead, so Meta counts them once.
    if (!duplicate) {
      sendLead({
        eventId: body.event_id,
        emailNormalized,
        ip,
        userAgent,
        sourceUrl: req.headers.get("referer")?.split("?")[0] || `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/`,
        fbp: req.cookies.get("_fbp")?.value,
        fbc: req.cookies.get("_fbc")?.value,
        fbclid: a.fbclid,
        signupId: id,
      });
    }

    Object.assign(ctx.fields, { outcome: duplicate ? "duplicate" : "new", signup_id: id, cohort, variant });
    // 9. Respond.
    return res;
  } catch (err) {
    ctx.fields.error = errorText(err);
    return fail("server", 500, "db_error");
  }
}
