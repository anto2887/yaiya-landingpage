"use client";

import { useId, useRef, useState } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import type { site } from "@/content/site";

type IngredientTabsProps = {
  // Passed from the server so site.ts stays out of the client bundle.
  content: typeof site.ingredientTabs;
};

/** WAI-ARIA tabs pattern with automatic activation. */
export function IngredientTabs({ content }: IngredientTabsProps) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const base = useId();
  const tab = content.tabs[active];

  function select(i: number) {
    setActive(i);
    // TODO(M5): track("ingredient_tab_selected", { tab: content.tabs[i].id })
  }

  function onKeyDown(e: React.KeyboardEvent, i: number) {
    const n = content.tabs.length;
    const moves: Record<string, number> = { ArrowRight: (i + 1) % n, ArrowLeft: (i - 1 + n) % n, Home: 0, End: n - 1 };
    if (!(e.key in moves)) return;
    e.preventDefault();
    const next = moves[e.key];
    refs.current[next]?.focus();
    select(next);
  }

  return (
    <div className="mt-10 rounded-card border border-line bg-paper p-4 sm:p-6 lg:mt-12">
      <Eyebrow>{content.eyebrow}</Eyebrow>
      <h3 className="mt-2 type-h3 text-ink">{content.heading}</h3>

      <div
        role="tablist"
        aria-label={content.heading}
        className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {content.tabs.map((t, i) => {
          const selected = i === active;
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
              className={`inline-flex min-h-11 shrink-0 items-center rounded-pill border px-4 text-[14px] font-semibold whitespace-nowrap transition-colors duration-150 ${
                selected ? "border-ink-deep bg-ink-deep text-white" : "border-outline bg-white text-ink hover:bg-cream"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${base}-panel`}
        aria-labelledby={`${base}-tab-${tab.id}`}
        tabIndex={0}
        className="mt-4 grid gap-4 rounded-small sm:grid-cols-[35fr_65fr] sm:gap-6"
      >
        <div className="flex flex-col justify-center rounded-small bg-highlight p-5">
          <p className="font-heading text-[40px] leading-none font-bold text-ink">{tab.value}</p>
          <p className="mt-2 type-small text-muted">{tab.valueLabel}</p>
        </div>
        <div className="py-1">
          <p className="type-h3 text-ink">{tab.title}</p>
          <p className="mt-2 type-body text-ink">{tab.body}</p>
          <p className="mt-3 type-footnote text-muted">{tab.note}</p>
        </div>
      </div>
    </div>
  );
}
