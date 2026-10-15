/**
 * Traffic cohort rules (guide/docs/11-analytics.md). Pure, so the browser (PostHog, M5) and the
 * server (Postgres) work it out the same way. The server never trusts a cohort sent by the browser.
 */

export type TrafficCohort = "meta" | "organic" | "direct" | "other";

export type CohortInput = {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  fbclid?: string | null;
  referrer?: string | null;
};

const META_SOURCES = new Set(["meta", "facebook", "instagram", "fb", "ig"]);

// Search engines and social sites, matched as a whole label of the referrer's hostname, so
// www.google.co.uk and l.instagram.com both count and nothing matches by accident.
const ORGANIC_BRANDS = new Set([
  "google",
  "bing",
  "duckduckgo",
  "yahoo",
  "ecosia",
  "baidu",
  "yandex",
  "naver",
  "facebook",
  "instagram",
  "twitter",
  "tiktok",
  "pinterest",
  "reddit",
  "linkedin",
  "youtube",
  "threads",
  "snapchat",
]);
// Short domains matched exactly (or as a parent domain).
const ORGANIC_DOMAINS = ["t.co", "x.com"];

function isOrganicHost(host: string): boolean {
  if (ORGANIC_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`))) return true;
  return host.split(".").some((label) => ORGANIC_BRANDS.has(label));
}

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function trafficCohort(a: CohortInput): TrafficCohort {
  const source = a.utm_source?.trim().toLowerCase();
  if (a.fbclid?.trim() || (source && META_SOURCES.has(source))) return "meta";

  const hasUtm = [a.utm_source, a.utm_medium, a.utm_campaign, a.utm_content, a.utm_term].some((v) => v?.trim());
  if (hasUtm) return "other";

  const referrer = a.referrer?.trim();
  if (!referrer) return "direct";

  const host = hostOf(referrer);
  return host && isOrganicHost(host) ? "organic" : "other";
}
