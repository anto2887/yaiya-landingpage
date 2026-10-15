/** Email rules shared by the form (client) and the API (server). No imports, so it stays tiny in the browser. */

export const MAX_EMAIL_LENGTH = 254;

/**
 * Deliberately permissive: one @, something before it, and a dot in the domain.
 * Plus-addresses and new top-level domains pass.
 */
export function isValidEmail(raw: string): boolean {
  const email = raw.trim();
  if (!email || email.length > MAX_EMAIL_LENGTH || /\s/.test(email)) return false;
  const parts = email.split("@");
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || !domain) return false;
  const dot = domain.indexOf(".");
  return dot > 0 && dot < domain.length - 1;
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}
