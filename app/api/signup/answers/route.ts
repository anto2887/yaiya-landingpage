import { NextResponse, type NextRequest } from "next/server";
import { query } from "@/lib/db";
import { SESSION_COOKIE, isUuid } from "@/lib/session";
import { MAX_BODY_BYTES, answersSchema } from "@/lib/validation";

/**
 * POST /api/signup/answers. The four steps in guide/docs/10-signup-backend.md.
 * Updates only the fields sent, on the row named by the session cookie. Idempotent.
 */

// Column names come from this fixed list, never from the request.
const COLUMNS = ["flavor_preference", "occasion_preferences", "pack_preference", "snack_instead"] as const;

export async function POST(req: NextRequest) {
  // 1. Session.
  const id = req.cookies.get(SESSION_COOKIE)?.value;
  if (!isUuid(id)) return NextResponse.json({ ok: false, error: "no_session" }, { status: 401 });

  // 2. Validate against the option lists; free text is trimmed and cleaned by the schema.
  const raw = await req.text();
  if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }
  const parsed = answersSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  const answers = parsed.data;

  // 3. Update only what was sent.
  const sets: string[] = [];
  const params: unknown[] = [];
  for (const col of COLUMNS) {
    if (answers[col] === undefined) continue;
    params.push(col === "snack_instead" && answers.snack_instead === "" ? null : answers[col]);
    sets.push(`${col} = $${params.length}`);
  }
  if (sets.length === 0) return NextResponse.json({ ok: true });

  try {
    params.push(id);
    await query(`update signups set ${sets.join(", ")}, answers_updated_at = now() where id = $${params.length}`, params);
    // 4. Respond. An unknown id simply updates nothing; the visitor is never blocked.
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[answers] failed:", err instanceof Error ? err.message : "unknown error");
    return NextResponse.json({ ok: false, error: "server" }, { status: 500 });
  }
}
