import { Container } from "@/components/ui/Container";
import { STAT_ICONS } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/content/site";

const { nutrition } = site;
const NOTE_ID = "targets-note";

// One candy color per stat card.
const TINTS = ["bg-highlight", "bg-mint-soft", "bg-mango-soft", "bg-strawberry"];

export function Nutrition() {
  return (
    <section id="nutrition" aria-labelledby="nutrition-heading" className="bg-paper py-section">
      <Container>
        <SectionHeading id="nutrition-heading" title={nutrition.heading} sub={nutrition.sub} />

        <dl className="grid grid-cols-2 gap-grid lg:grid-cols-4">
          {nutrition.stats.map((s, i) => {
            const Icon = STAT_ICONS[s.id];
            return (
              <div
                key={s.id}
                data-reveal
                style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}
                className={`jelly flex flex-col rounded-card p-5 lg:p-6 ${TINTS[i % TINTS.length]}`}
              >
                <span aria-hidden className="mb-6 flex size-11 items-center justify-center rounded-full bg-white/80 text-accent lg:mb-10">
                  {Icon && <Icon strokeWidth={1.75} className="size-[22px]" />}
                </span>
                <dt aria-describedby={NOTE_ID} className="font-heading text-ink">
                  <span className="block text-[44px] leading-none font-bold lg:text-[56px]">{s.value}</span>
                  <span className="mt-1 block text-[18px] font-semibold lg:text-[20px]">{s.label}</span>
                </dt>
                <dd className="mt-1 type-small text-muted">{s.line}</dd>
              </div>
            );
          })}
        </dl>

        <p id={NOTE_ID} className="mt-5 type-footnote text-muted">
          {nutrition.footnote}
        </p>
      </Container>
    </section>
  );
}
