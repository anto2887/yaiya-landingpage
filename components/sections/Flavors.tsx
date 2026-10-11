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
  strawberry: { card: "bg-strawberry", ink: "text-strawberry-ink" },
  chocolate: { card: "bg-chocolate", ink: "text-chocolate-ink" },
  matcha: { card: "bg-matcha", ink: "text-matcha-ink" },
} as const;

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
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    setSelected(readStoredFlavor(flavors.items));
  }, [flavors.items]);

  function select(slug: FlavorSlug) {
    if (slug === selected) return;
    setSelected(slug);
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
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading id="flavors-heading" eyebrow={flavors.eyebrow} title={flavors.heading} />
          <p className="type-body font-semibold text-ink lg:pb-1">{flavors.prompt}</p>
        </div>

        <div role="radiogroup" aria-label={flavors.groupLabel} className="mt-6 grid gap-grid lg:grid-cols-3">
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
                className={`relative flex aspect-[16/10] overflow-hidden rounded-card text-left transition-shadow duration-150 sm:aspect-auto sm:h-[240px] lg:aspect-[3/2] lg:h-auto ${tone.card} ${
                  isSelected ? "ring-2 ring-ink ring-offset-2 ring-offset-cream" : ""
                }`}
              >
                <span className="flex min-w-0 flex-1 flex-col p-4 lg:p-5">
                  <span className={`type-h3 ${tone.ink}`}>{f.name}</span>
                  <span className={`mt-1.5 text-[11px] leading-tight font-semibold tracking-[0.1em] uppercase ${tone.ink}`}>
                    {f.descriptors}
                  </span>
                  {/* Cutout above the tag, so selecting lifts it instead of pushing it sideways. */}
                  <span className="mt-auto flex flex-col gap-1.5">
                    <Image
                      {...CUTOUTS[f.slug]}
                      alt=""
                      aria-hidden
                      sizes="120px"
                      className={`-mr-2 h-12 w-auto self-end object-contain sm:h-16 lg:h-[72px] ${isSelected ? "" : "-mb-2"}`}
                    />
                    {isSelected && (
                      <span className="self-start rounded-pill bg-ink-deep px-3 py-1.5 text-[12px] font-bold whitespace-nowrap text-white">
                        {flavors.selectedTag}
                      </span>
                    )}
                  </span>
                </span>
                {/* Portrait crop until wide photos arrive (D-18). */}
                <span className="relative aspect-[3/4] h-full shrink-0 overflow-hidden rounded-l-card">
                  <Image src={f.image} alt="" fill sizes="200px" className="object-cover" />
                </span>
              </button>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
