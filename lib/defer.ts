/**
 * Runs `start` once, when the visitor first scrolls, taps or presses a key, or `delayMs` after the
 * page has loaded, whichever comes first. Used for third-party scripts (PostHog, the Meta pixel)
 * so their startup work never competes with the page becoming usable. Returns a cancel function.
 */
const INTENT = ["pointerdown", "keydown", "touchstart", "scroll", "wheel"] as const;

export function onIntentOrLoad(start: () => void, delayMs = 3000): () => void {
  let done = false;
  let timer: number | undefined;
  const run = () => {
    if (done) return;
    done = true;
    cleanup();
    start();
  };
  const arm = () => {
    timer = window.setTimeout(run, delayMs);
  };
  function cleanup() {
    for (const e of INTENT) window.removeEventListener(e, run);
    window.removeEventListener("load", arm);
    window.clearTimeout(timer);
  }
  for (const e of INTENT) window.addEventListener(e, run, { passive: true, once: true });
  if (document.readyState === "complete") arm();
  else window.addEventListener("load", arm, { once: true });
  return () => {
    done = true;
    cleanup();
  };
}
