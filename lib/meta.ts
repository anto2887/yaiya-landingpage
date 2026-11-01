import { createHash } from "node:crypto";
import { errorText, log } from "@/lib/log";

/**
 * Meta Conversions API: the server's copy of the browser pixel's Lead (guide/docs/11-analytics.md).
 * It recovers signups that browsers and ad blockers hide from the pixel. Both carry the same
 * event_id, so Meta counts the pair once.
 *
 * Off unless META_CAPI_TOKEN and NEXT_PUBLIC_META_PIXEL_ID are both set. Never awaited by the
 * signup, never throws, and logs only its outcome: no email, hash or IP.
 */

const GRAPH_VERSION = process.env.META_GRAPH_VERSION?.trim() || "v23.0";
const TIMEOUT_MS = 5000;

export type LeadInput = {
  eventId: string | undefined;
  emailNormalized: string;
  ip: string;
  userAgent: string | null;
  sourceUrl: string;
  fbp?: string;
  fbc?: string;
  fbclid?: string | null;
  signupId: string;
};

function sha256(v: string) {
  return createHash("sha256").update(v).digest("hex");
}

/** The request body Meta expects. Exported for tests. */
export function leadPayload(input: LeadInput, now = Date.now()) {
  // _fbc is set by the pixel after an ad click; if it is missing, build it from the fbclid.
  const fbc = input.fbc || (input.fbclid ? `fb.1.${now}.${input.fbclid}` : undefined);
  const userData: Record<string, unknown> = {
    em: [sha256(input.emailNormalized)],
    ...(input.ip && input.ip !== "unknown" ? { client_ip_address: input.ip } : {}),
    ...(input.userAgent ? { client_user_agent: input.userAgent } : {}),
    ...(input.fbp ? { fbp: input.fbp } : {}),
    ...(fbc ? { fbc } : {}),
  };
  const testCode = process.env.META_TEST_EVENT_CODE?.trim();
  return {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(now / 1000),
        ...(input.eventId ? { event_id: input.eventId } : {}),
        event_source_url: input.sourceUrl,
        action_source: "website",
        user_data: userData,
      },
    ],
    // Set META_TEST_EVENT_CODE while checking Events Manager's Test Events tab; remove after.
    ...(testCode ? { test_event_code: testCode } : {}),
  };
}

export function capiEnabled(): boolean {
  return !!process.env.META_CAPI_TOKEN?.trim() && !!process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
}

/** Fire and forget. Call only for a new signup, never a duplicate. */
export function sendLead(input: LeadInput): void {
  if (!capiEnabled()) return;
  const token = process.env.META_CAPI_TOKEN!.trim();
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID!.trim();
  const started = performance.now();

  void (async () => {
    try {
      const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(leadPayload(input)),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      const ms = Math.round(performance.now() - started);
      if (res.ok) {
        const body = (await res.json().catch(() => ({}))) as { events_received?: number };
        log("info", "meta lead sent", { route: "meta", signup_id: input.signupId, status: res.status, ms, events_received: body.events_received ?? null });
      } else {
        // Meta's error message says what is wrong (expired token, bad pixel id); it never contains the email.
        const body = (await res.json().catch(() => ({}))) as { error?: { message?: string; code?: number } };
        log("error", "meta lead rejected", {
          route: "meta",
          signup_id: input.signupId,
          status: res.status,
          ms,
          error: body.error?.message?.slice(0, 300) ?? null,
          code: body.error?.code ?? null,
        });
      }
    } catch (err) {
      log("error", "meta lead failed", { route: "meta", signup_id: input.signupId, error: errorText(err) });
    }
  })();
}
