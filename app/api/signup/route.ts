import { NextResponse, type NextRequest } from "next/server";
import { trafficCohort } from "@/lib/cohort";
import { query } from "@/lib/db";
import { allowAttempt, clientIp, hashIp } from "@/lib/rate-limit";
import { QA_COOKIE, SESSION_COOKIE, SESSION_MAX_AGE_S } from "@/lib/session";
import { MAX_BODY_BYTES, isFlavorSlug, isValidEmail, normalizeEmail, signupSchema } from "@/lib/validation";

/**
 * POST /api/signup. The nine server steps in guide/docs/10-signup-backend.md, in order.
 * Never logs an email address and never returns a signup row.
 */

type Fail = "invalid_email" | "rate_limited" | "server";

function fail(error: Fail, status: number) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function POST(req: NextRequest) {
  // 1. Parse, rejecting bodies over 4 KB.
  const raw = await req.text();
  if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) return fail("invalid_email", 400);
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return fail("invalid_email", 400);
  }
  const parsed = signupSchema.safeParse(json);
  if (!parsed.success) return fail("invalid_email", 400);
  const body = parsed.data;

  // 2. Honeypot: bots fill the hidden field. Pretend it worked; save nothing.
  if (body.company.trim() !== "") return NextResponse.json({ ok: true, duplicate: false });

  // 3. Rate limit by salted IP hash.
  if (!allowAttempt(hashIp(clientIp(req.headers)))) return fail("rate_limited", 429);

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

    // 8. TODO(M5): when META_CAPI_TOKEN is set and !duplicate, send the server-side Lead event
    //    with body.event_id, without awaiting it. A failure must not fail the signup.

    console.info(`[signup] ${duplicate ? "duplicate" : "new"} id=${id} cohort=${cohort} variant=${variant}`);
    // 9. Respond.
    return res;
  } catch (err) {
    console.error("[signup] failed:", err instanceof Error ? err.message : "unknown error");
    return fail("server", 500);
  }
}
