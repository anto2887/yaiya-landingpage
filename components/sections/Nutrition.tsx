import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { CountUp } from "@/components/ui/CountUp";
import { STAT_ICONS } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/content/site";

const { nutrition } = site;
const NOTE_ID = "targets-note";

// One candy color per stat card.
const TINTS: Record<string, string> = {
  protein: "bg-highlight",
  fiber: "bg-mint-soft",
  sugar: "bg-mango-soft",
  "daily-value": "bg-strawberry",
};

// The three pouches, fanned out. Decorative: the flavor section names them.
const FAN = [
  { src: "/images/pouch-chocolate-silk.png", w: 600, h: 798, cls: "left-[2%] top-[10%] -rotate-12 z-0", delay: "-1.2s" },
  { src: "/images/pouch-matcha-yuzu.png", w: 600, h: 783, cls: "right-[2%] top-[10%] rotate-12 z-0", delay: "-2.4s" },
  { src: "/images/pouch-strawberry-peach.png", w: 582, h: 800, cls: "left-1/2 top-0 -translate-x-1/2 z-10", delay: "0s" },
];

type Stat = (typeof nutrition.stats)[number];

function StatCard({ s, index }: { s: Stat; index: number }) {
  const Icon = STAT_ICONS[s.id];
  const split = "split" in s ? s.split : null;
  const detail = "detail" in s ? s.detail : null;
  const total = split ? split.reduce((n, p) => n + p.grams, 0) : 0;

  return (
    <div
      data-reveal
      style={{ "--reveal-delay": `${index * 90}ms` } as React.CSSProperties}
      className={`jelly flex flex-col rounded-card p-5 lg:p-6 ${TINTS[s.id]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <dt aria-describedby={NOTE_ID} className="font-heading text-ink">
          <span className="block text-[44px] leading-none font-bold lg:text-[52px]">
            <CountUp value={s.value} />
          </span>
          <span className="mt-1 block text-[18px] font-semibold lg:text-[20px]">{s.label}</span>
        </dt>
        <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/80 text-accent">
          {Icon && <Icon strokeWidth={1.75} className="size-[22px]" />}
        </span>
      </div>
      <dd className="mt-2 type-small text-muted">
        {s.line}
        {split && (
          // Protein split: proportional bar plus the two numbers as text.
          <span className="mt-4 block">
            <span aria-hidden className="flex h-3 overflow-hidden rounded-pill bg-white/70">
              <span className="h-full bg-berry" style={{ width: `${(split[0].grams / total) * 100}%` }} />
              <span className="h-full bg-mango" style={{ width: `${(split[1].grams / total) * 100}%` }} />
            </span>
            <span className="mt-2 flex justify-between text-[13px] font-semibold text-ink">
              {split.map((p, i) => (
                <span key={p.label} className="flex items-center gap-1.5">
                  <span aria-hidden className={`size-2.5 rounded-full ${i === 0 ? "bg-berry" : "bg-mango"}`} />
                  {p.value} {p.label}
                </span>
              ))}
            </span>
          </span>
        )}
        {detail && <span className="mt-3 block text-[13px] font-semibold text-ink">{detail}</span>}
      </dd>
    </div>
  );
}

export function Nutrition() {
  const [protein, fiber, sugar, dv] = nutrition.stats;

  return (
    <section id="nutrition" aria-labelledby="nutrition-heading" className="overflow-x-clip bg-paper py-section">
      <Container>
        <SectionHeading
          id="nutrition-heading"
          title={nutrition.heading}
          sub={nutrition.sub}
          aside={<p className="rounded-pill bg-highlight px-4 py-2 type-small font-semibold text-ink">{nutrition.perPouch}*</p>}
        />

        {/* Desktop: stats on both sides of the pouch fan. Phones: fan on top, stats below. */}
        <div className="grid grid-cols-1 items-center gap-grid lg:grid-cols-[1fr_minmax(300px,380px)_1fr]">
          <div aria-hidden data-reveal className="relative mx-auto aspect-[5/4] w-full max-w-[340px] lg:order-2 lg:max-w-none">
            {/* Jelly glow behind the pouches. */}
            <span className="absolute inset-[8%] rounded-full bg-highlight blur-2xl" />
            <span className="absolute inset-[18%] rounded-full bg-mango-soft/80 blur-xl motion-safe:animate-drift" />
            {FAN.map((p) => (
              <span key={p.src} className={`absolute w-[44%] ${p.cls}`}>
                <span className="block motion-safe:animate-float" style={{ animationDelay: p.delay }}>
                  <Image
                    src={p.src}
                    width={p.w}
                    height={p.h}
                    alt=""
                    sizes="(min-width: 1024px) 170px, 150px"
                    className="h-auto w-full drop-shadow-[0_18px_20px_rgb(58_20_64/0.22)]"
                  />
                </span>
              </span>
            ))}
          </div>

          <dl className="grid grid-cols-1 gap-grid sm:grid-cols-2 lg:order-1 lg:grid-cols-1">
            <StatCard s={protein} index={0} />
            <StatCard s={fiber} index={1} />
          </dl>
          <dl className="grid grid-cols-1 gap-grid sm:grid-cols-2 lg:order-3 lg:grid-cols-1">
            <StatCard s={sugar} index={2} />
            <StatCard s={dv} index={3} />
          </dl>
        </div>

        <p id={NOTE_ID} className="mt-6 type-footnote text-muted lg:text-center">
          {nutrition.footnote}
        </p>
      </Container>
    </section>
  );
}
