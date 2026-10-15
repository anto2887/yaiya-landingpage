import { z } from "zod";
import { FLAVOR_SLUGS, OCCASION_IDS, PACK_IDS } from "@/content/site";

/**
 * Request bodies for the signup API (guide/docs/10-signup-backend.md).
 * Option lists come from content/site.ts, so the page and the server never disagree.
 */

/** Largest request body either endpoint accepts. */
export const MAX_BODY_BYTES = 4 * 1024;
export const MAX_SNACK_LENGTH = 200;

export { MAX_EMAIL_LENGTH, isValidEmail, normalizeEmail } from "@/lib/email";

// Attribution values are optional strings, capped so a crafted request cannot bloat a row.
const attrValue = z.string().trim().max(500).nullish();

export const attributionSchema = z
  .object({
    utm_source: attrValue,
    utm_medium: attrValue,
    utm_campaign: attrValue,
    utm_content: attrValue,
    utm_term: attrValue,
    fbclid: attrValue,
    referrer: z.string().trim().max(2000).nullish(),
    landing_path: attrValue,
  })
  .partial();

export const signupSchema = z.object({
  email: z.string().max(1000),
  company: z.string().max(500).optional().default(""),
  event_id: z.string().uuid().optional(),
  // Unknown flavors are dropped rather than failing the signup.
  first_flavor_click: z.string().max(50).nullish(),
  attribution: attributionSchema.optional(),
});

export type SignupBody = z.infer<typeof signupSchema>;

/** Removes control characters (keeps ordinary spaces) and caps the length. */
export function cleanFreeText(raw: string, max = MAX_SNACK_LENGTH): string {
  return raw.replace(/[\u0000-\u001f\u007f-\u009f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

export const answersSchema = z
  .object({
    flavor_preference: z.enum(FLAVOR_SLUGS as unknown as [string, ...string[]]),
    occasion_preferences: z.array(z.enum(OCCASION_IDS as unknown as [string, ...string[]])).max(OCCASION_IDS.length),
    pack_preference: z.enum(PACK_IDS as unknown as [string, ...string[]]),
    snack_instead: z.string().max(2000).transform((v) => cleanFreeText(v)),
  })
  .partial()
  .strict();

export type AnswersBody = z.infer<typeof answersSchema>;

export function isFlavorSlug(v: unknown): v is (typeof FLAVOR_SLUGS)[number] {
  return typeof v === "string" && (FLAVOR_SLUGS as readonly string[]).includes(v);
}
