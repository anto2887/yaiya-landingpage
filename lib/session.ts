/** Cookie names shared by the API routes, the thank-you page and the QA middleware. */

/** Holds only the random signup id, for 30 minutes, so the thank-you answers reach the same row. Not a login. */
export const SESSION_COOKIE = "yaiya_sid";
export const SESSION_MAX_AGE_S = 30 * 60;

/** Set by visiting any page with ?qa=1. Signups made with it are saved as landing_variant "qa". */
export const QA_COOKIE = "yaiya_qa";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(v: string | undefined | null): v is string {
  return !!v && UUID_RE.test(v);
}
