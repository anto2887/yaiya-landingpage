"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { FlavorSlug, site } from "@/content/site";
import { FLAVOR_STORAGE_KEY } from "@/lib/flavor";

// Decorative ingredient cutouts, one per card (optional per sections/03-flavors.md).
const CUTOUTS: Record<FlavorSlug, { src: string; width: number; height: number }> = {
  "strawberry-peach": { src: "/images/cutout-strawberry.png", width: 453, height: 444 },
  "chocolate-silk": { src: "/images/cutout-cocoa.png", width: 543, height: 377 },
  "matcha-yuzu": { src: "/images/cutout-yuzu.png", width: 573, height: 481 },
};

// Full class strings so Tailwind can see them.
const TONES = {
  strawberry: { card: "bg-strawberry", ink: "text-strawberry-ink", dot: "bg-accent" },
  chocolate: { card: "bg-chocolate", ink: "text-chocolate-ink", dot: "bg-mango" },
  matcha: { card: "bg-matcha", ink: "text-matcha-ink", dot: "bg-mint" },
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
                className={`group relative block rounded-card text-left transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-safe:hover:-translate-y-1.5 motion-safe:hover:-rotate-1 ${
                  isSelected ? "ring-4 ring-berry ring-offset-4 ring-offset-cream" : ""
                }`}
              >
                <span
                  key={isSelected ? `pick-${pickCount}` : "idle"}
                  className={`relative flex h-[220px] overflow-hidden rounded-card sm:h-[240px] lg:h-[280px] ${tone.card} ${isSelected ? "motion-safe:animate-pop" : ""}`}
                >
                  <span className="flex min-w-0 flex-1 flex-col p-5">
                    <span className={`type-h3 ${tone.ink}`}>{f.name}</span>
                    <span className={`mt-1.5 text-[11px] leading-tight font-bold tracking-[0.1em] uppercase ${tone.ink}`}>{f.descriptors}</span>
                    {/* Cutout above the tag, so selecting lifts it instead of pushing it sideways. */}
                    <span className="mt-auto flex flex-col gap-2">
                      <Image
                        {...CUTOUTS[f.slug]}
                        alt=""
                        aria-hidden
                        sizes="120px"
                        className={`-mr-2 h-14 w-auto self-end object-contain transition-transform duration-500 motion-safe:group-hover:scale-110 motion-safe:group-hover:rotate-6 sm:h-16 lg:h-20 ${isSelected ? "" : "-mb-2"}`}
                      />
                      {isSelected && (
                        <span className="self-start rounded-pill bg-berry px-3 py-1.5 text-[12px] font-bold whitespace-nowrap text-white motion-safe:animate-pop">
                          {flavors.selectedTag}
                        </span>
                      )}
                    </span>
                  </span>
                  {/* Portrait crop until wide photos arrive (D-18). */}
                  <span className="relative aspect-[3/4] h-full shrink-0 overflow-hidden rounded-l-card">
                    <Image
                      src={f.image}
                      alt=""
                      fill
                      sizes="220px"
                      className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
                    />
                  </span>
                </span>

                {/* Confetti on pick. */}
                {isSelected && pickCount > 0 && (
                  <span key={`burst-${pickCount}`} aria-hidden className="pointer-events-none absolute top-1/2 left-1/3 motion-reduce:hidden">
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
