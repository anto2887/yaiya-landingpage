/** id of the waitlist email input. The waitlist form (M3/M4) must use it. */
export const WAITLIST_INPUT_ID = "waitlist-email";

/**
 * Scrolls to #waitlist and focuses the email input once it exists.
 * Returns false if the section is missing, so callers can fall back to the anchor.
 */
export function scrollToWaitlist(): boolean {
  const section = document.getElementById("waitlist");
  if (!section) return false;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  section.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", "#waitlist");

  const input = document.getElementById(WAITLIST_INPUT_ID);
  if (input instanceof HTMLInputElement) {
    input.focus({ preventScroll: true });
  } else {
    section.focus({ preventScroll: true });
  }
  return true;
}
