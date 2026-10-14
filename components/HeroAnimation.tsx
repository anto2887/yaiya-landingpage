"use client";

import { Pause, Play } from "lucide-react";
import { getImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";
import type { site } from "@/content/site";

type Film = typeof site.hero.film;
type Scene = Film["scenes"][number];

type HeroAnimationProps = {
  // Passed from the server so site.ts stays out of the client bundle.
  film: Film;
};

/** How long a frame takes to sweep in over the one before. Matches film-wipe in globals.css. */
const FADE_MS = 1600;
/** Never wait longer than this for the next frame's image before cutting to it anyway. */
const DECODE_CAP_MS = 2500;
/** Matches VERSION in scripts/extend-hero.mjs; bumped when photos change so caches refresh. */
const FRAME_VERSION = "v2";
/** Above the default 75: these photos are the brand's first impression. */
const QUALITY = 88;

/**
 * Per frame: where the camera pulls back from (`focus`, the product in the desktop photo) and,
 * on wide screens (1440px and up), where the handwritten note sits and which way its arrow points.
 * Notes stay right of the copy and off the pouch labels. Positions are % of the hero.
 */
// `width` wraps a long note onto two lines where one would run into the pouch.
const STAGE: Record<string, { focus: string; note: { left: string; top: string; rotate: number; arrow: "down" | "up"; width?: string } }> = {
  lineup: { focus: "68% 50%", note: { left: "45%", top: "21%", rotate: -5, arrow: "down" } },
  desk: { focus: "70% 55%", note: { left: "40.5%", top: "14%", rotate: -4, arrow: "down", width: "6.4em" } },
  reach: { focus: "68% 50%", note: { left: "44%", top: "19%", rotate: -6, arrow: "down" } },
  jelly: { focus: "80% 40%", note: { left: "50%", top: "15%", rotate: -4, arrow: "down" } },
  "strawberry-peach": { focus: "70% 50%", note: { left: "44%", top: "24%", rotate: -5, arrow: "down", width: "7.4em" } },
  "chocolate-silk": { focus: "70% 55%", note: { left: "40.5%", top: "15%", rotate: -5, arrow: "down", width: "5.2em" } },
  "matcha-yuzu": { focus: "70% 55%", note: { left: "44%", top: "16%", rotate: -4, arrow: "down", width: "8.6em" } },
  "to-go": { focus: "72% 40%", note: { left: "41%", top: "20%", rotate: -5, arrow: "down", width: "5.8em" } },
};

/** A hand-drawn arrow that draws itself in, pointing at the product. */
function NoteArrow({ dir }: { dir: "down" | "up" }) {
  return (
    <svg aria-hidden viewBox="0 0 64 44" className={`film-arrow ml-1 inline-block h-9 w-14 align-top ${dir === "up" ? "-scale-y-100" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path pathLength={1} d="M4 8 C 22 4, 44 10, 54 34" />
      <path pathLength={1} d="M54 34 l-9 -4 M54 34 l2 -10" />
    </svg>
  );
}

/** One frame: the wide photo on desktop, its square crop on phones (scripts/extend-hero.mjs). */
function Frame({ scene, first }: { scene: Scene; first: boolean }) {
  const common = {
    alt: "",
    quality: QUALITY,
    // Only the opening frame is part of the first paint.
    fetchPriority: first ? "high" : "low",
    loading: "eager",
    sizes: "100vw",
  } as const;
  const { props: mobile } = getImageProps({ ...common, src: `/images/hero-${scene.id}-${FRAME_VERSION}-square.jpg`, width: 941, height: 941 });
  const { props: desktop } = getImageProps({ ...common, src: `/images/hero-${scene.id}-${FRAME_VERSION}.jpg`, width: 1672, height: 941 });
  return (
    <picture>
      <source media="(min-width: 1024px)" srcSet={desktop.srcSet} sizes="100vw" />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- decorative; the film has one label */}
      <img
        {...mobile}
        data-anim
        style={{ transformOrigin: STAGE[scene.id]?.focus }}
        className="film-drift absolute inset-0 size-full object-cover lg:object-[75%_50%]"
      />
    </picture>
  );
}

/**
 * Wide screens: the frame's handwritten keyword, inside the frame itself. The sweep that brings
 * the photo in reveals the words with the same edge, speed and direction, so the wipe looks
 * like it is drawing them; the next sweep wipes them away. The arrow draws in after.
 */
function FrameNote({ scene }: { scene: Scene }) {
  const note = STAGE[scene.id].note;
  return (
    <p
      aria-hidden
      className="film-frame-note pointer-events-none absolute hidden font-hand text-[36px] leading-none font-semibold whitespace-nowrap text-ink min-[1440px]:block"
      style={
        {
          left: note.left,
          top: note.top,
          rotate: `${note.rotate}deg`,
          // Wrapping notes break after their first comma or full stop.
          ...(note.width && { whiteSpace: "pre-line" }),
        } as React.CSSProperties
      }
    >
      {note.width ? scene.note.replace(/([.,]) /, "$1\n") : scene.note}
      <NoteArrow dir={note.arrow} />
    </p>
  );
}

/**
 * The hero film: the founder's photos crossfade on a loop behind the copy. It opens on the
 * lineup, which is also the still frame for reduced motion and before JavaScript. The other
 * frames mount after the page has loaded, so they never compete with the first paint. It pauses
 * off screen, in a background tab, and when the viewer presses pause (WCAG 2.2.2).
 */
export function HeroAnimation({ film }: HeroAnimationProps) {
  const { scenes } = film;
  const root = useRef<HTMLDivElement>(null);
  const frames = useRef<(HTMLDivElement | null)[]>([]);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [playing, setPlaying] = useState(true);
  const [onScreen, setOnScreen] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  // Time left on the current frame, so a pause resumes where it stopped.
  const remaining = useRef<number>(scenes[0].ms);
  const run = ready && playing && onScreen && tabVisible;
  const scene = scenes[active];

  // Mount the other frames once the page has loaded.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(false);

    let idle: number | undefined;
    const go = () => {
      idle = window.setTimeout(() => setReady(true), 300);
    };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });

    const onVis = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.15 });
    if (root.current) io.observe(root.current);

    return () => {
      window.removeEventListener("load", go);
      window.clearTimeout(idle);
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
    };
  }, []);

  // On every other cut, "soo guilty." in the headline is erased with the sweep and written in again.
  const cuts = useRef(0);
  useEffect(() => {
    if (prev === null) return;
    cuts.current += 1;
    if (cuts.current % 2 === 1) return;
    const script = document.getElementById("hero-script");
    if (!script) return;
    script.classList.remove("is-writing");
    void script.offsetWidth; // restart the animation
    script.classList.add("is-writing");
  }, [active, prev]);

  useEffect(() => {
    if (!run) return;
    let cancelled = false;
    let fired = false;
    const started = performance.now();
    const timer = window.setTimeout(async () => {
      fired = true;
      const n = (active + 1) % scenes.length;
      // Wait for the next frame's image so it never fades in half drawn.
      const img = frames.current[n]?.querySelector("img");
      await Promise.race([img?.decode().catch(() => undefined), new Promise((r) => setTimeout(r, DECODE_CAP_MS))]);
      if (cancelled) {
        // Paused while waiting: cut to the next frame as soon as it resumes.
        remaining.current = 0;
        return;
      }
      remaining.current = scenes[n].ms;
      setPrev(active);
      setActive(n);
    }, remaining.current);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      // Only a pause mid-frame keeps time left; a finished frame already set the next one's.
      if (!fired) remaining.current = Math.max(0, remaining.current - (performance.now() - started));
    };
  }, [run, active, scenes]);

  return (
    <div
      ref={root}
      role="img"
      aria-label={film.label}
      data-paused={run ? undefined : ""}
      className="film absolute inset-0 overflow-hidden bg-cream"
    >
      {scenes.map((s, i) => {
        // Before load only the opening frame exists.
        if (!ready && i !== 0) return null;
        // The opening frame is "still" until the first cut, so the first paint is not animated.
        const state = i === active ? (prev === null ? "still" : "on") : i === prev ? "off" : "idle";
        return (
          <div
            key={s.id}
            ref={(el) => {
              frames.current[i] = el;
            }}
            aria-hidden
            data-state={state}
            className="film-frame absolute inset-0"
            style={{ "--ms": `${s.ms + FADE_MS}ms` } as React.CSSProperties}
          >
            <Frame scene={s} first={i === 0} />
            <FrameNote scene={s} />
          </div>
        );
      })}

      {/* A warm streak of sunlight crossing each cut. Keyed so it replays every time. */}
      {prev !== null && <span key={`leak-${active}`} aria-hidden data-anim className="film-leak pointer-events-none absolute inset-0 z-[4]" />}

      {/* Keeps the logo and nav readable over busy frames. */}
      <span aria-hidden className="absolute inset-x-0 top-0 z-[5] h-24 bg-gradient-to-b from-cream/60 to-transparent lg:h-28" />

      {ready && (
        <div className="absolute right-3 bottom-3 z-10 flex items-center gap-2.5 lg:right-8 lg:bottom-7">
          {/* Narrower screens: the same note as a sticker beside the controls. */}
          <p
            key={`sticker-${active}`}
            aria-hidden
            data-anim
            className="film-note rounded-pill bg-paper/90 px-3.5 pt-1 pb-1.5 font-hand text-[20px] leading-none font-semibold text-ink backdrop-blur-sm min-[1440px]:hidden"
            style={{ "--r": "-2deg", "--ms": `${scene.ms}ms` } as React.CSSProperties}
          >
            {scene.note}
          </p>
          <div aria-hidden className="hidden items-center gap-1 rounded-pill bg-paper/85 px-2.5 py-2.5 backdrop-blur-sm sm:flex">
            {scenes.map((s, i) => (
              <span key={s.id} className="relative block h-1 w-4 overflow-hidden rounded-pill bg-ink/20">
                <span
                  className={`absolute inset-0 origin-left rounded-pill bg-ink ${i === active ? "film-bar-fill" : i < active ? "" : "scale-x-0"}`}
                  style={{ "--ms": `${s.ms}ms` } as React.CSSProperties}
                />
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? film.pause : film.play}
            className="relative flex size-10 items-center justify-center rounded-full bg-paper/85 text-ink backdrop-blur-sm transition-colors duration-150 before:absolute before:-inset-0.5 before:content-[''] hover:bg-paper"
          >
            {playing ? <Pause aria-hidden className="size-4" fill="currentColor" /> : <Play aria-hidden className="size-4" fill="currentColor" />}
          </button>
        </div>
      )}
    </div>
  );
}
