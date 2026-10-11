import Image from "next/image";
import { WaitlistForm } from "@/components/WaitlistForm";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { site } from "@/content/site";

const { waitlist } = site;

/** Soft waves drawn in SVG, since no waitlist-bg.jpg was supplied. */
function Waves() {
  return (
    <svg aria-hidden viewBox="0 0 1440 320" preserveAspectRatio="none" className="absolute inset-0 size-full">
      <path className="fill-white/25" d="M0 90c180-50 360-60 540-20s360 60 540 10 270-60 360-40V0H0Z" />
      <path className="fill-white/30" d="M0 250c200-40 380-50 560-10s360 50 520 10 260-50 360-30v100H0Z" />
      <path className="fill-white/20" d="M0 290c240-30 420-30 600 0s400 30 560 0 220-30 280-20v50H0Z" />
    </svg>
  );
}

export function Waitlist() {
  return (
    <section id="waitlist" tabIndex={-1} aria-labelledby="waitlist-heading" className="relative bg-blush outline-none">
      <Waves />
      <Container className="relative grid items-center gap-6 py-10 text-center lg:grid-cols-[19fr_39fr_42fr] lg:gap-8 lg:py-14 lg:text-left">
        <Image
          src={waitlist.wobbie.src}
          alt={waitlist.wobbie.alt}
          width={1155}
          height={878}
          sizes="(min-width: 1024px) 240px, 140px"
          className="mx-auto w-[140px] lg:-mt-16 lg:w-full lg:max-w-[220px]"
        />
        <div>
          <Eyebrow>{waitlist.eyebrow}</Eyebrow>
          <h2 id="waitlist-heading" className="mt-3 type-h2 text-ink lg:text-[34px]">
            {waitlist.heading}
          </h2>
          <p className="mt-3 type-small text-ink">{waitlist.body}</p>
        </div>
        <div className="mx-auto w-full max-w-[460px] lg:mx-0 lg:max-w-none">
          <WaitlistForm content={waitlist} />
        </div>
      </Container>
    </section>
  );
}
