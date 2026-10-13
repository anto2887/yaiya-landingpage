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

/** How long a frame takes to fade in over the one before. Matches .film-frame in globals.css. */
const FADE_MS = 900;
/** Never wait longer than this for the next frame's image before cutting to it anyway. */
const DECODE_CAP_MS = 2500;
/** Above the default 75: these photos are the brand's first impression. */
const QUALITY = 88;

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
  const { props: mobile } = getImageProps({ ...common, src: `/images/hero-${scene.id}-square.jpg`, width: 941, height: 941 });
  const { props: desktop } = getImageProps({ ...common, src: `/images/hero-${scene.id}.jpg`, width: 1672, height: 941 });
  return (
    <picture>
      <source media="(min-width: 1024px)" srcSet={desktop.srcSet} sizes="100vw" />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- decorative; the film has one label */}
      <img {...mobile} data-anim className="film-drift absolute inset-0 size-full object-cover lg:object-[75%_50%]" />
    </picture>
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
        const state = i === active ? "on" : i === prev ? "off" : "idle";
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
          </div>
        );
      })}

      {/* Keeps the logo and nav readable over busy frames. */}
      <span aria-hidden className="absolute inset-x-0 top-0 z-[5] h-24 bg-gradient-to-b from-cream/60 to-transparent lg:h-28" />

      {ready && (
        <div className="absolute right-3 bottom-3 z-10 flex items-center gap-2.5 lg:right-8 lg:bottom-7">
          <p aria-hidden className="rounded-pill bg-paper/85 px-3 py-1.5 type-small font-semibold text-ink backdrop-blur-sm">
            {scenes[active].caption}
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
