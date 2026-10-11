"use client";

import { Check } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { FlavorSlug, site } from "@/content/site";
import { FLAVOR_STORAGE_KEY } from "@/lib/flavor";

/**
 * Each card shows its pouch floating over the flavor color and a jelly blob,
 * with a soft shadow. Cutouts are founder-supplied (assets-src/pouch-*.png),
 * cleaned and trimmed to public/images/pouch-*.png.
 * Positions are % of the art area; `hover` is how the pouch moves on hover.
 */
type Piece = {
  src: string;
  width: number;
  height: number;
  style: React.CSSProperties;
  hover: string;
  delay: string;
};

const POUCH_STYLE: React.CSSProperties = { width: "54%", left: "23%", top: "6%" };

const ART: Record<FlavorSlug, Piece[]> = {
  "strawberry-peach": [
    {
      src: "/images/pouch-strawberry-peach.png",
      width: 582,
      height: 800,
      style: { ...POUCH_STYLE, rotate: "-6deg" },
      hover: "group-hover:-translate-y-2 group-hover:-rotate-3 group-hover:scale-105",
      delay: "0s",
    },
  ],
  "chocolate-silk": [
    {
      src: "/images/pouch-chocolate-silk.png",
      width: 600,
      height: 798,
      style: { ...POUCH_STYLE, rotate: "4deg" },
      hover: "group-hover:-translate-y-2 group-hover:rotate-3 group-hover:scale-105",
      delay: "-1.3s",
    },
  ],
  "matcha-yuzu": [
    {
      src: "/images/pouch-matcha-yuzu.png",
      width: 600,
      height: 783,
      style: { ...POUCH_STYLE, rotate: "-3deg" },
      hover: "group-hover:-translate-y-2 group-hover:-rotate-2 group-hover:scale-105",
      delay: "-2.6s",
    },
  ],
};

// Full class strings so Tailwind can see them.
const TONES = {
  strawberry: { card: "bg-strawberry", ink: "text-strawberry-ink", dot: "bg-accent", blob: "fill-white/45" },
  chocolate: { card: "bg-chocolate", ink: "text-chocolate-ink", dot: "bg-mango", blob: "fill-white/35" },
  matcha: { card: "bg-matcha", ink: "text-matcha-ink", dot: "bg-mint", blob: "fill-white/45" },
} as const;

// Confetti directions for the pick burst.
const BURST = [
  [-70, -60],
  [0, -90],
  [70, -60],
  [-90, 10],
  [90, 10],
  [-50, 70],
  [50, 70],
] as const;

function readStoredFlavor(items: FlavorsProps["content"]["items"]): FlavorSlug | null {
  try {
    const v = sessionStorage.getItem(FLAVOR_STORAGE_KEY);
    return items.find((f) => f.slug === v)?.slug ?? null;
  } catch {
    return null;
  }
}

/** A soft jelly-shaped blob behind the ingredients. */
function Blob({ className }: { className: string }) {
  return (
    <svg aria-hidden viewBox="0 0 200 200" className={`absolute inset-[6%] size-[88%] motion-safe:animate-drift ${className}`}>
      <path d="M44 38c22-24 70-30 102-10s40 62 26 96-52 58-92 50S16 140 14 104s8-42 30-66Z" />
    </svg>
  );
}

type FlavorsProps = {
  // Passed from the server page so site.ts stays out of the client bundle.
  content: typeof site.flavors;
};

export function Flavors({ content: flavors }: FlavorsProps) {
  const [selected, setSelected] = useState<FlavorSlug | null>(null);
  // Bumped on every pick so the pop and burst replay.
  const [pickCount, setPickCount] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    setSelected(readStoredFlavor(flavors.items));
  }, [flavors.items]);

  function select(slug: FlavorSlug) {
    if (slug === selected) return;
    setSelected(slug);
    setPickCount((n) => n + 1);
    try {
      sessionStorage.setItem(FLAVOR_STORAGE_KEY, slug);
    } catch {
      // Storage blocked (private mode, in-app browser). The pick still shows.
    }
    // TODO(M5): track("flavor_selected", { flavor: slug })
  }

  // Radio group keyboard pattern: arrows move focus and select.
  function onKeyDown(e: React.KeyboardEvent, index: number) {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const next = (index + keys[e.key] + flavors.items.length) % flavors.items.length;
    refs.current[next]?.focus();
    select(flavors.items[next].slug);
  }

  const focusIndex = Math.max(0, flavors.items.findIndex((f) => f.slug === selected));

  return (
    <section id="flavors" aria-labelledby="flavors-heading" className="bg-cream py-section">
      <Container>
        <SectionHeading
          id="flavors-heading"
          eyebrow={flavors.eyebrow}
          title={flavors.heading}
          aside={<p className="rounded-pill bg-mango-soft px-4 py-2 type-small font-semibold text-ink">{flavors.prompt}</p>}
        />

        <div role="radiogroup" aria-label={flavors.groupLabel} className="grid grid-cols-1 gap-grid lg:grid-cols-3">
          {flavors.items.map((f, i) => {
            const tone = TONES[f.tone];
            const isSelected = f.slug === selected;
            return (
              <button
                key={f.slug}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                type="button"
                role="radio"
                aria-checked={isSelected}
                tabIndex={i === focusIndex ? 0 : -1}
                onClick={() => select(f.slug)}
                onKeyDown={(e) => onKeyDown(e, i)}
                data-reveal
                style={{ "--reveal-delay": `${i * 100}ms` } as React.CSSProperties}
                className={`group relative block rounded-card text-left transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-safe:hover:-translate-y-1.5 ${
                  isSelected ? "ring-4 ring-berry ring-offset-4 ring-offset-cream" : ""
                }`}
              >
                <span
                  key={isSelected ? `pick-${pickCount}` : "idle"}
                  className={`relative flex h-[200px] overflow-hidden rounded-card sm:h-[230px] lg:aspect-[4/5] lg:h-auto lg:flex-col ${tone.card} ${
                    isSelected ? "motion-safe:animate-pop" : ""
                  }`}
                >
                  {/* A soft light from the upper right. */}
                  <span aria-hidden className="absolute inset-0 bg-radial-[at_75%_20%] from-white/55 via-white/10 via-45% to-transparent" />

                  {/* The art: right half on phones, top of the card on desktop. */}
                  <span aria-hidden className="relative order-2 w-[54%] shrink-0 lg:order-1 lg:h-[64%] lg:w-full">
                    <Blob className={tone.blob} />
                    {ART[f.slug].map((p) => (
                      <span key={p.src} className="absolute motion-safe:animate-float" style={{ ...p.style, animationDelay: p.delay }}>
                        <Image
                          src={p.src}
                          width={p.width}
                          height={p.height}
                          alt=""
                          sizes="(min-width: 1024px) 220px, 160px"
                          className={`h-auto w-full drop-shadow-[0_16px_18px_rgb(58_20_64/0.22)] transition-transform duration-500 ease-out ${p.hover}`}
                        />
                      </span>
                    ))}
                  </span>

                  <span className="relative order-1 flex min-w-0 flex-1 flex-col justify-center p-5 lg:order-2 lg:justify-end lg:p-6">
                    <span className={`font-heading text-[24px] leading-tight font-bold lg:text-[28px] ${tone.ink}`}>{f.name}</span>
                    <span className={`mt-1.5 text-[11px] leading-snug font-bold tracking-[0.12em] uppercase ${tone.ink}`}>{f.descriptors}</span>
                    <span className="mt-4 flex items-center gap-2">
                      {/* The check carries the state, not color alone. */}
                      <span
                        aria-hidden
                        className={`flex size-7 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
                          isSelected ? "border-berry bg-berry" : `border-current bg-white/50 ${tone.ink}`
                        }`}
                      >
                        <Check strokeWidth={3} className={`size-4 ${isSelected ? "text-white" : "text-transparent"}`} />
                      </span>
                      {isSelected && (
                        <span className="rounded-pill bg-berry px-3 py-1 text-[12px] font-bold whitespace-nowrap text-white motion-safe:animate-pop">
                          {flavors.selectedTag}
                        </span>
                      )}
                    </span>
                  </span>
                </span>

                {/* Confetti on pick. */}
                {isSelected && pickCount > 0 && (
                  <span key={`burst-${pickCount}`} aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 motion-reduce:hidden">
                    {BURST.map(([x, y], d) => (
                      <span
                        key={d}
                        style={{ "--bx": `${x}px`, "--by": `${y}px` } as React.CSSProperties}
                        className={`absolute size-2.5 rounded-full ${d % 2 ? tone.dot : "bg-berry"} animate-burst`}
                      />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
