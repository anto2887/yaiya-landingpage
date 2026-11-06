import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** Every API request logs one structured line with a reason, and never an email address. */
let dbDown = false;
const ids = new Map<string, string>();

const attempts = new Map<string, number>();
vi.mock("@/lib/db", () => ({
  query: vi.fn(async (text: string, params: unknown[] = []) => {
    if (text.includes("signup_attempts")) {
      if (text.startsWith("delete")) return { rows: [] };
      const key = params[0] as string;
      attempts.set(key, (attempts.get(key) ?? 0) + 1);
      return { rows: [{ n: String(attempts.get(key)) }] };
    }
    if (dbDown) throw new Error("connect ECONNREFUSED");
    if (text === "select 1") return { rows: [{ "?column?": 1 }] };
    if (text.startsWith("insert into signups")) {
      const key = params[1] as string;
      if (ids.has(key)) return { rows: [] };
      ids.set(key, crypto.randomUUID());
      return { rows: [{ id: ids.get(key) }] };
    }
    if (text.startsWith("select id from signups")) return { rows: [{ id: ids.get(params[0] as string) }] };
    if (text.startsWith("update signups")) return { rows: [], rowCount: 1 };
    throw new Error(`unexpected query: ${text}`);
  }),
}));

const { POST: signup } = await import("@/app/api/signup/route");
const { POST: answers } = await import("@/app/api/signup/answers/route");
const { GET: health } = await import("@/app/api/health/route");

const lines: Record<string, unknown>[] = [];
const raw: string[] = [];

function req(url: string, method: string, body?: unknown, cookie?: string) {
  const headers: Record<string, string> = { "content-type": "application/json", "x-forwarded-for": "203.0.113.9" };
  if (cookie) headers.cookie = cookie;
  return new NextRequest(`http://localhost${url}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
}

beforeEach(() => {
  dbDown = false;
  ids.clear();
  attempts.clear();
  lines.length = 0;
  raw.length = 0;
  for (const m of ["info", "warn", "error"] as const) {
    vi.spyOn(console, m).mockImplementation((...args: unknown[]) => {
      const s = args[0];
      raw.push(String(s));
      lines.push(JSON.parse(String(s)));
    });
  }
});
afterEach(() => vi.restoreAllMocks());

describe("request logging", () => {
  it("logs a new signup with its id and outcome, and returns the request id", async () => {
    const res = await signup(req("/api/signup", "POST", { email: "Secret.Person@example.com" }));
    expect(res.headers.get("x-request-id")).toBeTruthy();
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ level: "info", route: "signup", status: 200, outcome: "new", req_id: res.headers.get("x-request-id") });
    expect(lines[0].signup_id).toMatch(/^[0-9a-f-]{36}$/);
    expect(typeof lines[0].ms).toBe("number");
  });

  it("never writes an email address to the log", async () => {
    await signup(req("/api/signup", "POST", { email: "Secret.Person@example.com" }));
    await signup(req("/api/signup", "POST", { email: "secret.person@EXAMPLE.com" }));
    await signup(req("/api/signup", "POST", { email: "broken@" }));
    expect(raw.join("\n").toLowerCase()).not.toContain("secret.person");
    expect(raw.join("\n")).not.toContain("@");
  });

  it("logs rejections as warnings with a reason", async () => {
    await signup(req("/api/signup", "POST", { email: "nope" }));
    await answers(req("/api/signup/answers", "POST", { flavor_preference: "mango-goji" }));
    expect(lines[0]).toMatchObject({ level: "warn", status: 400, reason: "invalid_email" });
    expect(lines[1]).toMatchObject({ level: "warn", route: "answers", status: 401, reason: "no_session" });
  });

  it("logs the rate limit and the honeypot", async () => {
    for (let i = 0; i < 6; i++) await signup(req("/api/signup", "POST", { email: `p${i}@example.com` }));
    expect(lines[5]).toMatchObject({ status: 429, reason: "rate_limited" });
    await signup(req("/api/signup", "POST", { email: "bot@example.com", company: "Acme" }));
    // The honeypot check runs before the rate limit, so it still answers 200.
    expect(lines[6]).toMatchObject({ status: 200, outcome: "honeypot" });
  });

  it("names which answer field was invalid, not its value", async () => {
    const cookie = `yaiya_sid=${crypto.randomUUID()}`;
    await answers(req("/api/signup/answers", "POST", { flavor_preference: "mint-choc", pack_preference: "case-12" }, cookie));
    expect(lines[0]).toMatchObject({ status: 400, reason: "bad_flavor_preference" });
    expect(raw.join("")).not.toContain("mint-choc");
  });

  it("logs a database failure as an error with the cause", async () => {
    dbDown = true;
    const res = await signup(req("/api/signup", "POST", { email: "person@example.com" }));
    expect(res.status).toBe(500);
    expect(lines[0]).toMatchObject({ level: "error", status: 500, reason: "db_error", error: "connect ECONNREFUSED" });
  });
});

describe("errorText", async () => {
  const { errorText } = await import("@/lib/log");
  it("finds the code when a connection error has no message", () => {
    const refused = Object.assign(new Error(""), { code: "ECONNREFUSED" });
    expect(errorText(refused)).toBe("ECONNREFUSED");
    expect(errorText(new AggregateError([refused], ""))).toBe("ECONNREFUSED");
    expect(errorText(new Error("timeout"))).toBe("timeout");
  });
});

describe("GET /api/health", () => {
  it("answers 200 when the database responds, without logging", async () => {
    const res = await health(req("/api/health", "GET"));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, db: "ok" });
    expect(lines).toHaveLength(0);
  });

  it("answers 503 and logs when the database is down", async () => {
    dbDown = true;
    const res = await health(req("/api/health", "GET"));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ ok: false, db: "down" });
    expect(lines[0]).toMatchObject({ level: "error", route: "health", reason: "db_unreachable" });
  });
});
