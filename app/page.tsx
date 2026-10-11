import { Benefits } from "@/components/sections/Benefits";
import { Comparison } from "@/components/sections/Comparison";
import { Faq } from "@/components/sections/Faq";
import { Flavors } from "@/components/sections/Flavors";
import { Giving } from "@/components/sections/Giving";
import { Hero } from "@/components/sections/Hero";
import { KonjacStory } from "@/components/sections/KonjacStory";
import { Nutrition } from "@/components/sections/Nutrition";
import { Occasions } from "@/components/sections/Occasions";
import { StickyCta } from "@/components/sections/StickyCta";
import { Ticker } from "@/components/sections/Ticker";
import { Waitlist } from "@/components/sections/Waitlist";
import { WhatsInside } from "@/components/sections/WhatsInside";
import { site } from "@/content/site";

// Section order: guide/docs/06-page-overview.md
export default function Home() {
  return (
    <>
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <Ticker />
        <Benefits />
        <Flavors content={site.flavors} />
        <Nutrition />
        <Occasions />
        <Giving />
        <KonjacStory />
        <WhatsInside />
        <Comparison />
        <Faq />
        <Waitlist />
      </main>
      {site.features.stickyMobileCta && <StickyCta content={site.stickyCta} />}
    </>
  );
}
