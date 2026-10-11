import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { CONVENIENCE_ICONS } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/content/site";

const { occasions } = site;
const TINTS = ["bg-mango-soft", "bg-mint-soft", "bg-highlight"];

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
              className="group w-[78vw] shrink-0 snap-start overflow-hidden rounded-card border border-line bg-paper transition-transform duration-300 motion-safe:hover:-translate-y-1.5 sm:w-auto"
            >
              <div className="relative aspect-[6/5] overflow-hidden">
                <Image
                  src={p.image}
                  alt={p.alt}
                  fill
                  sizes="(min-width: 1024px) 370px, (min-width: 640px) 33vw, 78vw"
                  className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <p className="type-eyebrow text-eyebrow">{p.name}</p>
                <p className="mt-2 font-heading text-[20px] leading-snug font-semibold text-ink">{p.line}</p>
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
