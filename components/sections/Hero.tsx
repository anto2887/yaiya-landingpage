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
function HeroPicture() {
  // getImageProps ignores `priority`, so the hero asks for high priority directly.
  const common = { alt: hero.image.alt, fetchPriority: "high", loading: "eager" } as const;
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...common, src: hero.image.desktop, width: 1448, height: 1086, sizes: "75vw" });
  const { props: mobile } = getImageProps({ ...common, src: hero.image.mobile, width: 1358, height: 1086, sizes: "100vw" });

  return (
    <picture>
      <source media="(min-width: 1024px)" srcSet={desktopSrcSet} sizes="75vw" />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt comes from getImageProps */}
      <img {...mobile} className="absolute inset-0 size-full object-cover lg:object-[30%_50%]" />
    </picture>
  );
}

export function Hero() {
  return (
    // One full-bleed photo card with the copy on top (founder, 11 Oct; replaces D-21).
    // The scene has its pouches in the middle, so on desktop the photo starts just
    // past the text column and its left edge fades into cream: the copy sits over
    // the fade, never over the pouches. On mobile the photo sits under the copy and
    // its top fades up into it.
    <section id="top" aria-labelledby="hero-heading" className="relative overflow-hidden bg-cream">
      <Container className="relative z-10 flex items-center lg:min-h-[520px] lg:py-14 xl:min-h-[600px]">
        <div className="pt-5 lg:max-w-[400px] lg:pt-0 xl:max-w-[480px]">
          <Eyebrow>{hero.eyebrow}</Eyebrow>
          <h1 id="hero-heading" className="mt-3 type-h1 text-ink">
            {hero.headline.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-4 type-kicker text-ink">{hero.kicker}</p>
          <p className="mt-2 max-w-[460px] type-body text-ink">{hero.body}</p>

          <div className="mt-6 flex flex-col items-stretch gap-1 lg:flex-row lg:items-center lg:gap-3">
            <WaitlistButton id={HERO_CTA_ID} href={hero.primaryCta.href} className="w-full lg:w-auto">
              {hero.primaryCta.label}
            </WaitlistButton>
            {/* Mobile: a text link. Desktop: an outline button. */}
            <Link
              href={hero.secondaryCta.href}
              className="inline-flex min-h-11 items-center justify-center self-center rounded-pill px-3 type-button text-ink underline underline-offset-4 transition-colors duration-150 hover:text-accent lg:h-12 lg:self-auto lg:border lg:border-outline lg:px-[22px] lg:no-underline lg:hover:bg-paper lg:hover:text-ink"
            >
              {hero.secondaryCta.label}
            </Link>
          </div>
        </div>
      </Container>

      {/* Mobile: full width under the copy. Desktop: fills the hero from 360px into the content column to the viewport edge. */}
      <div className="relative -mt-6 aspect-[5/4] sm:aspect-[16/10] lg:absolute lg:inset-y-0 lg:right-0 lg:left-[calc(max(0px,(100vw-1180px)/2)+34px+380px)] xl:left-[calc(max(0px,(100vw-1180px)/2)+34px+360px)] lg:mt-0 lg:aspect-auto">
        <HeroPicture />
        <div aria-hidden className="absolute inset-x-0 top-0 h-1/4 bg-linear-to-b from-cream to-transparent lg:inset-y-0 lg:right-auto lg:h-auto lg:w-1/4 lg:bg-linear-to-r" />
        <HandNote rotate={6} mark="heart" className="absolute top-8 right-10 max-w-[150px] text-right">
          {hero.note}
        </HandNote>
      </div>
    </section>
  );
}
