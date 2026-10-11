/**
 * Analytics event names and their properties.
 * Spec: guide/docs/11-analytics.md
 *
 * Call events only through track() in lib/analytics.ts.
 * Never put an email address, free text, or the signup id in a property.
 */

import type { FlavorSlug } from "@/content/site";

export type SectionId =
  | "hero"
  | "benefits"
  | "flavors"
  | "nutrition"
  | "occasions"
  | "story"
  | "inside"
  | "compare"
  | "faq"
  | "waitlist";

export type CtaLocation = "nav" | "hero" | "hero_secondary" | "sticky";

export type SignupFailReason =
  | "invalid_email"
  | "rate_limited"
  | "server"
  | "network";

export type ResearchQuestion =
  | "flavor_preference"
  | "occasion_preferences"
  | "pack_preference"
  | "snack_instead";

/** Event name -> properties. An empty object means no properties. */
export type EventMap = {
  landing_viewed: Record<string, never>;
  cta_clicked: { location: CtaLocation };
  nav_link_clicked: { target: string };
  section_viewed: { section: SectionId };
  scroll_50: Record<string, never>;
  scroll_90: Record<string, never>;
  flavor_selected: { flavor: FlavorSlug };
  ingredient_tab_selected: { tab: string };
  faq_opened: { question_id: string };
  email_signup_started: Record<string, never>;
  email_signup_submitted: Record<string, never>;
  email_signup_completed: { duplicate: boolean };
  email_signup_failed: { reason: SignupFailReason };
  thank_you_viewed: { has_session: boolean };
  /** value is an option id. Omit it for the free-text question. */
  research_answered: { question: ResearchQuestion; value?: string };
  research_submitted: { answered_count: number };
  research_skipped: Record<string, never>;
};

export type EventName = keyof EventMap;

/** Sent with every event (registered once as super properties). */
export type CommonProps = {
  landing_variant: string;
  traffic_cohort: "meta" | "organic" | "direct" | "other";
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  device_type: "mobile" | "tablet" | "desktop";
  is_qa?: true;
};

/** The primary conversion: email_signup_completed with duplicate === false. */
export const PRIMARY_CONVERSION: EventName = "email_signup_completed";
