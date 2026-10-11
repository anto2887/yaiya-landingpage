import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { HandNote } from "@/components/ui/HandNote";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/content/site";

const { comparison } = site;

function Dots({ score, outOf, label }: { score: number; outOf: number; label: string }) {
  return (
    <>
      <span aria-hidden className="flex gap-1">
        {Array.from({ length: outOf }, (_, i) => (
          <span key={i} className={`size-2.5 rounded-full ${i < score ? "bg-accent" : "bg-line"}`} />
        ))}
      </span>
      <span className="sr-only">{`${score} ${label} ${outOf}`}</span>
    </>
  );
}

export function Comparison() {
  const enjoyment = site.features.comparisonEnjoymentRow ? comparison.enjoymentRow : null;
  // The enjoyment row sits before the protein row, as in the mockup.
  const rows = comparison.rows;
  const beforeProtein = rows.filter((r) => r.id !== "protein");
  const protein = rows.filter((r) => r.id === "protein");

  // Highlight column: tinted, bold, strawberry ink. Rounded at the top and bottom.
  const hl = "bg-highlight font-bold text-strawberry-ink";

  return (
    <section id="compare" aria-labelledby="compare-heading" className="bg-cream py-section">
      <Container>
        <SectionHeading id="compare-heading" title={comparison.heading} sub={comparison.sub} />

        <div className="grid grid-cols-1 gap-grid lg:grid-cols-[7fr_5fr] lg:items-stretch">
        <div data-reveal className="min-w-0 rounded-card border border-line bg-paper p-3 sm:p-5 lg:p-6">
          {/* relative: keeps the absolutely positioned sr-only text inside the scroll box. */}
          <div className="relative overflow-x-auto" tabIndex={0} aria-label={comparison.caption}>
            <table className="w-full min-w-[480px] border-separate border-spacing-0 text-left text-[14px]">
              <caption className="sr-only">{comparison.caption}</caption>
              <thead>
                <tr>
                  <td className="sticky left-0 z-10 bg-paper" />
                  {comparison.columns.map((col) => (
                    <th
                      key={col.id}
                      scope="col"
                      className={`px-3 pt-4 pb-3 align-bottom font-heading text-[16px] font-semibold ${col.highlight ? `${hl} rounded-t-small text-center` : "text-ink"}`}
                    >
                      {col.label}
                      {col.sub && <span className="block text-[12px]">{col.sub}</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...beforeProtein.map((r) => ({ kind: "text" as const, r })), ...(enjoyment ? [{ kind: "dots" as const, r: enjoyment }] : []), ...protein.map((r) => ({ kind: "text" as const, r }))].map(
                  ({ kind, r }, rowIndex, all) => {
                    const last = rowIndex === all.length - 1;
                    return (
                      <tr key={r.id} className="[&>*]:border-t [&>*]:border-line">
                        <th scope="row" className="sticky left-0 z-10 bg-paper py-3 pr-3 pl-1 font-bold whitespace-nowrap text-ink">
                          {r.label}
                        </th>
                        {comparison.columns.map((col, c) => (
                          <td
                            key={col.id}
                            className={`px-3 py-3 ${col.highlight ? `${hl} text-center ${last ? "rounded-b-small" : ""}` : "text-ink"}`}
                          >
                            {kind === "dots" && "scores" in r ? (
                              <span className={`flex ${col.highlight ? "justify-center" : ""}`}>
                                <Dots score={r.scores[c]} outOf={r.outOf} label={r.outOfLabel} />
                              </span>
                            ) : (
                              "values" in r && r.values[c]
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-3 px-1 type-footnote text-muted">{comparison.footnote}</p>
        </div>

        <div data-reveal style={{ "--reveal-delay": "120ms" } as React.CSSProperties} className="group relative aspect-[16/10] overflow-hidden rounded-card lg:aspect-auto">
          <Image
            src={comparison.image.src}
            alt={comparison.image.alt}
            fill
            sizes="(min-width: 1024px) 480px, 100vw"
            className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
          />
          <HandNote rotate={-6} mark="heart" className="absolute top-5 right-5 max-w-[170px] text-right">
            {comparison.note}
          </HandNote>
        </div>
        </div>
      </Container>
    </section>
  );
}
