import { ChevronRight, Plus } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/content/site";
import { WaveTop } from "@/components/ui/WaveTop";
import { Wobbie } from "@/components/Wobbie";

const { faq } = site;
const COLUMNS = 2;

// Built from the same items as the markup so the two cannot drift.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.items.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export function Faq() {
  // Desktop: items fill two independent columns left to right, so an open
  // item only pushes down its own column. Mobile: the columns become
  // `display: contents` and `order` restores the original sequence.
  const columns = Array.from({ length: COLUMNS }, (_, c) => faq.items.map((item, i) => ({ item, i })).filter(({ i }) => i % COLUMNS === c));

  return (
    <section id="faq" aria-labelledby="faq-heading" className="relative bg-sky py-section">
      <WaveTop fill="fill-cream" flip />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Container>
        <SectionHeading id="faq-heading" title={faq.heading} />

        <div className="relative flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:items-start lg:gap-4">
          {/* Wobbie ponders the questions; shy when the cursor finds him. */}
          <Wobbie
            id="faq"
            poses={["think"]}
            shyOnHover
            lines={[...site.wobbie.spots.faq, ...site.wobbie.lines]}
            className="right-3 bottom-full h-[92px] w-[60px] lg:right-8 lg:h-[160px] lg:w-[106px]"
            bubbleClassName="right-0"
          />
          {columns.map((col, c) => (
            <div key={c} className="contents lg:flex lg:flex-col lg:gap-4">
              {col.map(({ item, i }) => (
                // TODO(M5): track("faq_opened", { question_id: item.id }) on open only.
                <details
                  key={item.id}
                  data-faq-id={item.id}
                  style={{ order: i }}
                  className="group rounded-card border-2 border-line bg-white transition-colors duration-200 open:border-primary/40 open:bg-periwinkle hover:border-primary/40"
                >
                  <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 rounded-card px-5 py-4 [&::-webkit-details-marker]:hidden">
                    <ChevronRight
                      aria-hidden
                      className="size-4 shrink-0 text-primary motion-safe:transition-transform motion-safe:duration-200 group-open:rotate-90"
                    />
                    <span className="flex-1 font-heading text-[17px] leading-snug font-semibold text-ink">{item.q}</span>
                    <span
                      aria-hidden
                      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sun-soft text-ink transition-colors group-open:bg-primary group-open:text-white"
                    >
                      <Plus className="size-4 motion-safe:transition-transform motion-safe:duration-300 group-open:rotate-45" />
                    </span>
                  </summary>
                  <p className="px-5 pb-5 pl-12 type-body text-ink">{item.a}</p>
                </details>
              ))}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
