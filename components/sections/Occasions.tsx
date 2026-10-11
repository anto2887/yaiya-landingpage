import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { CONVENIENCE_ICONS } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FLAVORS, OCCASION_OPTIONS, site } from "@/content/site";

const { occasions } = site;
const TINTS = ["bg-mango-soft", "bg-mint-soft", "bg-highlight"];

// Flavor tag on each photo, in that flavor's colors. Full class strings for Tailwind.
const FLAVOR_TAG: Record<string, string> = {
  "strawberry-peach": "bg-strawberry text-strawberry-ink",
  "chocolate-silk": "bg-chocolate text-chocolate-ink",
  "matcha-yuzu": "bg-matcha text-matcha-ink",
  all: "bg-white text-berry",
};
const flavorName = (slug: string) => FLAVORS.find((f) => f.slug === slug)?.name ?? occasions.allFlavorsLabel;
const momentLabel = (id: string) => OCCASION_OPTIONS.find((o) => o.id === id)?.label ?? id;

export function Occasions() {
  return (
    <section id="occasions" aria-labelledby="occasions-heading" className="bg-cream py-section">
      <Container>
        <SectionHeading id="occasions-heading" title={occasions.heading} sub={occasions.body} />

        {/* Mobile: a snap row where the next card peeks in. Tablet and up: three columns. */}
        <ul
          aria-label={occasions.scrollerLabel}
          tabIndex={0}
          className="no-scrollbar -mx-4 flex min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-grid sm:overflow-visible sm:px-0"
        >
          {occasions.personas.map((p, i) => (
            <li
              key={p.id}
              data-reveal
              style={{ "--reveal-delay": `${i * 100}ms` } as React.CSSProperties}
              className="group flex w-[80vw] max-w-[340px] shrink-0 snap-start flex-col overflow-hidden rounded-card border border-line bg-paper transition-[transform,box-shadow] duration-300 motion-safe:hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-24px_rgb(58_20_64/0.35)] sm:w-auto sm:max-w-none"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={p.image}
                  alt={p.alt}
                  fill
                  sizes="(min-width: 1024px) 370px, (min-width: 640px) 33vw, 78vw"
                  className="object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-105"
                />
                {/* Soft fade so the name reads over the photo's foot. */}
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-ink/70 to-transparent" />
                <span className={`absolute top-4 left-4 rounded-pill px-3 py-1.5 text-[12px] font-bold shadow-sm ${FLAVOR_TAG[p.flavor]}`}>
                  {flavorName(p.flavor)}
                </span>
                <p className="absolute inset-x-5 bottom-4 type-eyebrow text-white">{p.name}</p>
              </div>
              <div className="p-5">
                <p className="font-heading text-[21px] leading-snug font-semibold text-ink">{p.line}</p>
                <p className="mt-4 type-eyebrow text-muted">{occasions.momentsLabel}</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {p.moments.map((m) => (
                    <li
                      key={m}
                      className="rounded-pill border border-line bg-cream px-3 py-1 text-[13px] font-semibold text-ink transition-colors duration-200 group-hover:border-berry/30 group-hover:bg-highlight"
                    >
                      {momentLabel(m)}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>

        <ul className="mt-6 grid grid-cols-1 gap-grid sm:grid-cols-3">
          {occasions.conveniences.map((c, i) => {
            const Icon = CONVENIENCE_ICONS[c.id];
            return (
              <li
                key={c.id}
                data-reveal
                style={{ "--reveal-delay": `${i * 80}ms` } as React.CSSProperties}
                className={`jelly flex items-center gap-4 rounded-card p-4 lg:p-5 ${TINTS[i % TINTS.length]}`}
              >
                <span aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/80 text-accent">
                  {Icon && <Icon strokeWidth={1.75} className="size-6" />}
                </span>
                <div>
                  <p className="font-heading text-[18px] font-semibold text-ink">{c.title}</p>
                  <p className="type-small text-muted">{c.line}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
