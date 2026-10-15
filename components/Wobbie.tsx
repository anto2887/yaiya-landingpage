"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getActiveSpot, POSES, reportCoverage, removeSpot, subscribeStage, WAVE, type PoseId } from "@/lib/wobbie";

type WobbieProps = {
  /** Unique per page. */
  id: string;
  /** Poses he rotates through while idle. The first is the default. */
  poses: PoseId[];
  /** "peek": slides up from behind the edge at the bottom of this box. "pop": bounces in. */
  enter?: "peek" | "pop";
  /** Idle motion: gentle bob, or a swing from the top (hanging). */
  idle?: "bob" | "swing" | "none";
  /** Speech-bubble lines (from site.wobbie): said on tap, on his first appearance, and now and then while idle. */
  lines?: readonly string[];
  /** Said when focus enters the cheerOnFocusWithin element. */
  focusLines?: readonly string[];
  /** Said as he dozes off. */
  sleepLines?: readonly string[];
  /** Standing spots: jump for joy when tapped. */
  cheerOnTap?: boolean;
  /** Desktop: cover his eyes when the cursor is on him. */
  shyOnHover?: boolean;
  /** Cheer while focus is inside the element with this id (e.g. the waitlist form). */
  cheerOnFocusWithin?: string;
  /** Doze off after this long without interaction. */
  sleepAfterMs?: number;
  /** Position and size of the box (absolute placement, width and height). */
  className?: string;
  bubbleClassName?: string;
};

const usePrefersReducedMotion = () =>
  useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );

const rand = (min: number, max: number) => min + Math.random() * (max - min);

function PoseImage({ pose, visible, wavePlaying }: { pose: PoseId; visible: boolean; wavePlaying: boolean }) {
  const common = `absolute transition-opacity duration-150 ${visible ? "opacity-100" : "opacity-0"}`;
  if (pose === "wave") {
    return (
      <span className={`${common} bottom-0 left-1/2 h-full -translate-x-1/2`} style={{ aspectRatio: `${WAVE.width} / ${WAVE.height}` }}>
        <Image
          src={WAVE.body.src}
          width={WAVE.body.width}
          height={WAVE.body.height}
          alt=""
          sizes="200px"
          className="absolute h-auto"
          style={{
            left: `${WAVE.body.left}%`,
            top: `${WAVE.body.top}%`,
            width: `${WAVE.body.w}%`,
          }}
        />
        <Image
          src={WAVE.arm.src}
          width={WAVE.arm.width}
          height={WAVE.arm.height}
          alt=""
          sizes="80px"
          className={`absolute h-auto ${wavePlaying ? "motion-safe:animate-arm-wave" : ""}`}
          style={{
            left: `${WAVE.arm.left}%`,
            top: `${WAVE.arm.top}%`,
            width: `${WAVE.arm.w}%`,
            transformOrigin: `${WAVE.arm.pivotX}% ${WAVE.arm.pivotY}%`,
          }}
        />
      </span>
    );
  }
  const p = POSES[pose];
  return (
    <Image
      src={p.src}
      width={p.width}
      height={p.height}
      alt=""
      sizes="(min-width: 1024px) 200px, 120px"
      className={`${common} inset-0 size-full object-contain object-bottom`}
    />
  );
}

/**
 * Wobbie, the jelly mascot. Decorative and hidden from assistive tech; tapping him
 * is a small easter egg. Appears only while his section fills most of the screen,
 * and only one Wobbie shows at a time. All motion respects reduced-motion.
 */
export function Wobbie({
  id,
  poses,
  enter = "pop",
  idle = "bob",
  lines = [],
  focusLines = [],
  sleepLines = [],
  cheerOnTap = false,
  shyOnHover = false,
  cheerOnFocusWithin,
  sleepAfterMs,
  className = "",
  bubbleClassName = "",
}: WobbieProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const active = useSyncExternalStore(
    subscribeStage,
    () => getActiveSpot() === id,
    () => false,
  );

  const [index, setIndex] = useState(0);
  const [override, setOverride] = useState<PoseId | null>(null);
  const [ducked, setDucked] = useState(false);
  const [bounce, setBounce] = useState(0);
  const [bubble, setBubble] = useState<string | null>(null);
  const [wavePlaying, setWavePlaying] = useState(true);
  const [poked, setPoked] = useState(0); // resets the sleep timer
  const lastLine = useRef<string | null>(null);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const greeted = useRef(false);

  // Show a line from the pool, never the same one twice in a row. Longer lines stay up longer.
  const say = useCallback((pool: readonly string[]) => {
    const options = pool.length > 1 ? pool.filter((l) => l !== lastLine.current) : pool;
    if (!options.length) return;
    const line = options[Math.floor(Math.random() * options.length)];
    lastLine.current = line;
    setBubble(line);
    clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(() => setBubble(null), Math.min(4500, 1800 + line.length * 45));
  }, []);

  useEffect(() => () => clearTimeout(bubbleTimer.current), []);

  // Report how much of the screen this section fills.
  useEffect(() => {
    const section = ref.current?.closest("section");
    if (!section) return;
    const io = new IntersectionObserver(([e]) => reportCoverage(id, e.intersectionRect.height / window.innerHeight), {
      threshold: Array.from({ length: 21 }, (_, i) => i / 20),
    });
    io.observe(section);
    return () => {
      io.disconnect();
      removeSpot(id);
    };
  }, [id]);

  // Idle loop: every 8 to 15 seconds, do something.
  useEffect(() => {
    if (!active || reduced) return;
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      t = setTimeout(
        () => {
          const roll = Math.random();
          if (poses.length > 1 && roll < 0.5) {
            setIndex((i) => (i + 1) % poses.length);
            setBounce((b) => b + 1);
          } else if (enter === "peek" && roll < 0.8) {
            setDucked(true);
            setTimeout(() => setDucked(false), rand(900, 1600));
          } else {
            setBounce((b) => b + 1);
          }
          // Now and then, say something unprompted.
          if (lines.length && Math.random() < 0.35) setTimeout(() => say(lines), 600);
          setWavePlaying(true);
          tick();
        },
        rand(8000, 15000),
      );
    };
    tick();
    return () => clearTimeout(t);
  }, [active, reduced, poses.length, enter, lines, say]);

  // Each fresh appearance starts on the default pose and waves hello.
  useEffect(() => {
    if (active) {
      setIndex(0);
      setOverride(null);
      setWavePlaying(true);
    } else {
      setBubble(null);
    }
    // Say hello the first time he shows up in this spot.
    // Marked only once said, so scrolling straight past doesn't use it up.
    if (active && !greeted.current && lines.length) {
      const t = setTimeout(() => {
        greeted.current = true;
        say(lines.slice(0, 1));
      }, 900);
      return () => clearTimeout(t);
    }
  }, [active, lines, say]);

  // Stop waving after a few seconds; the idle loop restarts it.
  useEffect(() => {
    if (!wavePlaying) return;
    const t = setTimeout(() => setWavePlaying(false), 3000);
    return () => clearTimeout(t);
  }, [wavePlaying]);

  // Doze off when left alone.
  useEffect(() => {
    if (!active || !sleepAfterMs || reduced) return;
    const t = setTimeout(() => {
      setOverride((o) => o ?? "sleep");
      if (sleepLines.length) say(sleepLines);
    }, sleepAfterMs);
    return () => clearTimeout(t);
  }, [active, sleepAfterMs, reduced, poked, sleepLines, say]);

  // Cheer while the visitor is typing in the form.
  useEffect(() => {
    if (!cheerOnFocusWithin) return;
    const el = document.getElementById(cheerOnFocusWithin);
    if (!el) return;
    const onIn = (e: FocusEvent) => {
      setOverride("cheer");
      setPoked((n) => n + 1);
      // Only when focus arrives from outside, not when moving between fields.
      if (focusLines.length && !el.contains(e.relatedTarget as Node | null)) say(focusLines);
    };
    const onOut = () => setOverride((o) => (o === "cheer" ? null : o));
    el.addEventListener("focusin", onIn);
    el.addEventListener("focusout", onOut);
    return () => {
      el.removeEventListener("focusin", onIn);
      el.removeEventListener("focusout", onOut);
    };
  }, [cheerOnFocusWithin, focusLines, say]);

  const onTap = useCallback(() => {
    setPoked((n) => n + 1);
    setDucked(false);
    setBounce((b) => b + 1);
    setWavePlaying(true);
    if (cheerOnTap) {
      setOverride("cheer");
      setTimeout(() => setOverride((o) => (o === "cheer" ? null : o)), 1400);
    } else {
      setOverride((o) => (o === "sleep" ? null : o));
    }
    if (lines.length) say(lines);
  }, [cheerOnTap, lines, say]);

  const current = override ?? poses[index];
  // Every pose this spot can show, stacked, so swaps are instant.
  const all = Array.from(
    new Set<PoseId>([
      ...poses,
      ...(cheerOnTap || cheerOnFocusWithin ? ["cheer" as const] : []),
      ...(shyOnHover ? ["shy" as const] : []),
      ...(sleepAfterMs ? ["sleep" as const] : []),
    ]),
  );
  const hidden = !active || ducked;

  const motion =
    enter === "peek"
      ? hidden
        ? "translate-y-full"
        : "translate-y-0"
      : hidden
        ? "scale-50 translate-y-6 opacity-0"
        : "scale-100 translate-y-0 opacity-100";

  return (
    <div ref={ref} aria-hidden className={`pointer-events-none absolute z-20 ${className}`}>
      {/* Peek spots clip here, so he can hide behind the edge below; the bubble sits outside the clip. */}
      <div className={`size-full ${enter === "peek" ? "overflow-hidden" : ""}`}>
        <div
          className={`size-full ${reduced ? "" : "transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"} ${motion} ${
            enter === "pop" ? "origin-bottom" : ""
          }`}
        >
          <div
            className={`relative size-full ${idle === "bob" && !hidden ? "motion-safe:animate-float" : ""} ${
              idle === "swing" && !hidden ? "origin-top motion-safe:animate-swing" : ""
            }`}
          >
            <button
              type="button"
              tabIndex={-1}
              data-wobbie-cursor
              onClick={onTap}
              onMouseEnter={shyOnHover ? () => setOverride((o) => o ?? "shy") : undefined}
              onMouseLeave={shyOnHover ? () => setOverride((o) => (o === "shy" ? null : o)) : undefined}
              className={`absolute inset-0 cursor-pointer ${active ? "pointer-events-auto" : ""}`}
            >
              <span key={bounce} className="absolute inset-0 origin-bottom motion-safe:animate-pop">
                {all.map((p) => (
                  <PoseImage key={p} pose={p} visible={p === current} wavePlaying={wavePlaying} />
                ))}
              </span>
            </button>
          </div>
        </div>
      </div>

      {bubble && (
        <p
          className={`absolute bottom-full mb-2 w-max max-w-[220px] rounded-card bg-white px-4 py-2.5 text-center font-heading text-[15px] leading-snug font-semibold text-ink shadow-[0_12px_30px_-12px_rgb(58_20_64/0.35)] motion-safe:animate-pop ${bubbleClassName}`}
        >
          {bubble}
        </p>
      )}
    </div>
  );
}
