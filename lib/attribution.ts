/**
 * How the visitor arrived (guide/docs/11-analytics.md). First touch wins: the first visit that
 * carries UTMs, an fbclid or an external referrer is stored in the yaiya_attr cookie for 30 days,
 * and that is what PostHog and the signup row see, even if the visitor comes back later directly.
 * Browser only.
 */

import { trafficCohort, type TrafficCohort } from "@/lib/cohort";

export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fbclid?: string;
  referrer?: string;
  landing_path?: string;
};

const COOKIE = "yaiya_attr";
const MAX_AGE_S = 30 * 24 * 60 * 60;
const KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"] as const;

function readCookie(): Attribution | null {
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${COOKIE}=`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match.slice(COOKIE.length + 1))) as Attribution;
  } catch {
    return null;
  }
}

/** What this page load says about where the visitor came from. */
function fromThisVisit(): Attribution {
  const out: Attribution = { landing_path: window.location.pathname };
  const params = new URLSearchParams(window.location.search);
  for (const k of KEYS) {
    const v = params.get(k)?.trim();
    if (v) out[k] = v.slice(0, 500);
  }
  // Only an external referrer says where the visitor came from.
  try {
    const ref = document.referrer;
    if (ref && new URL(ref).origin !== window.location.origin) out.referrer = ref.slice(0, 2000);
  } catch {
    // Malformed referrer: leave it out.
  }
  return out;
}

let cached: Attribution | null = null;

/**
 * The visitor's first-touch attribution. Call once per page load (the analytics provider does);
 * stores this visit if it carries a source and nothing is stored yet.
 */
export function getAttribution(): Attribution {
  if (cached) return cached;
  const stored = readCookie();
  const now = fromThisVisit();
  const hasSource = KEYS.some((k) => now[k]) || !!now.referrer;
  if (stored) {
    cached = stored;
  } else {
    cached = now;
    if (hasSource) {
      document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(now))}; Max-Age=${MAX_AGE_S}; Path=/; SameSite=Lax${
        location.protocol === "https:" ? "; Secure" : ""
      }`;
    }
  }
  return cached;
}

export function getCohort(): TrafficCohort {
  return trafficCohort(getAttribution());
}

export function isQa(): boolean {
  return document.cookie.split("; ").some((c) => c === "yaiya_qa=1");
}
