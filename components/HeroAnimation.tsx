"use client";

import { Pause, Play } from "lucide-react";
import Image, { getImageProps } from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { site } from "@/content/site";

type Film = typeof site.hero.film;
type Scene = Film["scenes"][number];
type PhotoScene = Extract<Scene, { kind: "photo" }>;

const phoneOnly = (s: Scene) => "phoneOnly" in s && s.phoneOnly;

type HeroAnimationProps = {
  // Passed from the server so site.ts stays out of the client bundle.
  film: Film;
};

/** How long a frame takes to fade in over the one before. Matches .film-frame in globals.css. */
const FADE_MS = 900;
/** Never wait longer than this for the next frame's images before cutting to it anyway. */
const DECODE_CAP_MS = 2500;

/* ---------------------------------------------------------------------------------------------
 * Built frames. Positions are % of the frame. Desktop keeps the left ~45% clear for the copy;
 * phones show the frame as its own square block, so the pouch sits in the middle.
 * ------------------------------------------------------------------------------------------- */

type Piece = {
  src: string;
  w: number;
  h: number;
  cls: string;
  /** Delay for the settle-in and the bob, so pieces never move in step. */
  d: number;
};

type FlavorArt = { bg: string; glow: string; pieces: Piece[]; extra?: "droplets" | "silk" | "mist" };

const POUCH: Record<string, Piece> = {
  "strawberry-peach": { src: "/images/pouch-strawberry-peach-v2.png", w: 575, h: 800, cls: "rotate-[-5deg]", d: 0 },
  "chocolate-silk": { src: "/images/pouch-chocolate-silk-v2.png", w: 599, h: 800, cls: "rotate-[4deg]", d: 0 },
  "matcha-yuzu": { src: "/images/pouch-matcha-yuzu-v2.png", w: 580, h: 800, cls: "rotate-[-3deg]", d: 0 },
};

const FLAVOR_ART: Record<string, FlavorArt> = {
  "strawberry-peach": {
    bg: "linear-gradient(100deg, #fdf6f2 0%, #fbe7e1 40%, #f6c4bb 72%, #ee9f97 100%)",
    glow: "rgb(255 255 255 / 0.75)",
    extra: "droplets",
    pieces: [
      { src: "/images/cutout-strawberry.png", w: 453, h: 444, cls: "left-[4%] bottom-[6%] w-[28%] rotate-[-14deg] lg:left-[53%] lg:bottom-[21%] lg:w-[10%]", d: 120 },
      { src: "/images/cutout-peach.png", w: 489, h: 384, cls: "right-[2%] bottom-[5%] w-[32%] rotate-[8deg] lg:right-[11%] lg:bottom-[20%] lg:w-[12%]", d: 220 },
      { src: "/images/cutout-strawberry.png", w: 453, h: 444, cls: "right-[6%] top-[12%] w-[13%] rotate-[24deg] blur-[1.5px] lg:right-[10%] lg:top-[14%] lg:w-[5.5%]", d: 340 },
      { src: "/images/cutout-peach.png", w: 489, h: 384, cls: "left-[8%] top-[16%] w-[14%] rotate-[-30deg] blur-[2px] lg:left-[52%] lg:top-[18%] lg:w-[6%]", d: 420 },
    ],
  },
  "chocolate-silk": {
    bg: "linear-gradient(100deg, #faf3ec 0%, #f2e0cf 40%, #c99470 74%, #8c5537 100%)",
    glow: "rgb(255 236 214 / 0.6)",
    extra: "silk",
    pieces: [
      { src: "/images/cutout-cocoa.png", w: 543, h: 377, cls: "left-[2%] bottom-[5%] w-[34%] rotate-[-6deg] lg:left-[50%] lg:bottom-[20%] lg:w-[13%]", d: 120 },
      { src: "/images/cutout-cocoa.png", w: 543, h: 377, cls: "right-[0%] bottom-[8%] w-[28%] -scale-x-100 rotate-[6deg] lg:right-[11%] lg:bottom-[22%] lg:w-[11%]", d: 240 },
      { src: "/images/cutout-cocoa.png", w: 543, h: 377, cls: "right-[8%] top-[10%] w-[14%] rotate-[18deg] blur-[2px] lg:right-[12%] lg:top-[12%] lg:w-[6%]", d: 380 },
    ],
  },
  "matcha-yuzu": {
    bg: "linear-gradient(100deg, #fbfbf3 0%, #f5f4dc 40%, #e4eca8 74%, #c7da72 100%)",
    glow: "rgb(255 255 240 / 0.85)",
    extra: "mist",
    pieces: [
      { src: "/images/cutout-matcha.png", w: 505, h: 446, cls: "left-[2%] bottom-[5%] w-[32%] rotate-[-4deg] lg:left-[50%] lg:bottom-[20%] lg:w-[12%]", d: 120 },
      { src: "/images/cutout-yuzu.png", w: 573, h: 481, cls: "right-[1%] bottom-[7%] w-[32%] rotate-[6deg] lg:right-[10%] lg:bottom-[21%] lg:w-[12%]", d: 220 },
      { src: "/images/cutout-yuzu.png", w: 573, h: 481, cls: "right-[6%] top-[11%] w-[14%] rotate-[-20deg] blur-[1.5px] lg:right-[11%] lg:top-[13%] lg:w-[6%]", d: 360 },
    ],
  },
};

/** The pouch sits center stage on phones, right of the copy on desktop. */
const POUCH_SLOT = "left-[30%] top-[17%] w-[40%] lg:left-[60%] lg:top-[22%] lg:w-[19%]";

// Small condensation beads: [left %, top %, size px, delay ms]. Desktop positions are on the right.
const DROPLETS: [string, number, number][] = [
  ["left-[18%] top-[30%] lg:left-[56%] lg:top-[34%]", 10, 0],
  ["left-[78%] top-[26%] lg:left-[86%] lg:top-[30%]", 14, 500],
  ["left-[24%] top-[64%] lg:left-[58%] lg:top-[62%]", 8, 900],
  ["left-[70%] top-[58%] lg:left-[82%] lg:top-[56%]", 11, 300],
  ["left-[86%] top-[44%] lg:left-[92%] lg:top-[44%]", 7, 1200],
  ["left-[12%] top-[46%] lg:left-[54%] lg:top-[48%]", 6, 700],
];

function Cutout({ piece, className = "" }: { piece: Piece; className?: string }) {
  // Two wrappers: one settles in when the frame shows, the inner one bobs. Both animate
  // `transform`, so they cannot share an element.
  return (
    <span data-anim className={`film-in absolute block ${piece.cls} ${className}`} style={{ "--d": `${piece.d}ms` } as React.CSSProperties}>
      <span data-anim className="film-bob block" style={{ "--d": `${-piece.d * 3}ms` } as React.CSSProperties}>
        <Image src={piece.src} width={piece.w} height={piece.h} alt="" loading="eager" sizes="(min-width: 1024px) 22vw, 45vw" className="h-auto w-full" />
      </span>
    </span>
  );
}

function FlavorFrame({ id }: { id: string }) {
  const art = FLAVOR_ART[id];
  const pouch = POUCH[id];
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: art.bg }}>
      {/* Studio light behind the pouch. */}
      <span
        className="absolute top-[0%] left-[10%] size-[80%] rounded-full blur-3xl lg:top-[-6%] lg:left-[52%] lg:size-[56%]"
        style={{ background: art.glow }}
      />

      {art.extra === "silk" && (
        // A soft chocolate ribbon drifting behind the pouch.
        <svg data-anim viewBox="0 0 800 400" preserveAspectRatio="none" className="film-ribbon absolute top-[34%] left-[-10%] h-[44%] w-[130%] opacity-50 blur-[1px] lg:left-[40%] lg:w-[70%]">
          <defs>
            <linearGradient id="film-silk" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#f3d7bd" />
              <stop offset="0.5" stopColor="#b5734c" />
              <stop offset="1" stopColor="#6e3b22" />
            </linearGradient>
          </defs>
          <path d="M0 220 C 160 80, 300 360, 460 200 S 700 60, 800 160 L 800 260 C 700 160, 560 340, 440 300 S 160 200, 0 320 Z" fill="url(#film-silk)" />
        </svg>
      )}
      {art.extra === "mist" && (
        <>
          <span data-anim className="film-bob absolute top-[20%] left-[60%] size-[40%] rounded-full bg-white/60 blur-3xl lg:left-[74%] lg:size-[24%]" />
          <span data-anim className="film-bob absolute top-[56%] left-[0%] size-[34%] rounded-full bg-white/50 blur-3xl [--d:-1.4s] lg:left-[50%] lg:size-[20%]" />
        </>
      )}

      {/* Floor shadow so the pouch stands on something. */}
      <span className="absolute bottom-[7%] left-[30%] h-[6%] w-[40%] rounded-[50%] bg-black/20 blur-xl lg:bottom-[27%] lg:left-[60%] lg:w-[19%]" />

      <Cutout
        piece={{ ...pouch, cls: `${POUCH_SLOT} ${pouch.cls} drop-shadow-[0_24px_28px_rgb(60_30_20/0.28)]` }}
        className="z-10"
      />
      {art.pieces.map((p, i) => (
        <Cutout key={i} piece={p} className={i < 2 ? "z-20 drop-shadow-[0_12px_14px_rgb(60_30_20/0.25)]" : "z-0"} />
      ))}

      {art.extra === "droplets" &&
        DROPLETS.map(([pos, size, delay], i) => (
          <span
            key={i}
            data-anim
            className={`film-bob absolute z-30 rounded-full ${pos}`}
            style={
              {
                width: size,
                height: size,
                "--d": `${-delay}ms`,
                background: "radial-gradient(circle at 32% 30%, rgb(255 255 255 / 0.95) 0 18%, rgb(255 255 255 / 0.35) 40%, rgb(255 200 190 / 0.25) 70%, transparent 72%)",
                boxShadow: "inset 0 -1px 2px rgb(150 40 40 / 0.25)",
              } as React.CSSProperties
            }
          />
        ))}
    </div>
  );
}

/** The sensory beat: one big glossy jelly cube with light sliding over it. */
function JellyFrame() {
  const cube = { src: "/images/cutout-konjac.png", w: 443, h: 421 };
  const tint = "[filter:sepia(0.45)_saturate(2.2)_hue-rotate(-18deg)_brightness(1.02)]";
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: "radial-gradient(120% 90% at 72% 45%, #ffd7b5 0%, #fbe6d2 38%, #fbf3ea 70%)" }}
    >
      {/* Out of focus cubes for depth. */}
      <Image
        src={cube.src}
        width={cube.w}
        height={cube.h}
        alt=""
        loading="eager"
        sizes="15vw"
        className={`absolute top-[8%] right-[4%] w-[22%] rotate-[18deg] opacity-80 blur-[6px] lg:right-[6%] lg:w-[10%] ${tint}`}
      />
      <span data-anim className="film-in absolute top-[20%] left-[20%] w-[60%] lg:top-[20%] lg:left-[60%] lg:w-[24%]">
        <span data-anim className="film-wobble relative block origin-bottom">
          <Image src={cube.src} width={cube.w} height={cube.h} alt="" loading="eager" sizes="(min-width: 1024px) 30vw, 64vw" className={`h-auto w-full drop-shadow-[0_30px_30px_rgb(170_80_30/0.3)] ${tint}`} />
          {/* A highlight sweeping across the surface, clipped to the cube's shape. */}
          <span
            data-anim
            className="film-sheen absolute inset-0"
            style={{
              maskImage: `url(${cube.src})`,
              WebkitMaskImage: `url(${cube.src})`,
              maskSize: "100% 100%",
              WebkitMaskSize: "100% 100%",
              backgroundImage: "linear-gradient(105deg, transparent 38%, rgb(255 255 255 / 0.7) 50%, transparent 62%)",
              backgroundSize: "260% 100%",
            }}
          />
        </span>
      </span>
      <Image
        src={cube.src}
        width={cube.w}
        height={cube.h}
        alt=""
        loading="eager"
        sizes="20vw"
        className={`absolute bottom-[-8%] left-[2%] w-[30%] rotate-[-12deg] blur-[8px] lg:left-[46%] lg:w-[13%] ${tint}`}
      />
    </div>
  );
}

function PhotoFrame({ scene, first }: { scene: PhotoScene; first: boolean }) {
  const common = {
    alt: "",
    // Only the opening frame is part of the first paint.
    fetchPriority: first ? "high" : "low",
    loading: "eager",
    sizes: "100vw",
  } as const;
  const { props: mobile } = getImageProps({ ...common, src: scene.mobile, width: 1000, height: 1000 });
  const desktop = "desktop" in scene ? getImageProps({ ...common, src: scene.desktop, width: 1672, height: 941 }).props : null;
  return (
    <picture>
      {desktop && <source media="(min-width: 1024px)" srcSet={desktop.srcSet} sizes="100vw" />}
      {/* eslint-disable-next-line jsx-a11y/alt-text -- decorative; the film has one label */}
      <img {...mobile} data-anim className="film-kenburns absolute inset-0 size-full object-cover lg:object-[80%_50%]" />
    </picture>
  );
}

function Frame({ scene, first }: { scene: Scene; first: boolean }) {
  if (scene.kind === "photo") return <PhotoFrame scene={scene} first={first} />;
  if (scene.kind === "jelly") return <JellyFrame />;
  return <FlavorFrame id={scene.id} />;
}

/* ---------------------------------------------------------------------------------------------
 * The player.
 * ------------------------------------------------------------------------------------------- */

/**
 * The hero film: frames crossfade on a loop behind the copy. It opens on the lineup, which is
 * also the still frame for reduced motion and before JavaScript. The other frames mount after
 * the page has loaded, so they never compete with the first paint. It pauses off screen, in a
 * background tab, and when the viewer presses pause (WCAG 2.2.2).
 */
export function HeroAnimation({ film }: HeroAnimationProps) {
  const { scenes } = film;
  const root = useRef<HTMLDivElement>(null);
  const frames = useRef<(HTMLDivElement | null)[]>([]);
  const [ready, setReady] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [playing, setPlaying] = useState(true);
  const [onScreen, setOnScreen] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  // Time left on the current frame, so a pause resumes where it stopped.
  const remaining = useRef<number>(scenes[0].ms);
  const run = ready && playing && onScreen && tabVisible;

  // Mount the other frames once the page has loaded and the browser is idle.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) setPlaying(false);
    const mq = window.matchMedia("(min-width: 1024px)");
    const onMq = () => setDesktop(mq.matches);
    onMq();
    mq.addEventListener("change", onMq);

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
      mq.removeEventListener("change", onMq);
      window.removeEventListener("load", go);
      window.clearTimeout(idle);
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
    };
  }, []);

  const nextIndex = useCallback(
    (i: number) => {
      let n = (i + 1) % scenes.length;
      // Phone-only frames are skipped on desktop.
      while (desktop && phoneOnly(scenes[n])) n = (n + 1) % scenes.length;
      return n;
    },
    [desktop, scenes],
  );

  useEffect(() => {
    if (!run) return;
    let cancelled = false;
    let fired = false;
    const started = performance.now();
    const timer = window.setTimeout(async () => {
      fired = true;
      const n = nextIndex(active);
      // Wait for the next frame's images so it never fades in half drawn.
      const imgs = Array.from(frames.current[n]?.querySelectorAll("img") ?? []);
      await Promise.race([
        Promise.all(imgs.map((img) => img.decode().catch(() => undefined))),
        new Promise((r) => setTimeout(r, DECODE_CAP_MS)),
      ]);
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
  }, [run, active, nextIndex, scenes]);

  const shown = scenes.map((s, i) => ({ s, i })).filter(({ s }) => !(desktop && phoneOnly(s)));
  const scene = scenes[active];

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
            className={`film-frame absolute inset-0 ${phoneOnly(s) ? "lg:hidden" : ""}`}
            style={{ "--ms": `${s.ms + FADE_MS}ms` } as React.CSSProperties}
          >
            <Frame scene={s} first={i === 0} />
          </div>
        );
      })}

      {/* Keeps the logo and nav readable over busy frames. */}
      <span aria-hidden className="absolute inset-x-0 top-0 z-[5] h-24 bg-gradient-to-b from-cream/70 to-transparent lg:h-32" />

      {ready && (
        <div className="absolute right-3 bottom-3 z-10 flex items-center gap-2.5 lg:right-8 lg:bottom-7">
          <p aria-hidden className="rounded-pill bg-paper/85 px-3 py-1.5 type-small font-semibold text-ink backdrop-blur-sm">
            {scene.caption}
          </p>
          <div aria-hidden className="hidden items-center gap-1 rounded-pill bg-paper/85 px-2.5 py-2.5 backdrop-blur-sm sm:flex">
            {shown.map(({ s, i }) => (
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
