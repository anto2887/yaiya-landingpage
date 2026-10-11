import { Container } from "@/components/ui/Container";
import { IconBadge } from "@/components/ui/IconBadge";
import { BENEFIT_ICONS } from "@/components/ui/icons";
import { site } from "@/content/site";

export function Benefits() {
  return (
    <section aria-label={site.a11y.benefitsLabel} className="border-y border-line bg-cream py-6">
      <Container>
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-0">
          {site.benefits.map((b) => {
            const Icon = BENEFIT_ICONS[b.id];
            return (
              <li
                key={b.id}
                className="flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-4 lg:border-l lg:border-line lg:px-6 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0"
              >
                <IconBadge>{Icon && <Icon strokeWidth={1.75} />}</IconBadge>
                <div>
                  <p className="type-small font-semibold text-ink">{b.title}</p>
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
