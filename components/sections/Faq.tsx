import { ChevronRight, Plus } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { site } from "@/content/site";

const { faq } = site;
const COLUMNS = 3;

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
  // Desktop: items fill three independent columns left to right, so an open
  // item only pushes down its own column. Mobile: the columns become
  // `display: contents` and `order` restores the original sequence.
  const columns = Array.from({ length: COLUMNS }, (_, c) =>
    faq.items.map((item, i) => ({ item, i })).filter(({ i }) => i % COLUMNS === c),
  );

  return (
    <section id="faq" aria-labelledby="faq-heading" className="bg-cream py-section">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Container className="grid gap-6 lg:grid-cols-[18fr_82fr] lg:gap-8">
        <h2 id="faq-heading" className="type-h2 text-ink lg:text-[30px]">
          {faq.heading}
        </h2>

        <div className="flex flex-col gap-2.5 lg:grid lg:grid-cols-3 lg:items-start">
          {columns.map((col, c) => (
            <div key={c} className="contents lg:flex lg:flex-col lg:gap-2.5">
              {col.map(({ item, i }) => (
                // TODO(M5): track("faq_opened", { question_id: item.id }) on open only.
                <details key={item.id} data-faq-id={item.id} style={{ order: i }} className="group rounded-small border border-line bg-white">
                  <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2.5 rounded-small px-3.5 py-3 [&::-webkit-details-marker]:hidden">
                    <ChevronRight aria-hidden className="size-4 shrink-0 text-ink" />
                    <span className="flex-1 text-[14px] leading-snug font-semibold text-ink">{item.q}</span>
                    <Plus aria-hidden className="size-4 shrink-0 text-ink motion-safe:transition-transform motion-safe:duration-200 group-open:rotate-45" />
                  </summary>
                  <p className="px-3.5 pb-4 pl-[38px] type-small text-muted">{item.a}</p>
                </details>
              ))}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
