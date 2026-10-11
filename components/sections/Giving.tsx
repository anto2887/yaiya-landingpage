import { Eye, HandHeart, Sprout, Users } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { site } from "@/content/site";

const { giving } = site;

// Icons and tints keyed by `site.giving.points[].id`.
const POINTS: Record<string, { Icon: typeof Eye; tint: string }> = {
  "built-in": { Icon: Sprout, tint: "bg-mint-soft" },
  transparent: { Icon: Eye, tint: "bg-mango-soft" },
  together: { Icon: Users, tint: "bg-highlight" },
};

export function Giving() {
  return (
    <section id="giving" aria-labelledby="giving-heading" className="bg-paper py-section">
      <Container>
        <div data-reveal className="relative isolate overflow-hidden rounded-card bg-berry p-6 text-white sm:p-8 lg:p-12">
          {/* Soft drifting color behind the panel. */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <span className="absolute -top-16 -right-10 size-64 rounded-full bg-berry-hover blur-3xl motion-safe:animate-drift" />
            <span className="absolute -bottom-20 left-1/4 size-64 rounded-full bg-accent/50 blur-3xl motion-safe:animate-drift [animation-delay:-7s]" />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[5fr_7fr] lg:items-center lg:gap-12">
            <div>
              <span aria-hidden className="mb-5 flex size-14 items-center justify-center rounded-full bg-white/15 motion-safe:animate-float">
                <HandHeart strokeWidth={1.75} className="size-7" />
              </span>
              {/* Plain white on berry: the eyebrow color would fail contrast here. */}
              <p className="type-eyebrow text-white">{giving.eyebrow}</p>
              <h2 id="giving-heading" className="mt-3 type-h2">
                {giving.heading}
              </h2>
              <p className="mt-4 type-body text-white">{giving.body}</p>
            </div>

            <ul className="grid grid-cols-1 gap-grid sm:grid-cols-3 lg:grid-cols-1">
              {giving.points.map((p, i) => {
                const { Icon, tint } = POINTS[p.id];
                return (
                  <li
                    key={p.id}
                    data-reveal
                    style={{ "--reveal-delay": `${120 + i * 90}ms` } as React.CSSProperties}
                    className="jelly flex items-center gap-4 rounded-card bg-white p-4 text-ink lg:p-5"
                  >
                    <span aria-hidden className={`flex size-12 shrink-0 items-center justify-center rounded-full text-berry ${tint}`}>
                      <Icon strokeWidth={1.75} className="size-6" />
                    </span>
                    <div>
                      <p className="font-heading text-[18px] font-semibold">{p.title}</p>
                      <p className="type-small text-muted">{p.line}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
