import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { IconBadge } from "@/components/ui/IconBadge";
import { CONVENIENCE_ICONS } from "@/components/ui/icons";
import { site } from "@/content/site";

const { occasions } = site;

export function Occasions() {
  return (
    <section id="occasions" aria-labelledby="occasions-heading" className="bg-cream py-section">
      <Container className="grid gap-6 lg:grid-cols-[24fr_58fr_18fr] lg:items-start lg:gap-6">
        <div>
          <h2 id="occasions-heading" className="type-h2 text-ink lg:text-[32px]">
            {occasions.heading}
          </h2>
          <p className="mt-3 type-small text-ink">{occasions.body}</p>
        </div>

        {/* Mobile: a snap row where the next card peeks in. Tablet and up: three columns. */}
        <ul
          aria-label={occasions.scrollerLabel}
          tabIndex={0}
          className="-mx-4 flex min-w-0 snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {occasions.personas.map((p) => (
            <li key={p.id} className="w-[72vw] shrink-0 snap-start sm:w-auto">
              <div className="relative aspect-[6/5] overflow-hidden rounded-[16px]">
                <Image src={p.image} alt={p.alt} fill sizes="(min-width: 1024px) 220px, (min-width: 640px) 33vw, 72vw" className="object-cover" />
              </div>
              <p className="mt-3 text-[13px] font-bold text-ink">{p.name}</p>
              <p className="mt-0.5 text-[15px] leading-snug text-ink">{p.line}</p>
            </li>
          ))}
        </ul>

        <ul className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 lg:gap-5">
          {occasions.conveniences.map((c) => {
            const Icon = CONVENIENCE_ICONS[c.id];
            return (
              <li key={c.id} className="flex items-start gap-3">
                <IconBadge tone="ink">{Icon && <Icon strokeWidth={1.75} />}</IconBadge>
                <div>
                  <p className="type-small font-bold text-ink">{c.title}</p>
                  <p className="text-[13px] leading-snug text-muted">{c.line}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
