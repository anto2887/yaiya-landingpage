/**
 * Meta pixel calls (guide/docs/11-analytics.md). The pixel script itself loads in
 * components/analytics/MetaPixel.tsx only when NEXT_PUBLIC_META_PIXEL_ID is set; without it,
 * these do nothing. Browser only; never throws.
 */

type Fbq = (command: string, event: string, params?: Record<string, unknown>, options?: { eventID?: string }) => void;

function fbq(): Fbq | undefined {
  return typeof window === "undefined" ? undefined : (window as Window & { fbq?: Fbq }).fbq;
}

/**
 * The Lead for a new signup. eventId is the same id the server sends to the Conversions API,
 * so Meta counts the pair once. Never call it for a duplicate or on the thank-you page.
 */
export function trackLead(eventId: string) {
  try {
    fbq()?.("track", "Lead", {}, { eventID: eventId });
  } catch {
    // Blocked or failed: the signup has already saved.
  }
}

export function trackPageView() {
  try {
    fbq()?.("track", "PageView");
  } catch {
    // Ignore.
  }
}
