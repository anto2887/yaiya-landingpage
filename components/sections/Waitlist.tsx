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
      <path className="fill-white/30" d="M0 90c180-50 360-60 540-20s360 60 540 10 270-60 360-40V0H0Z" />
      <path className="fill-white/35" d="M0 250c200-40 380-50 560-10s360 50 520 10 260-50 360-30v100H0Z" />
      <path className="fill-white/25" d="M0 290c240-30 420-30 600 0s400 30 560 0 220-30 280-20v50H0Z" />
    </svg>
  );
}

export function Waitlist() {
  return (
    <section id="waitlist" tabIndex={-1} aria-labelledby="waitlist-heading" className="relative isolate overflow-hidden bg-blush py-section outline-none">
      <Waves />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <span className="absolute -top-10 left-[10%] size-56 rounded-full bg-mango/40 blur-3xl motion-safe:animate-drift" />
        <span className="absolute right-[5%] -bottom-16 size-64 rounded-full bg-accent/20 blur-3xl motion-safe:animate-drift [animation-delay:-6s]" />
      </div>

      {/* The finale: one centered stack. */}
      <Container className="relative flex flex-col items-center gap-8 text-center">
        <div data-reveal className="flex max-w-[640px] flex-col items-center gap-5">
          <Image
            src={waitlist.wobbie.src}
            alt={waitlist.wobbie.alt}
            width={1155}
            height={878}
            sizes="(min-width: 1024px) 200px, 160px"
            className="w-[160px] shrink-0 motion-safe:animate-float lg:w-[200px]"
          />
          <div>
            <Eyebrow>{waitlist.eyebrow}</Eyebrow>
            <h2 id="waitlist-heading" className="mt-3 type-h2 text-ink">
              {waitlist.heading}
            </h2>
            <p className="mt-3 type-body text-ink">{waitlist.body}</p>
          </div>
        </div>

        {/* Never hidden by the scroll reveal: the form must show even if JS fails. */}
        <div className="w-full max-w-[560px]">
          <WaitlistForm content={waitlist} />
        </div>
      </Container>
    </section>
  );
}
