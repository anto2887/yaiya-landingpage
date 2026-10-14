import Image from "next/image";
import { IngredientTabs } from "@/components/sections/IngredientTabs";
import { Container } from "@/components/ui/Container";
import { INSIDE_ICONS } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/content/site";
import { WaveTop } from "@/components/ui/WaveTop";
import { Wobbie } from "@/components/Wobbie";

const { inside } = site;

const TINTS = ["bg-highlight", "bg-mango-soft", "bg-lilac-soft", "bg-blush", "bg-mango-soft", "bg-lilac-soft"];

type Item = (typeof inside.items)[number];

/**
 * One ingredient. On desktop the disc faces the pouch: `side="left"` puts text
 * first and the disc on the right, with a dotted line running toward the center.
 */
function Ingredient({ item, index, side }: { item: Item; index: number; side: "left" | "right" }) {
  const Icon = INSIDE_ICONS[item.icon];
  const towardPouch = side === "left";
  return (
    <li
      data-reveal
      style={{ "--reveal-delay": `${index * 80}ms` } as React.CSSProperties}
      className={`group relative flex items-center gap-4 rounded-card border border-line bg-cream p-3 text-left lg:border-0 lg:bg-transparent lg:p-0 ${
        towardPouch ? "lg:flex-row-reverse lg:text-right" : ""
      }`}
    >
      {/* Dotted connector toward the pouch (desktop only). */}
      <span
        aria-hidden
        className={`absolute top-1/2 hidden w-10 border-t-2 border-dotted border-berry/40 lg:block xl:w-14 ${towardPouch ? "-right-12 xl:-right-16" : "-left-12 xl:-left-16"}`}
      />
      <span
        className={`flex size-16 shrink-0 items-center justify-center rounded-full text-accent ring-4 ring-white transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-safe:group-hover:scale-110 motion-safe:group-hover:-rotate-6 lg:size-[88px] ${TINTS[index % TINTS.length]}`}
      >
        {Icon && <Icon aria-hidden strokeWidth={1.5} className="size-8 lg:size-9" />}
      </span>
      <div>
        <p className="font-heading text-[18px] leading-tight font-semibold text-ink lg:text-[20px]">{item.name}</p>
        <p className="mt-1 text-[13px] leading-snug text-muted lg:text-[14px]">{item.line}</p>
      </div>
    </li>
  );
}

export function WhatsInside() {
  const left = inside.items.slice(0, 3);
  const right = inside.items.slice(3);

  return (
    <section id="inside" aria-labelledby="inside-heading" className="relative overflow-x-clip bg-mint-soft py-section">
      <WaveTop fill="fill-highlight" flip />
      <Container>
        <SectionHeading id="inside-heading" title={inside.heading} sub={inside.sub} />

        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_minmax(240px,300px)_1fr] lg:gap-16 xl:gap-20">
          {/* The pouch, center stage. Decorative: the items carry the meaning. */}
          <div aria-hidden data-reveal className="relative mx-auto w-[200px] lg:order-2 lg:w-full">
            <span className="absolute inset-[-18%] rounded-full bg-highlight blur-2xl" />
            <span className="absolute inset-[-4%] rounded-full border-2 border-dashed border-berry/20 motion-safe:animate-[spin_40s_linear_infinite]" />
            <span className="relative block motion-safe:animate-float">
              <Image
                src="/images/pouch-chocolate-silk-v4.png"
                width={587}
                height={800}
                alt=""
                sizes="(min-width: 1024px) 300px, 200px"
                className="h-auto w-full drop-shadow-[0_24px_24px_rgb(58_20_64/0.25)]"
              />
            </span>
          </div>

          {/* Ingredients: two lists so the read order stays left column, then right. */}
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:order-1 lg:grid-cols-1 lg:gap-12">
            {left.map((item, i) => (
              <Ingredient key={item.id} item={item} index={i} side="left" />
            ))}
          </ul>
          <ul className="-mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:order-3 lg:mt-0 lg:grid-cols-1 lg:gap-12">
            {right.map((item, i) => (
              <Ingredient key={item.id} item={item} index={i + 3} side="right" />
            ))}
          </ul>
        </div>

        {site.features.ingredientTabs && (
          <div className="relative">
            {/* Wobbie sits on the card's edge, legs dangling. */}
            <Wobbie
              id="inside"
              poses={["sit"]}
              lines={[...site.wobbie.spots.inside, ...site.wobbie.lines]}
              className="top-10 right-5 h-[108px] w-[80px] -translate-y-[84%] lg:top-14 lg:-translate-y-[68%] lg:right-10 lg:h-[162px] lg:w-[120px]"
              bubbleClassName="right-0"
            />
            <IngredientTabs content={site.ingredientTabs} />
          </div>
        )}
      </Container>
    </section>
  );
}
