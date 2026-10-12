import { Container } from "@/components/ui/Container";
import { BENEFIT_ICONS } from "@/components/ui/icons";
import { site } from "@/content/site";

// Each benefit gets its own candy color.
const TINTS = ["bg-honey-soft text-ink", "bg-caramel-soft text-ink", "bg-honey text-ink", "bg-sand text-ink"];

export function Benefits() {
  return (
    <section aria-label={site.a11y.benefitsLabel} className="bg-cream pt-8 lg:pt-12">
      <Container>
        <ul className="grid grid-cols-2 gap-grid lg:grid-cols-4">
          {site.benefits.map((b, i) => {
            const Icon = BENEFIT_ICONS[b.id];
            return (
              <li
                key={b.id}
                data-reveal
                style={{ "--reveal-delay": `${i * 80}ms` } as React.CSSProperties}
                className="jelly flex flex-col gap-3 rounded-card border border-line bg-paper p-4 lg:p-5"
              >
                <span aria-hidden className={`flex size-12 items-center justify-center rounded-full ${TINTS[i % TINTS.length]}`}>
                  {Icon && <Icon strokeWidth={1.75} className="size-6" />}
                </span>
                <div>
                  <p className="font-heading text-[17px] leading-tight font-semibold text-ink lg:text-[19px]">{b.title}</p>
                  <p className="mt-1 type-small text-muted">{b.line}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
