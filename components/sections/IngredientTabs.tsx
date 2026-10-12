"use client";

import { Candy, Droplet, Dumbbell, Leaf, Sparkles, Sun, type LucideProps } from "lucide-react";
import { useId, useRef, useState } from "react";
import { CountUp } from "@/components/ui/CountUp";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { JellyIcon } from "@/components/ui/icons";
import type { site } from "@/content/site";

type IngredientTabsProps = {
  // Passed from the server so site.ts stays out of the client bundle.
  content: typeof site.ingredientTabs;
};

type IconComponent = (props: LucideProps & React.SVGProps<SVGSVGElement>) => React.ReactNode;

// Each tab's icon and colors, keyed by tab id. Full class strings so Tailwind sees them.
// Leaf is for matcha only, never protein or collagen (C-01).
const THEME: Record<string, { Icon: IconComponent; soft: string; dot: string }> = {
  protein: { Icon: Dumbbell, soft: "bg-periwinkle", dot: "bg-lilac-soft" },
  konjac: { Icon: JellyIcon, soft: "bg-butter", dot: "bg-butter-strong" },
  collagen: { Icon: Droplet, soft: "bg-lilac-soft", dot: "bg-lilac" },
  vitamins: { Icon: Sun, soft: "bg-sun-soft", dot: "bg-sun" },
  magnesium: { Icon: Sparkles, soft: "bg-lilac-soft", dot: "bg-lilac" },
  sweeteners: { Icon: Candy, soft: "bg-periwinkle", dot: "bg-lilac-soft" },
  energy: { Icon: Leaf, soft: "bg-butter", dot: "bg-butter-strong" },
};

/** WAI-ARIA tabs pattern with automatic activation. Pills on phones, a side menu on desktop. */
export function IngredientTabs({ content }: IngredientTabsProps) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const base = useId();
  const tab = content.tabs[active];
  const theme = THEME[tab.id];

  function select(i: number) {
    setActive(i);
    // TODO(M5): track("ingredient_tab_selected", { tab: content.tabs[i].id })
  }

  // Horizontal on phones, vertical on desktop: accept both arrow axes.
  function onKeyDown(e: React.KeyboardEvent, i: number) {
    const n = content.tabs.length;
    const moves: Record<string, number> = {
      ArrowRight: (i + 1) % n,
      ArrowDown: (i + 1) % n,
      ArrowLeft: (i - 1 + n) % n,
      ArrowUp: (i - 1 + n) % n,
      Home: 0,
      End: n - 1,
    };
    if (!(e.key in moves)) return;
    e.preventDefault();
    const next = moves[e.key];
    refs.current[next]?.focus();
    select(next);
  }

  return (
    <div data-reveal className="mt-10 rounded-card bg-white p-4 sm:p-6 lg:mt-14 lg:p-8">
      <Eyebrow>{content.eyebrow}</Eyebrow>
      <h3 className="mt-2 type-h2 text-ink lg:text-[34px]">{content.heading}</h3>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[250px_1fr] lg:gap-8">
        <div role="tablist" aria-label={content.heading} className="flex flex-wrap gap-2 lg:flex-col lg:flex-nowrap lg:gap-1.5">
          {content.tabs.map((t, i) => {
            const selected = i === active;
            const { Icon, soft } = THEME[t.id];
            return (
              <button
                key={t.id}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`${base}-tab-${t.id}`}
                aria-selected={selected}
                aria-controls={`${base}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(i)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className={`group/tab inline-flex min-h-11 items-center gap-2.5 rounded-pill border-2 py-1 pr-4 pl-1.5 text-[14px] font-semibold whitespace-nowrap transition-[background-color,border-color,transform] duration-200 motion-safe:active:scale-95 lg:min-h-14 lg:rounded-small lg:pr-3 lg:text-[15px] ${
                  selected ? "border-primary bg-primary text-white" : "border-line bg-white text-ink hover:border-primary/50"
                }`}
              >
                <span
                  aria-hidden
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-transform duration-300 motion-safe:group-hover/tab:-rotate-12 lg:size-10 ${
                    selected ? "bg-white/20 text-white" : `${soft} text-primary`
                  }`}
                >
                  <Icon strokeWidth={1.75} className="size-4 lg:size-5" />
                </span>
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Keyed by tab so it pops in and the number counts up on every switch. */}
        <div
          key={tab.id}
          role="tabpanel"
          id={`${base}-panel`}
          aria-labelledby={`${base}-tab-${tab.id}`}
          tabIndex={0}
          className={`relative overflow-hidden rounded-card p-5 sm:p-7 lg:p-9 ${theme.soft} motion-safe:animate-pop`}
        >
          <span aria-hidden className={`absolute -top-16 -right-16 size-56 rounded-full opacity-40 blur-2xl ${theme.dot}`} />
          <theme.Icon aria-hidden strokeWidth={1} className="absolute -right-4 -bottom-6 size-40 text-white/70" />

          <div className="relative flex flex-wrap items-end gap-x-4 gap-y-1">
            <p className="font-heading text-[56px] leading-none font-bold text-primary lg:text-[72px]">
              <CountUp value={tab.value} durationMs={800} />
            </p>
            <p className="pb-2 type-small font-semibold text-ink">{tab.valueLabel}</p>
          </div>
          <p className="relative mt-5 font-heading text-[24px] leading-tight font-bold text-ink lg:text-[28px]">{tab.title}</p>
          <p className="relative mt-2 max-w-[620px] type-body text-ink">{tab.body}</p>
          <p className="relative mt-3 max-w-[620px] type-footnote text-muted">{tab.note}</p>

          {/* Vitamins tab: the nutrient groups and the role each plays. */}
          {"groups" in tab && (
            <div className="relative mt-6">
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {tab.groups.map((g, i) => (
                  <li
                    key={g.id}
                    style={{ animationDelay: `${120 + i * 80}ms` }}
                    className="rounded-small bg-white p-4 motion-safe:animate-pop"
                  >
                    <p className="text-[11px] font-bold tracking-[0.12em] text-primary uppercase">{g.nutrients}</p>
                    <p className="mt-2 font-heading text-[18px] leading-tight font-semibold text-ink">{g.title}</p>
                    <p className="mt-1.5 type-small text-muted">{g.body}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-3 type-footnote text-muted">{tab.groupsNote}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
