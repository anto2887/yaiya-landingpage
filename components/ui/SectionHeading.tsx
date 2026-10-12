import { Eyebrow } from "@/components/ui/Eyebrow";

type SectionHeadingProps = {
  eyebrow?: string;
  /** A string, or lines rendered with a break between them. */
  title: string | readonly string[];
  sub?: string;
  id?: string;
  /** Optional content on the right of the heading on desktop (e.g. a prompt). */
  aside?: React.ReactNode;
  /** "dark" for sections on plum: white heading, light supporting text. */
  tone?: "light" | "dark";
  className?: string;
};

/**
 * The one heading block every section uses: eyebrow, H2, supporting line,
 * left aligned above the content, with the same gap below it everywhere.
 */
export function SectionHeading({ eyebrow, title, sub, id, aside, tone = "light", className = "" }: SectionHeadingProps) {
  const dark = tone === "dark";
  const lines = typeof title === "string" ? [title] : title;
  return (
    <div data-reveal className={`mb-heading flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-10 ${className}`}>
      <div className="max-w-[760px]">
        {eyebrow && (dark ? <p className="mb-3 type-eyebrow text-honey">{eyebrow}</p> : <Eyebrow className="mb-3">{eyebrow}</Eyebrow>)}
        <h2 id={id} className={`type-h2 ${dark ? "text-white" : "text-ink"}`}>
          {lines.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </h2>
        {sub && <p className={`mt-3 type-body ${dark ? "text-white/85" : "text-muted"}`}>{sub}</p>}
      </div>
      {aside && <div className="shrink-0 lg:pb-1">{aside}</div>}
    </div>
  );
}
