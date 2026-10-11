import { Eyebrow } from "@/components/ui/Eyebrow";

type SectionHeadingProps = {
  eyebrow?: string;
  /** A string, or lines rendered with a break between them. */
  title: string | readonly string[];
  sub?: string;
  id?: string;
  /** Optional content on the right of the heading on desktop (e.g. a prompt). */
  aside?: React.ReactNode;
  className?: string;
};

/**
 * The one heading block every section uses: eyebrow, H2, supporting line,
 * left aligned above the content, with the same gap below it everywhere.
 */
export function SectionHeading({ eyebrow, title, sub, id, aside, className = "" }: SectionHeadingProps) {
  const lines = typeof title === "string" ? [title] : title;
  return (
    <div data-reveal className={`mb-heading flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-10 ${className}`}>
      <div className="max-w-[680px]">
        {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
        <h2 id={id} className="type-h2 text-ink">
          {lines.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </h2>
        {sub && <p className="mt-3 type-body text-muted">{sub}</p>}
      </div>
      {aside && <div className="shrink-0 lg:pb-1">{aside}</div>}
    </div>
  );
}
