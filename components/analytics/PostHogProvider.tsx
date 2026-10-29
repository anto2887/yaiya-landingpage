"use client";

import { useEffect } from "react";
import { getAttribution, getCohort, isQa } from "@/lib/attribution";
import { setAnalyticsSink } from "@/lib/analytics";

type PostHogProviderProps = {
  /** NEXT_PUBLIC_POSTHOG_KEY. Empty turns PostHog off entirely. */
  apiKey: string;
  apiHost: string;
  landingVariant: string;
};

function deviceType(): "mobile" | "tablet" | "desktop" {
  const w = window.innerWidth;
  return w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop";
}

/**
 * Loads PostHog once the page is idle, through the site's own /ingest proxy (next.config.mjs).
 * Visitors stay anonymous: no identify, no person profiles. Session replay masks every input.
 * Registers the common properties from 11-analytics.md on every event.
 */
export function PostHogProvider({ apiKey, apiHost, landingVariant }: PostHogProviderProps) {
  useEffect(() => {
    // Store first-touch attribution on every load, even with PostHog off: the signup uses it.
    const attr = getAttribution();
    if (!apiKey) {
      setAnalyticsSink(null);
      return;
    }

    let cancelled = false;
    const start = async () => {
      try {
        const { default: posthog } = await import("posthog-js");
        if (cancelled) return;
        posthog.init(apiKey, {
          api_host: apiHost,
          ui_host: "https://us.posthog.com",
          person_profiles: "never",
          capture_pageview: true,
          // Clicks are tracked as named events instead; nothing typed is ever captured.
          autocapture: false,
          capture_exceptions: true,
          session_recording: { maskAllInputs: true },
        });
        posthog.register({
          landing_variant: isQa() ? "qa" : landingVariant,
          traffic_cohort: getCohort(),
          utm_source: attr.utm_source ?? null,
          utm_medium: attr.utm_medium ?? null,
          utm_campaign: attr.utm_campaign ?? null,
          utm_content: attr.utm_content ?? null,
          utm_term: attr.utm_term ?? null,
          device_type: deviceType(),
          ...(isQa() ? { is_qa: true } : {}),
        });
        setAnalyticsSink((name, props) => posthog.capture(name, props));
      } catch {
        // Blocked or failed to load: the page and the signup carry on without analytics.
        setAnalyticsSink(null);
      }
    };

    // After the page has settled, so analytics never competes with the first paint.
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    let handle: number | undefined;
    if (idle) handle = idle(() => void start(), { timeout: 3000 });
    else handle = window.setTimeout(() => void start(), 1500);

    return () => {
      cancelled = true;
      const cancelIdle = (window as Window & { cancelIdleCallback?: (h: number) => void }).cancelIdleCallback;
      if (handle !== undefined) (cancelIdle ?? window.clearTimeout)(handle);
    };
  }, [apiKey, apiHost, landingVariant]);

  return null;
}
