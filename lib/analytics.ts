/**
 * The only way to send an analytics event (guide/docs/11-analytics.md). Typed by EventMap.
 *
 * PostHog loads after the page is interactive (components/analytics/PostHogProvider.tsx), so
 * events fired before that wait in a small queue. With no PostHog key, or when PostHog is
 * blocked, track() does nothing. It never throws and never delays the page.
 *
 * Never pass an email address, free text or the signup id.
 */

import type { EventMap, EventName } from "@/lib/events";

type Capture = (name: string, props?: Record<string, unknown>) => void;

let capture: Capture | null = null;
let enabled = true;
const queue: [string, Record<string, unknown>][] = [];
const QUEUE_MAX = 50;

/** Called by the provider once PostHog has loaded, or with null when it is off or failed. */
export function setAnalyticsSink(sink: Capture | null) {
  if (!sink) {
    enabled = false;
    queue.length = 0;
    return;
  }
  capture = sink;
  for (const [name, props] of queue.splice(0)) safeCapture(name, props);
}

function safeCapture(name: string, props: Record<string, unknown>) {
  try {
    capture?.(name, props);
  } catch {
    // Analytics must never break the page.
  }
}

export function track<N extends EventName>(name: N, ...args: EventMap[N] extends Record<string, never> ? [] : [EventMap[N]]) {
  if (!enabled || typeof window === "undefined") return;
  const props = (args[0] ?? {}) as Record<string, unknown>;
  if (capture) safeCapture(name, props);
  else if (queue.length < QUEUE_MAX) queue.push([name, props]);
}

/** Fire an event only once per page load (section views, scroll depths). */
const fired = new Set<string>();
export function trackOnce<N extends EventName>(key: string, name: N, ...args: EventMap[N] extends Record<string, never> ? [] : [EventMap[N]]) {
  if (fired.has(key)) return;
  fired.add(key);
  track(name, ...args);
}
