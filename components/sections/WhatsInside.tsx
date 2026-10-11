import Image from "next/image";
import { IngredientTabs } from "@/components/sections/IngredientTabs";
import { Container } from "@/components/ui/Container";
import { INSIDE_ICONS } from "@/components/ui/icons";
import { site } from "@/content/site";

const { inside } = site;

// `className` sets the rendered width: the cube sits inside its disc, the flavors poke out.
const CUTOUTS: Record<string, { width: number; height: number; className: string }> = {
  "/images/inside-konjac.png": { width: 443, height: 421, className: "w-[72px]" },
  "/images/inside-flavors.png": { width: 640, height: 480, className: "w-[108px] max-w-none" },
};

export function WhatsInside() {
  return (
    <section id="inside" aria-labelledby="inside-heading" className="bg-cream py-section">
      <Container>
        <div className="grid gap-6 lg:grid-cols-[18fr_82fr] lg:items-center lg:gap-6">
          <div>
            <h2 id="inside-heading" className="type-h2 text-ink lg:text-[30px]">
              {inside.heading}
            </h2>
            <p className="mt-2 type-small text-ink">{inside.sub}</p>
          </div>

          <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-6 lg:gap-3">
            {inside.items.map((item) => {
              const Icon = item.icon ? INSIDE_ICONS[item.icon] : null;
              return (
                <li key={item.id} className="flex flex-col items-center text-center">
                  <span className="relative flex size-24 items-center justify-center rounded-full border border-line bg-paper text-accent">
                    {item.image ? (
                      <Image
                        src={item.image}
                        {...CUTOUTS[item.image]}
                        alt=""
                        sizes="120px"
                      />
                    ) : (
                      Icon && <Icon aria-hidden strokeWidth={1.5} className="size-10" />
                    )}
                  </span>
                  <p className="mt-3 text-[15px] font-bold text-ink">{item.name}</p>
                  <p className="mt-0.5 text-[13px] leading-snug text-muted">{item.line}</p>
                </li>
              );
            })}
          </ul>
        </div>

        {site.features.ingredientTabs && <IngredientTabs content={site.ingredientTabs} />}
      </Container>
    </section>
  );
}
