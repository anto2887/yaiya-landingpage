/**
 * How the visitor arrived, sent with the signup (guide/docs/11-analytics.md).
 * For now this reads the current page's URL and referrer at submit time.
 * TODO(M5): store first touch in the yaiya_attr cookie for 30 days and send that instead.
 */

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

const KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"] as const;

export function readAttribution(): Attribution {
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
