import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { HandNote } from "@/components/ui/HandNote";
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
      <Container className="grid gap-6 lg:grid-cols-[18fr_52fr_30fr] lg:items-center lg:gap-6">
        <div>
          <h2 id="compare-heading" className="type-h2 text-ink lg:text-[30px]">
            {comparison.heading}
          </h2>
          <p className="mt-2 type-small text-ink">{comparison.sub}</p>
        </div>

        <div className="min-w-0">
          <div className="overflow-x-auto rounded-small border border-line bg-paper lg:border-0 lg:bg-transparent" tabIndex={0} aria-label={comparison.caption}>
            <table className="w-full min-w-[480px] border-separate border-spacing-0 text-left text-[13px]">
              <caption className="sr-only">{comparison.caption}</caption>
              <thead>
                <tr>
                  <td className="sticky left-0 z-10 bg-paper lg:bg-cream" />
                  {comparison.columns.map((col) => (
                    <th
                      key={col.id}
                      scope="col"
                      className={`px-3 pt-3 pb-2 align-bottom text-[14px] font-bold ${col.highlight ? `${hl} rounded-t-small text-center` : "text-ink"}`}
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
                        <th scope="row" className="sticky left-0 z-10 bg-paper py-2.5 pr-3 pl-3 font-bold whitespace-nowrap text-ink lg:bg-cream lg:pl-0">
                          {r.label}
                        </th>
                        {comparison.columns.map((col, c) => (
                          <td
                            key={col.id}
                            className={`px-3 py-2.5 ${col.highlight ? `${hl} text-center ${last ? "rounded-b-small" : ""}` : "text-ink"}`}
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
          <p className="mt-3 type-footnote text-muted">{comparison.footnote}</p>
        </div>

        <div className="relative aspect-[16/10] overflow-hidden rounded-card lg:aspect-[4/3]">
          <Image src={comparison.image.src} alt={comparison.image.alt} fill sizes="(min-width: 1024px) 340px, 100vw" className="object-cover" />
          <HandNote rotate={-6} mark="heart" className="absolute top-4 right-4 max-w-[150px] text-right">
            {comparison.note}
          </HandNote>
        </div>
      </Container>
    </section>
  );
}
