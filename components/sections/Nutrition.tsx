import { Container } from "@/components/ui/Container";
import { IconBadge } from "@/components/ui/IconBadge";
import { STAT_ICONS } from "@/components/ui/icons";
import { site } from "@/content/site";

const { nutrition } = site;
const NOTE_ID = "targets-note";

export function Nutrition() {
  return (
    <section id="nutrition" aria-labelledby="nutrition-heading" className="bg-cream pt-2 pb-section lg:pt-4">
      <Container className="grid gap-6 lg:grid-cols-[25fr_60fr_15fr] lg:items-center lg:gap-6">
        <div>
          <h2 id="nutrition-heading" className="type-h2 text-ink lg:text-[30px]">
            {nutrition.heading}
          </h2>
          <p className="mt-2 type-small text-ink">{nutrition.sub}</p>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4 lg:gap-0">
          {nutrition.stats.map((s) => {
            const Icon = STAT_ICONS[s.id];
            return (
              <div key={s.id} className="flex flex-col items-center text-center lg:border-l lg:border-line lg:px-3 lg:first:border-l-0">
                <IconBadge className="mb-3 size-14 [&>svg]:size-6">{Icon && <Icon strokeWidth={1.75} />}</IconBadge>
                <dt aria-describedby={NOTE_ID} className="font-heading text-[20px] leading-tight font-bold text-ink lg:text-[18px] lg:whitespace-nowrap">
                  {s.value} {s.label}
                </dt>
                <dd className="mt-1 type-small text-muted">{s.line}</dd>
              </div>
            );
          })}
        </dl>

        <p id={NOTE_ID} className="type-footnote text-muted">
          {nutrition.footnote}
        </p>
      </Container>
    </section>
  );
}
