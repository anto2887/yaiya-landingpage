import Image from "next/image";
import { IngredientTabs } from "@/components/sections/IngredientTabs";
import { Container } from "@/components/ui/Container";
import { INSIDE_ICONS } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/content/site";

const { inside } = site;

// `className` sets the rendered width: the cube sits inside its disc, the flavors poke out.
const CUTOUTS: Record<string, { width: number; height: number; className: string }> = {
  "/images/inside-konjac.png": { width: 443, height: 421, className: "w-[64px]" },
  "/images/inside-flavors.png": { width: 640, height: 480, className: "w-[96px] max-w-none" },
};

const TINTS = ["bg-highlight", "bg-mango-soft", "bg-mint-soft", "bg-strawberry", "bg-mango-soft", "bg-mint-soft"];

export function WhatsInside() {
  return (
    <section id="inside" aria-labelledby="inside-heading" className="bg-paper py-section">
      <Container>
        <SectionHeading id="inside-heading" title={inside.heading} sub={inside.sub} />

        <ul className="grid grid-cols-2 gap-grid sm:grid-cols-3 lg:grid-cols-6">
          {inside.items.map((item, i) => {
            const Icon = item.icon ? INSIDE_ICONS[item.icon] : null;
            return (
              <li
                key={item.id}
                data-reveal
                style={{ "--reveal-delay": `${i * 70}ms` } as React.CSSProperties}
                className="jelly flex flex-col items-center rounded-card border border-line bg-cream p-4 text-center"
              >
                <span className={`flex size-20 items-center justify-center rounded-full text-accent ${TINTS[i % TINTS.length]}`}>
                  {item.image ? (
                    <Image src={item.image} {...CUTOUTS[item.image]} alt="" sizes="100px" />
                  ) : (
                    Icon && <Icon aria-hidden strokeWidth={1.5} className="size-9" />
                  )}
                </span>
                <p className="mt-3 font-heading text-[17px] font-semibold text-ink">{item.name}</p>
                <p className="mt-0.5 text-[13px] leading-snug text-muted">{item.line}</p>
              </li>
            );
          })}
        </ul>

        {site.features.ingredientTabs && <IngredientTabs content={site.ingredientTabs} />}
      </Container>
    </section>
  );
}
