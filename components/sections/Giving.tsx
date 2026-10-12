import { Eye, HandHeart, Sprout, Users } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { site } from "@/content/site";
import { WaveTop } from "@/components/ui/WaveTop";
import { Wobbie } from "@/components/Wobbie";

const { giving } = site;

// Icons and tints keyed by `site.giving.points[].id`.
const POINTS: Record<string, { Icon: typeof Eye; tint: string }> = {
  "built-in": { Icon: Sprout, tint: "bg-linen" },
  transparent: { Icon: Eye, tint: "bg-ivory" },
  together: { Icon: Users, tint: "bg-oat" },
};

export function Giving() {
  return (
    <section id="giving" aria-labelledby="giving-heading" className="relative bg-cream py-section">
      <WaveTop fill="fill-honey-soft" flip />
      <Container className="relative">
        {/* Wobbie's first appearance: peeking over the panel. */}
        <Wobbie
          id="giving"
          poses={["peek-up"]}
          enter="peek"
          idle="none"
          lines={[...site.wobbie.spots.giving, ...site.wobbie.lines]}
          className="right-10 bottom-full h-[68px] w-[96px] sm:right-14 lg:right-24 lg:h-[106px] lg:w-[150px]"
          bubbleClassName="right-0"
        />
        <div data-reveal className="relative isolate overflow-hidden rounded-card bg-honey p-6 text-ink sm:p-8 lg:p-12">
          {/* Soft drifting color behind the panel. */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <span className="absolute -top-16 -right-10 size-64 rounded-full bg-white/40 blur-3xl motion-safe:animate-drift" />
            <span className="absolute -bottom-20 left-1/4 size-64 rounded-full bg-caramel/50 blur-3xl motion-safe:animate-drift [animation-delay:-7s]" />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[5fr_7fr] lg:items-center lg:gap-12">
            <div>
              <span
                aria-hidden
                className="mb-5 flex size-14 items-center justify-center rounded-full bg-white/50 motion-safe:animate-float"
              >
                <HandHeart strokeWidth={1.75} className="size-7" />
              </span>
              <p className="type-eyebrow text-ink">{giving.eyebrow}</p>
              <h2 id="giving-heading" className="mt-3 type-h2">
                {giving.heading}
              </h2>
              <p className="mt-4 type-body text-ink">{giving.body}</p>
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
                    <span aria-hidden className={`flex size-12 shrink-0 items-center justify-center rounded-full text-primary ${tint}`}>
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
