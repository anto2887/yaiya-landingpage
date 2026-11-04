/**
 * Meta pixel (guide/docs/11-analytics.md). The pixel loads only when NEXT_PUBLIC_META_PIXEL_ID is
 * set, and only after the page is usable (components/analytics/MetaPixel.tsx via lib/defer.ts).
 * Calls made before the script arrives wait in the standard fbq queue. Browser only; never throws.
 */

type Fbq = ((command: string, event: string, params?: Record<string, unknown>, options?: { eventID?: string }) => void) & {
  queue?: unknown[];
  loaded?: boolean;
};
type PixelWindow = Window & { fbq?: Fbq; _fbq?: Fbq; __yaiyaPixelId?: string };

/** Meta's standard snippet: defines the fbq queue now and loads fbevents.js in the background. */
export function loadPixel(pixelId: string) {
  const w = window as PixelWindow;
  if (w.fbq || !/^\d{5,20}$/.test(pixelId)) return;
  w.__yaiyaPixelId = pixelId;
  /* eslint-disable */
  (function (f: any, b: Document, e: string, v: string) {
    if (f.fbq) return;
    const n: any = (f.fbq = function (...args: unknown[]) {
      n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
    });
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    const t = b.createElement(e) as HTMLScriptElement;
    t.async = true;
    t.src = v;
    const s = b.getElementsByTagName(e)[0];
    s?.parentNode?.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  /* eslint-enable */
  w.fbq!("init", pixelId);
  w.fbq!("track", "PageView");
}

function fbq(): Fbq | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as PixelWindow;
  // A signup can happen before the deferred load: load now so the Lead is queued, not lost.
  if (!w.fbq) {
    const id = document.documentElement.dataset.metaPixel;
    if (id) loadPixel(id);
  }
  return w.fbq;
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
    (window as PixelWindow).fbq?.("track", "PageView");
  } catch {
    // Ignore.
  }
}
