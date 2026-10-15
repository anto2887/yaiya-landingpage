import { Backpack, Dumbbell } from "lucide-react";
import Link from "next/link";
import { HeroAnimation } from "@/components/HeroAnimation";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { JellyIcon, type IconComponent } from "@/components/ui/icons";
import { WaitlistButton } from "@/components/ui/WaitlistButton";
import { site } from "@/content/site";
import { HERO_CTA_ID } from "@/lib/scroll";

const { hero } = site;

const MARKER_ICONS: Record<string, IconComponent> = {
  konjac: JellyIcon,
  protein: Dumbbell,
  "to-go": Backpack,
};

export function Hero() {
  return (
    // Desktop: the film fills the hero and the copy sits on the calm left side of every frame,
    // with no glow behind it (D-25, D-49).
    // Phones: the film comes first as a square block under the nav, then the copy (D-37).
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="relative isolate -mt-nav overflow-hidden bg-cream pb-8 lg:-mt-nav-lg lg:flex lg:aspect-[1672/941] lg:max-h-[850px] lg:min-h-[700px] lg:w-full lg:items-start lg:pt-nav-lg lg:pb-0"
    >
      <div className="relative aspect-square w-full lg:absolute lg:inset-0 lg:-z-10 lg:aspect-auto">
        <HeroAnimation film={hero.film} />
      </div>

      {/* Desktop: pinned to the left edge, not the centered page container, so wide screens
          do not leave a band of empty photo before the copy. Phones use the usual gutters. */}
      <div className="relative w-full px-4 sm:px-6 lg:px-[clamp(24px,6vw,96px)]">
        <div className="pt-5 lg:max-w-[440px] lg:pt-[clamp(48px,7vw,112px)] xl:max-w-[500px]">
          {/* Desktop test (hero-fx): the eyebrow and headline blend with the film using
              "difference". White text shows near-black over the bright walls and flips light
              over shadows as the frames sweep past. */}
          <div className="lg:mix-blend-difference">
            <Eyebrow className="lg:text-white">{hero.eyebrow}</Eyebrow>
            <h1 id="hero-heading" className="mt-3 type-h1 text-ink lg:text-white">
              {hero.headline.lead}{" "}
              {/* HeroAnimation rewrites this on every other cut (.is-writing). */}
              <span id="hero-script" className="hero-script relative inline-block font-hand text-[1.3em] leading-[0.8] font-semibold whitespace-nowrap text-indulge lg:text-indulge-inverse">
                {hero.headline.script}
                {/* A hand-drawn swoosh under the script. */}
                <svg aria-hidden viewBox="0 0 200 16" preserveAspectRatio="none" className="film-swoosh absolute -bottom-[0.12em] left-[2%] h-[0.22em] w-[92%] overflow-visible">
                  <path d="M3 11 C 45 3, 120 2, 197 7" pathLength={1} fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
          </div>

          <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 lg:mt-6">
            {hero.markers.map((m) => {
              const Icon = MARKER_ICONS[m.id];
              return (
                <li key={m.id} className="flex items-center gap-1.5 text-[16px] leading-[1.45] font-semibold text-ink">
                  <span aria-hidden className="flex size-7 items-center justify-center rounded-full bg-paper/80 text-ink">
                    <Icon strokeWidth={1.75} className="size-4" />
                  </span>
                  {m.label}
                </li>
              );
            })}
          </ul>

          <div className="mt-5 flex flex-col items-stretch gap-1 lg:mt-7 lg:flex-row lg:items-center lg:gap-3">
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
      </div>
    </section>
  );
}
