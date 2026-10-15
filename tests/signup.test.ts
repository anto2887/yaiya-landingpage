import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The six tests from guide/docs/10-signup-backend.md, plus the rate limit.
 * The database is an in-memory stand-in for the signups table, so these run without Postgres.
 */
type Row = { id: string; email_normalized: string; [k: string]: unknown };
const rows: Row[] = [];

vi.mock("@/lib/db", () => ({
  query: vi.fn(async (text: string, params: unknown[] = []) => {
    if (text.startsWith("insert into signups")) {
      const emailNormalized = params[1] as string;
      if (rows.some((r) => r.email_normalized === emailNormalized)) return { rows: [] };
      const row = { id: crypto.randomUUID(), email_normalized: emailNormalized };
      rows.push(row);
      return { rows: [{ id: row.id }] };
    }
    if (text.startsWith("select id from signups")) {
      return { rows: rows.filter((r) => r.email_normalized === params[0]).map((r) => ({ id: r.id })) };
    }
    if (text.startsWith("update signups")) {
      const id = params[params.length - 1];
      const row = rows.find((r) => r.id === id);
      if (row) row.updated = true;
      return { rows: [] };
    }
    throw new Error(`unexpected query: ${text}`);
  }),
}));

const { POST: signup } = await import("@/app/api/signup/route");
const { POST: answers } = await import("@/app/api/signup/answers/route");
const { resetRateLimit } = await import("@/lib/rate-limit");

function post(url: string, body: unknown, init: { cookie?: string; ip?: string } = {}) {
  const headers: Record<string, string> = { "content-type": "application/json", "x-forwarded-for": init.ip ?? "203.0.113.7" };
  if (init.cookie) headers.cookie = init.cookie;
  return new NextRequest(`http://localhost${url}`, { method: "POST", headers, body: JSON.stringify(body) });
}

beforeEach(() => {
  rows.length = 0;
  resetRateLimit();
});

describe("POST /api/signup", () => {
  it("inserts one row for a valid email and sets the session cookie", async () => {
    const res = await signup(post("/api/signup", { email: "person@example.com", company: "" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, duplicate: false });
    expect(rows).toHaveLength(1);
    const cookie = res.cookies.get("yaiya_sid");
    expect(cookie?.value).toBe(rows[0].id);
    expect(cookie?.httpOnly).toBe(true);
  });

  it("treats the same email in another case as a duplicate and inserts nothing", async () => {
    await signup(post("/api/signup", { email: "person@example.com" }));
    const res = await signup(post("/api/signup", { email: "  Person@EXAMPLE.com " }));
    expect(await res.json()).toEqual({ ok: true, duplicate: true });
    expect(rows).toHaveLength(1);
    expect(res.cookies.get("yaiya_sid")?.value).toBe(rows[0].id);
  });

  it("returns 200 and saves nothing when the honeypot is filled", async () => {
    const res = await signup(post("/api/signup", { email: "bot@example.com", company: "Acme" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, duplicate: false });
    expect(rows).toHaveLength(0);
    expect(res.cookies.get("yaiya_sid")).toBeUndefined();
  });

  it("returns 400 for an invalid email", async () => {
    for (const email of ["not-an-email", "a@b", "two@@example.com", "spa ce@example.com"]) {
      const res = await signup(post("/api/signup", { email }));
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ ok: false, error: "invalid_email" });
    }
    expect(rows).toHaveLength(0);
  });

  it("accepts plus-addresses and new top-level domains", async () => {
    const res = await signup(post("/api/signup", { email: "me+yaiya@studio.coffee" }));
    expect(res.status).toBe(200);
  });

  it("rate limits the sixth rapid attempt from one visitor", async () => {
    for (let i = 0; i < 5; i++) {
      const res = await signup(post("/api/signup", { email: `p${i}@example.com` }));
      expect(res.status).toBe(200);
    }
    const sixth = await signup(post("/api/signup", { email: "p6@example.com" }));
    expect(sixth.status).toBe(429);
    // Another visitor is unaffected.
    const other = await signup(post("/api/signup", { email: "q@example.com" }, { ip: "198.51.100.2" }));
    expect(other.status).toBe(200);
  });

  it("rejects bodies over 4 KB", async () => {
    const res = await signup(post("/api/signup", { email: "a@example.com", attribution: { referrer: "x".repeat(5000) } }));
    expect(res.status).toBe(400);
  });
});

describe("POST /api/signup/answers", () => {
  it("returns 401 without a session cookie", async () => {
    const res = await answers(post("/api/signup/answers", { flavor_preference: "matcha-yuzu" }));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ ok: false, error: "no_session" });
  });

  it("rejects an unknown option id", async () => {
    const id = crypto.randomUUID();
    const cookie = `yaiya_sid=${id}`;
    expect((await answers(post("/api/signup/answers", { flavor_preference: "mint-choc" }, { cookie }))).status).toBe(400);
    expect((await answers(post("/api/signup/answers", { occasion_preferences: ["moon-landing"] }, { cookie }))).status).toBe(400);
    expect((await answers(post("/api/signup/answers", { pack_preference: "case-99" }, { cookie }))).status).toBe(400);
  });

  it("updates the visitor's own row", async () => {
    const res1 = await signup(post("/api/signup", { email: "person@example.com" }));
    const id = res1.cookies.get("yaiya_sid")!.value;
    const res = await answers(
      post(
        "/api/signup/answers",
        { flavor_preference: "matcha-yuzu", occasion_preferences: ["afternoon-snack"], pack_preference: "variety-4-6", snack_instead: "protein bars" },
        { cookie: `yaiya_sid=${id}` },
      ),
    );
    expect(await res.json()).toEqual({ ok: true });
    expect(rows[0].updated).toBe(true);
  });
});
