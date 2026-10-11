import { Eyebrow } from "@/components/ui/Eyebrow";

type SectionHeadingProps = {
  eyebrow?: string;
  /** A string, or lines rendered with a break between them. */
  title: string | readonly string[];
  sub?: string;
  id?: string;
  className?: string;
};

export function SectionHeading({ eyebrow, title, sub, id, className = "" }: SectionHeadingProps) {
  const lines = typeof title === "string" ? [title] : title;
  return (
    <div className={className}>
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
  );
}
