/**
 * Wobbie's poses (founder-supplied, cleaned and trimmed to public/images/wobbie/,
 * originals in assets-src/wobbie/), and the stage that keeps only one Wobbie on
 * screen at a time.
 */

export type PoseId = "sleep" | "shy" | "think" | "cheer" | "hold" | "hang" | "sit" | "peek-side" | "peek-up" | "wave";

type Img = { src: string; width: number; height: number };

export const POSES: Record<Exclude<PoseId, "wave">, Img> = {
  sleep: { src: "/images/wobbie/sleep.png", width: 640, height: 335 },
  shy: { src: "/images/wobbie/shy.png", width: 366, height: 640 },
  think: { src: "/images/wobbie/think.png", width: 423, height: 640 },
  cheer: { src: "/images/wobbie/cheer.png", width: 507, height: 640 },
  hold: { src: "/images/wobbie/hold.png", width: 415, height: 640 },
  hang: { src: "/images/wobbie/hang.png", width: 339, height: 640 },
  sit: { src: "/images/wobbie/sit.png", width: 475, height: 640 },
  "peek-side": { src: "/images/wobbie/peek-side.png", width: 338, height: 640 },
  "peek-up": { src: "/images/wobbie/peek-up.png", width: 640, height: 452 },
};

/**
 * The waving pose is a body plus a separate arm, so the arm can really wave.
 * Positions are % of the combined 572 x 640 box; the pivot is the shoulder, in % of the arm.
 */
export const WAVE = {
  width: 572,
  height: 640,
  body: { src: "/images/wobbie/wave-body.png", width: 438, height: 640, left: 23.39, top: 0, w: 76.61 },
  arm: { src: "/images/wobbie/wave-arm.png", width: 164, height: 180, left: 0, top: 24.72, w: 28.69, pivotX: 98.9, pivotY: 83.8 },
};

// --- Stage: only the Wobbie whose section fills the most of the screen is shown. ---

const coverage = new Map<string, number>();
const listeners = new Set<() => void>();
let active: string | null = null;

/** A section must fill at least this share of the viewport for its Wobbie to appear. */
const MIN_COVERAGE = 0.35;

function recompute() {
  let best: string | null = null;
  let bestValue = MIN_COVERAGE;
  for (const [id, value] of coverage) {
    if (value > bestValue) {
      best = id;
      bestValue = value;
    }
  }
  if (best !== active) {
    active = best;
    listeners.forEach((l) => l());
  }
}

export function reportCoverage(id: string, value: number) {
  coverage.set(id, value);
  recompute();
}

export function removeSpot(id: string) {
  coverage.delete(id);
  recompute();
}

export function subscribeStage(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const getActiveSpot = () => active;
