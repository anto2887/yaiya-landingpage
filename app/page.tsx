import { Benefits } from "@/components/sections/Benefits";
import { Flavors } from "@/components/sections/Flavors";
import { Hero } from "@/components/sections/Hero";
import { Nutrition } from "@/components/sections/Nutrition";
import { site } from "@/content/site";

// Sections still to build in M3, in page order (guide/docs/06-page-overview.md).
const PLACEHOLDERS = ["occasions", "story", "inside", "compare", "faq", "waitlist"] as const;

export default function Home() {
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <Hero />
      <Benefits />
      <Flavors content={site.flavors} />
      <Nutrition />
      {PLACEHOLDERS.map((id) => (
        <section
          key={id}
          id={id}
          tabIndex={id === "waitlist" ? -1 : undefined}
          className="border-t border-dashed border-line py-section outline-none"
        >
          <div className="mx-auto flex min-h-60 max-w-content items-center justify-center px-gutter type-eyebrow text-muted">
            [placeholder: {id}]
          </div>
        </section>
      ))}
    </main>
  );
}
