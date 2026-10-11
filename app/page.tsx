// M1 shell: one empty section per row of guide/docs/06-page-overview.md.
// Each placeholder is replaced by its section component in M2 and M3.
const SECTIONS = [
  { key: "hero", id: "top" },
  { key: "benefits" },
  { key: "flavors", id: "flavors" },
  { key: "nutrition", id: "nutrition" },
  { key: "occasions", id: "occasions" },
  { key: "story", id: "story" },
  { key: "inside", id: "inside" },
  { key: "compare", id: "compare" },
  { key: "faq", id: "faq" },
  { key: "waitlist", id: "waitlist" },
] as const;

export default function Home() {
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      {SECTIONS.map((s) => (
        <section
          key={s.key}
          id={"id" in s ? s.id : undefined}
          tabIndex={s.key === "waitlist" ? -1 : undefined}
          className="border-b border-dashed border-line py-section outline-none"
        >
          <div className="mx-auto flex min-h-60 max-w-content items-center justify-center px-gutter type-eyebrow text-muted">
            [placeholder: {s.key}]
          </div>
        </section>
      ))}
    </main>
  );
}
