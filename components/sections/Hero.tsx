import { getImageProps } from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { HandNote } from "@/components/ui/HandNote";
import { WaitlistButton } from "@/components/ui/WaitlistButton";
import { site } from "@/content/site";

const { hero } = site;

// Art direction: the browser downloads only the image for its breakpoint.
function HeroPicture() {
  // getImageProps ignores `priority`, so the hero asks for high priority directly.
  const common = { alt: hero.image.alt, fetchPriority: "high", loading: "eager" } as const;
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...common, src: hero.image.desktop, width: 1448, height: 1086, sizes: "56vw" });
  const { props: mobile } = getImageProps({ ...common, src: hero.image.mobile, width: 1358, height: 1086, sizes: "100vw" });

  return (
    <picture>
      <source media="(min-width: 1024px)" srcSet={desktopSrcSet} sizes="56vw" />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt comes from getImageProps */}
      <img {...mobile} className="absolute inset-0 size-full object-cover" />
    </picture>
  );
}

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-heading" className="overflow-hidden bg-cream lg:py-10">
      <Container className="grid items-center gap-6 lg:grid-cols-[44fr_56fr] lg:gap-10">
        <div className="pt-5 lg:pt-0">
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
            <WaitlistButton href={hero.primaryCta.href} className="w-full lg:w-auto">
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

        {/* Full bleed on mobile; runs off the right edge of the viewport on desktop. */}
        <div className="relative -mx-4 sm:-mx-6 lg:mr-[calc(-34px-max(0px,(100vw-1180px)/2))] lg:ml-0">
          <div className="relative aspect-[5/4] lg:aspect-[4/3] lg:min-h-[480px] lg:overflow-hidden lg:rounded-l-[28px]">
            <HeroPicture />
          </div>
          <HandNote rotate={6} mark="heart" className="absolute top-6 right-8 max-w-[150px] text-right">
            {hero.note}
          </HandNote>
        </div>
      </Container>
    </section>
  );
}
