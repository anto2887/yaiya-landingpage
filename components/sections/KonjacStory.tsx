import { ArrowRight, Droplets, Sprout, Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { HandNote } from "@/components/ui/HandNote";
import { site } from "@/content/site";
import { WaveTop } from "@/components/ui/WaveTop";
import { Wobbie } from "@/components/Wobbie";

const { story } = site;

// Icons and tints for the heritage cards, keyed by id.
const HERITAGE: Record<string, { Icon: typeof Sprout; tint: string }> = {
  roots: { Icon: Sprout, tint: "bg-linen" },
  favorite: { Icon: Store, tint: "bg-ivory" },
};

export function KonjacStory() {
  return (
    <section id="story" aria-labelledby="story-heading" className="relative bg-oat py-section">
      <WaveTop fill="fill-cream" />
      <Container>
        {/* One mint panel, same container width as every other section. */}
        <div
          data-reveal
          className="relative mt-14 grid grid-cols-1 gap-6 rounded-card bg-linen p-4 sm:p-6 lg:mt-16 lg:grid-cols-2 lg:items-center lg:gap-12 lg:p-10"
        >
          <div className="relative aspect-[3/2] overflow-hidden rounded-[18px]">
            <Image src={story.image.src} alt={story.image.alt} fill sizes="(min-width: 1024px) 540px, 100vw" className="object-cover" />
          </div>

          <div className="relative lg:pt-10">
            <Eyebrow>{story.eyebrow}</Eyebrow>
            <h2 id="story-heading" className="mt-3 type-h2 text-ink">
              {story.heading.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
            <p className="mt-4 type-body text-ink">{story.body}</p>
            <HandNote rotate={-5} mark="arrow" className="mt-4">
              {story.note}
            </HandNote>
          </div>

          {/* Wobbie stands on the panel's top edge: waves, holds a pouch, ponders. */}
          <Wobbie
            id="story"
            poses={["wave", "hold", "think"]}
            cheerOnTap
            lines={[...site.wobbie.spots.story, ...site.wobbie.lines]}
            className="right-5 bottom-full h-[104px] w-[96px] lg:right-12 lg:h-[160px] lg:w-[146px]"
            bubbleClassName="right-0"
          />
        </div>

        {/* More of the story: heritage, the fiber behind the wobble, and why it's in YAIYA. */}
        <ul className="mt-6 grid grid-cols-1 gap-grid sm:grid-cols-2 lg:grid-cols-3">
          {story.heritage.map((h, i) => {
            const { Icon, tint } = HERITAGE[h.id];
            return (
              <li
                key={h.id}
                data-reveal
                style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}
                className="jelly rounded-card bg-white p-5 lg:p-6"
              >
                <span aria-hidden className={`flex size-12 items-center justify-center rounded-full text-primary ${tint}`}>
                  <Icon strokeWidth={1.75} className="size-6" />
                </span>
                <p className="mt-4 type-eyebrow text-eyebrow">{h.kicker}</p>
                <p className="mt-2 font-heading text-[20px] leading-tight font-semibold text-ink">{h.title}</p>
                <p className="mt-2 type-small text-muted">{h.line}</p>
              </li>
            );
          })}
          <li
            data-reveal
            style={{ "--reveal-delay": "180ms" } as React.CSSProperties}
            className="jelly relative overflow-hidden rounded-card bg-ink p-5 text-white sm:col-span-2 lg:col-span-1 lg:p-6"
          >
            <span aria-hidden className="absolute -top-10 -right-10 size-40 rounded-full bg-primary/40 blur-2xl" />
            <span aria-hidden className="relative flex size-12 items-center justify-center rounded-full bg-white/15 text-honey">
              <Droplets strokeWidth={1.75} className="size-6" />
            </span>
            <p className="relative mt-4 type-eyebrow text-honey">{story.fiber.kicker}</p>
            <p className="relative mt-2 font-heading text-[20px] leading-tight font-semibold">{story.fiber.title}</p>
            <p className="relative mt-2 type-small text-white/85">{story.fiber.line}</p>
          </li>
        </ul>

        <div
          data-reveal
          className="mt-6 flex flex-col gap-4 rounded-card bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 lg:p-6"
        >
          <div>
            <p className="type-eyebrow text-eyebrow">{story.why.kicker}</p>
            <p className="mt-2 max-w-[720px] font-heading text-[18px] leading-snug font-semibold text-ink lg:text-[20px]">
              {story.why.line}
            </p>
          </div>
          <Link
            href={story.why.cta.href}
            className="group/btn inline-flex h-12 shrink-0 items-center justify-center gap-2 self-start rounded-pill border-2 border-outline px-[22px] type-button text-ink transition-colors hover:border-primary hover:bg-oat sm:self-auto"
          >
            {story.why.cta.label}
            <ArrowRight aria-hidden className="size-4 transition-transform motion-safe:group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
