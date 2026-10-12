import { site } from "@/content/site";

/**
 * A scrolling strip of flavor names and approved lines in tangerine.
 * Decorative: every line repeats copy that appears elsewhere, so it is aria-hidden.
 * With reduced motion it stands still.
 */
export function Ticker() {
  // Two identical runs so the -50% loop is seamless.
  const run = [...site.ticker, ...site.ticker];
  return (
    <div aria-hidden className="overflow-hidden bg-tangerine py-3.5 text-white lg:py-4">
      <div className="flex w-max motion-safe:animate-marquee">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center">
            {run.map((item, i) => (
              <li key={i} className="flex items-center font-heading text-[18px] font-semibold whitespace-nowrap lg:text-[22px]">
                <span className="px-5 lg:px-7">{item}</span>
                <span className={`size-2.5 rounded-full ${["bg-mango", "bg-butter-strong", "bg-white"][i % 3]}`} />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
