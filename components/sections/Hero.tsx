import { getImageProps } from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { HandNote } from "@/components/ui/HandNote";
import { WaitlistButton } from "@/components/ui/WaitlistButton";
import { site } from "@/content/site";
import { HERO_CTA_ID } from "@/lib/scroll";

const { hero } = site;

// Art direction: the browser downloads only the image for its breakpoint.
// Both are extended canvases (scripts/extend-hero.mjs): soft blurred space for the copy,
// the pouches sharp on the right (desktop) or at the bottom (mobile).
function HeroPicture() {
  // getImageProps ignores `priority`, so the hero asks for high priority directly.
  const common = { alt: hero.image.alt, fetchPriority: "high", loading: "eager" } as const;
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...common, src: hero.image.desktop, width: 2400, height: 941, sizes: "100vw" });
  const { props: mobile } = getImageProps({ ...common, src: hero.image.mobile, width: 1176, height: 1992, sizes: "100vw" });

  return (
    <picture>
      <source media="(min-width: 1024px)" srcSet={desktopSrcSet} sizes="100vw" />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt comes from getImageProps */}
      <img {...mobile} className="absolute inset-0 size-full object-cover object-bottom lg:object-[25%_50%] xl:object-[35%_50%]" />
    </picture>
  );
}

/** Soft colored jelly bubbles drifting over the photo. Decorative. */
function Bubbles() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <span className="absolute top-[12%] left-[46%] size-24 rounded-full bg-mango/40 blur-2xl motion-safe:animate-drift lg:size-40" />
      <span className="absolute bottom-[4%] left-[30%] size-24 rounded-full bg-accent/15 blur-2xl motion-safe:animate-drift [animation-delay:-5s] lg:size-36" />
      <span className="absolute top-[8%] right-[8%] size-20 rounded-full bg-mint/40 blur-2xl motion-safe:animate-drift [animation-delay:-9s] lg:size-36" />
    </div>
  );
}

export function Hero() {
  return (
    // The photo fills the whole hero and the copy sits on top of it (founder, D-25).
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="relative isolate -mt-nav overflow-hidden bg-cream pt-nav lg:-mt-nav-lg lg:flex lg:aspect-[2400/941] lg:max-h-[820px] lg:min-h-[560px] xl:min-h-[620px] lg:w-full lg:items-center lg:pt-nav-lg"
    >
      <div className="absolute inset-0 -z-10">
        <HeroPicture />
        {/* A light wash keeps the copy readable over the blurred part of the photo. */}
        <div className="absolute inset-0 bg-linear-to-b from-cream/90 via-cream/60 via-45% to-transparent to-65% lg:bg-linear-to-r lg:from-cream/85 lg:via-cream/45 lg:via-35% lg:to-transparent lg:to-55%" />
        <Bubbles />
      </div>

      <Container className="relative">
        <div className="pt-8 lg:max-w-[410px] lg:py-8 xl:max-w-[460px] xl:py-12">
          <Eyebrow>{hero.eyebrow}</Eyebrow>
          <h1 id="hero-heading" className="mt-3 type-h1 text-ink">
            {hero.headline.map((line, i) => (
              <span key={line} className={`block ${i === 2 ? "text-berry" : ""}`}>
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-4 type-kicker text-ink">{hero.kicker}</p>
          <p className="mt-2 type-body text-ink">{hero.body}</p>

          <div className="mt-6 flex flex-col items-stretch gap-1 lg:flex-row lg:items-center lg:gap-3">
            <WaitlistButton id={HERO_CTA_ID} href={hero.primaryCta.href} className="w-full lg:w-auto">
              {hero.primaryCta.label}
            </WaitlistButton>
            {/* Mobile: a text link. Desktop: an outline button. */}
            <Link
              href={hero.secondaryCta.href}
              className="inline-flex min-h-11 items-center justify-center self-center rounded-pill px-3 type-button text-ink underline underline-offset-4 transition-colors duration-150 hover:text-berry lg:h-12 lg:self-auto lg:border-2 lg:border-outline lg:bg-paper/70 lg:px-[22px] lg:no-underline lg:backdrop-blur-sm lg:hover:border-berry"
            >
              {hero.secondaryCta.label}
            </Link>
          </div>
        </div>

        {/* Mobile: room for the pouches at the bottom of the photo. */}
        <div aria-hidden className="aspect-[1176/880] lg:hidden" />
      </Container>

      <HandNote rotate={6} mark="heart" className="absolute top-24 right-10 max-w-[160px] text-right">
        {hero.note}
      </HandNote>
    </section>
  );
}
