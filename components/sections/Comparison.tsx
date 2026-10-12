import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WaveTop } from "@/components/ui/WaveTop";
import { Wordmark } from "@/components/ui/Wordmark";
import { site } from "@/content/site";
import { Wobbie } from "@/components/Wobbie";

const { comparison } = site;
const [yaiya, ...others] = comparison.columns;

type Cell = { main: string; sub: string };

function CellText({ cell, strong = false }: { cell: Cell; strong?: boolean }) {
  return (
    <>
      <span className={`block leading-snug ${strong ? "font-heading text-[17px] font-bold text-eyebrow" : "font-semibold text-ink"}`}>
        {cell.main}
      </span>
      {cell.sub && <span className="mt-0.5 block text-[12px] leading-snug text-muted">{cell.sub}</span>}
    </>
  );
}

function ColumnHeader({ col }: { col: (typeof comparison.columns)[number] }) {
  return (
    <>
      {col.highlight ? (
        <Wordmark alt={col.name} className="mx-auto block h-7" />
      ) : (
        <span className="block font-heading text-[17px] font-bold text-ink">{col.name}</span>
      )}
      <span className={`mt-1 block text-[12px] font-semibold ${col.highlight ? "text-eyebrow" : "text-muted"}`}>{col.kind}</span>
      {col.status && (
        <span className="mt-2 inline-block rounded-pill bg-primary px-2.5 py-0.5 text-[11px] font-bold text-white">{col.status}</span>
      )}
    </>
  );
}

export function Comparison() {
  const last = comparison.rows.length - 1;

  return (
    <section id="compare" aria-labelledby="compare-heading" className="relative bg-cream py-section">
      <WaveTop fill="fill-linen" />
      <Container>
        <SectionHeading id="compare-heading" title={comparison.heading} sub={comparison.sub} />

        {/* Desktop: the full table. */}
        <div data-reveal className="relative hidden rounded-card bg-white p-6 lg:block lg:p-8">
          {/* Wobbie hangs from the card's bottom edge and swings. */}
          <Wobbie
            id="compare"
            poses={["hang"]}
            idle="swing"
            lines={[...site.wobbie.spots.compare, ...site.wobbie.lines]}
            className="top-full right-14 -mt-3 h-[143px] w-[76px]"
            bubbleClassName="right-full mr-2 bottom-auto top-1/3"
          />
          <table className="w-full border-separate border-spacing-0 text-left text-[14px]">
            <caption className="sr-only">{comparison.caption}</caption>
            <thead>
              <tr>
                <th scope="col" className="w-[16%] pr-4 pb-4 align-bottom type-eyebrow text-muted">
                  {comparison.rowHeader}
                </th>
                {comparison.columns.map((col) => (
                  <th
                    key={col.id}
                    scope="col"
                    className={`w-[21%] px-4 pt-5 pb-4 align-bottom ${col.highlight ? "rounded-t-card bg-oat text-center" : ""}`}
                  >
                    <ColumnHeader col={col} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.rows.map((r, ri) => (
                <tr key={r.id} className="group/row [&>*]:border-t [&>*]:border-line">
                  <th scope="row" className="py-3.5 pr-4 align-top font-bold text-ink">
                    {r.label}
                  </th>
                  {r.cells.map((cell, c) => {
                    const hl = comparison.columns[c].highlight;
                    return (
                      <td
                        key={comparison.columns[c].id}
                        className={`px-4 py-3.5 align-top transition-colors duration-200 ${
                          hl ? `bg-oat text-center ${ri === last ? "rounded-b-card" : ""}` : "group-hover/row:bg-cream"
                        }`}
                      >
                        <CellText cell={cell} strong={hl} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Phones and tablets: one card per row, YAIYA first. No sideways scrolling. */}
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden" aria-label={comparison.caption}>
          {comparison.rows.map((r, ri) => (
            <li
              key={r.id}
              data-reveal
              style={{ "--reveal-delay": `${(ri % 2) * 80}ms` } as React.CSSProperties}
              className="rounded-card bg-white p-4"
            >
              <p className="type-eyebrow text-eyebrow">{r.label}</p>
              <div className="mt-2 rounded-small bg-oat p-3">
                <p className="text-[11px] font-bold tracking-[0.1em] text-eyebrow uppercase">{yaiya.name}</p>
                <div className="mt-1">
                  <CellText cell={r.cells[0]} strong />
                </div>
              </div>
              <dl className="mt-2 divide-y divide-line">
                {others.map((col, c) => (
                  <div key={col.id} className="flex items-start justify-between gap-4 py-2 text-[14px]">
                    <dt className="shrink-0 text-muted">{col.name}</dt>
                    <dd className="text-right">
                      <CellText cell={r.cells[c + 1]} />
                    </dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[12px] leading-snug text-muted lg:hidden">
          {others.map((c) => `${c.name}: ${c.kind.toLowerCase()}`).join(" · ")}
        </p>

        <p className="mt-5 max-w-[900px] type-footnote text-muted">{comparison.footnote}</p>
      </Container>
    </section>
  );
}
