import { createHash } from "node:crypto";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** The server-side Lead: one per new signup, none for repeats, never blocks or breaks the signup. */
const ids = new Map<string, string>();
vi.mock("@/lib/db", () => ({
  query: vi.fn(async (text: string, params: unknown[] = []) => {
    if (text.startsWith("insert into signups")) {
      const key = params[1] as string;
      if (ids.has(key)) return { rows: [] };
      ids.set(key, crypto.randomUUID());
      return { rows: [{ id: ids.get(key) }] };
    }
    if (text.startsWith("select id from signups")) return { rows: [{ id: ids.get(params[0] as string) }] };
    throw new Error(`unexpected query: ${text}`);
  }),
}));

const { POST: signup } = await import("@/app/api/signup/route");
const { resetRateLimit } = await import("@/lib/rate-limit");

const calls: { url: string; body: any }[] = [];
let metaResponse: () => Response = () => new Response(JSON.stringify({ events_received: 1 }), { status: 200 });
const logs: string[] = [];

function post(body: unknown, cookie?: string) {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-forwarded-for": "203.0.113.50",
    "user-agent": "TestBrowser/1.0",
    referer: "https://www.takeayaiya.com/?utm_source=meta&fbclid=abc",
  };
  if (cookie) headers.cookie = cookie;
  return new NextRequest("http://localhost/api/signup", { method: "POST", headers, body: JSON.stringify(body) });
}
const settle = () => new Promise((r) => setTimeout(r, 20));

beforeEach(() => {
  ids.clear();
  resetRateLimit();
  calls.length = 0;
  logs.length = 0;
  metaResponse = () => new Response(JSON.stringify({ events_received: 1 }), { status: 200 });
  vi.stubEnv("META_CAPI_TOKEN", "test-token");
  vi.stubEnv("NEXT_PUBLIC_META_PIXEL_ID", "3038346926498055");
  vi.stubGlobal("fetch", vi.fn(async (url: string, init: RequestInit) => {
    calls.push({ url, body: JSON.parse(String(init.body)) });
    return metaResponse();
  }));
  for (const m of ["info", "warn", "error"] as const) vi.spyOn(console, m).mockImplementation((...a: unknown[]) => void logs.push(String(a[0])));
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Meta Conversions API Lead", () => {
  it("sends one Lead for a new signup, with the hashed email and the browser's event id", async () => {
    const eventId = crypto.randomUUID();
    await signup(post({ email: " Person@Example.com ", event_id: eventId, attribution: { fbclid: "abc" } }, "_fbp=fb.1.123.456"));
    await settle();
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toContain("/3038346926498055/events");
    const ev = calls[0].body.data[0];
    expect(ev).toMatchObject({ event_name: "Lead", event_id: eventId, action_source: "website", event_source_url: "https://www.takeayaiya.com/" });
    expect(ev.user_data.em).toEqual([createHash("sha256").update("person@example.com").digest("hex")]);
    expect(ev.user_data).toMatchObject({ client_ip_address: "203.0.113.50", client_user_agent: "TestBrowser/1.0", fbp: "fb.1.123.456" });
    expect(ev.user_data.fbc).toMatch(/^fb\.1\.\d+\.abc$/);
    expect(JSON.stringify(calls[0].body)).not.toContain("person@example.com");
  });

  it("sends nothing for a repeat email", async () => {
    await signup(post({ email: "person@example.com" }));
    await signup(post({ email: "PERSON@example.com" }));
    await settle();
    expect(calls).toHaveLength(1);
  });

  it("sends nothing for the honeypot or without a token", async () => {
    await signup(post({ email: "bot@example.com", company: "Acme" }));
    vi.stubEnv("META_CAPI_TOKEN", "");
    await signup(post({ email: "new@example.com" }));
    await settle();
    expect(calls).toHaveLength(0);
  });

  it("still saves the signup when Meta fails, and logs why without personal data", async () => {
    metaResponse = () => new Response(JSON.stringify({ error: { message: "Invalid OAuth access token", code: 190 } }), { status: 400 });
    const res = await signup(post({ email: "person@example.com" }));
    expect(res.status).toBe(200);
    await settle();
    const line = logs.map((l) => JSON.parse(l)).find((l) => l.route === "meta");
    expect(line).toMatchObject({ level: "error", message: "meta lead rejected", status: 400, code: 190, error: "Invalid OAuth access token" });
    const all = logs.join("\n");
    expect(all).not.toContain("person@example.com");
    expect(all).not.toContain(createHash("sha256").update("person@example.com").digest("hex"));
    expect(all).not.toContain("203.0.113.50");
    expect(all).not.toContain("test-token");
  });
});
