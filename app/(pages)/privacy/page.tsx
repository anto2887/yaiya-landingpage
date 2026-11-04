import type { Metadata } from "next";
import { site } from "@/content/site";

const { privacy } = site;

export const metadata: Metadata = {
  title: privacy.metaTitle,
  alternates: { canonical: "/privacy" },
};

/** The privacy notice from site.privacy (guide/docs/pages/privacy.md). */
export default function PrivacyPage() {
  return (
    <main id="main" tabIndex={-1} className="bg-cream py-12 outline-none lg:py-16">
      <article className="mx-auto w-full max-w-[680px] px-gutter">
        <h1 className="type-h1 text-ink">{privacy.title}</h1>
        <p className="mt-3 type-small text-muted">
          {privacy.updatedLabel} {privacy.updated}
        </p>
        <p className="mt-6 text-[16px] leading-relaxed text-ink">{privacy.intro}</p>
        {privacy.sections.map((s) => (
          <section key={s.heading} className="mt-8">
            <h2 className="font-heading text-[22px] leading-tight font-semibold text-ink">{s.heading}</h2>
            {"lead" in s && <p className="mt-3 text-[16px] leading-relaxed text-ink">{s.lead}</p>}
            {"items" in s && (
              <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-[16px] leading-relaxed text-ink marker:text-muted">
                {s.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            {"paragraphs" in s &&
              s.paragraphs.map((p) => (
                <p key={p} className="mt-3 text-[16px] leading-relaxed text-ink">
                  {p}
                </p>
              ))}
          </section>
        ))}
      </article>
    </main>
  );
}
