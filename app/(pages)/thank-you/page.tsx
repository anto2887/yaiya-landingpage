import type { Metadata } from "next";
import Image from "next/image";
import { cookies } from "next/headers";
import { ThankYouForm } from "@/components/ThankYouForm";
import { WobbieCursor } from "@/components/WobbieCursor";
import { site } from "@/content/site";
import { SESSION_COOKIE, isUuid } from "@/lib/session";

const { thankYou } = site;

export const metadata: Metadata = {
  title: thankYou.metaTitle,
  robots: { index: false, follow: false },
  alternates: { canonical: "/thank-you" },
};

// Reads the session cookie, so it renders per request.
export const dynamic = "force-dynamic";

export default async function ThankYouPage() {
  const hasSession = isUuid((await cookies()).get(SESSION_COOKIE)?.value);

  return (
    <main id="main" tabIndex={-1} className="bg-cream py-12 outline-none lg:py-16">
      <div className="mx-auto w-full max-w-[560px] px-gutter">
        <div className="relative">
          {/* Wobbie cheers beside the heading on desktop. Decorative. */}
          <Image
            src="/images/wobbie/cheer.png"
            width={507}
            height={640}
            alt=""
            aria-hidden
            priority
            sizes="96px"
            className="absolute top-1/2 -left-32 hidden w-24 -translate-y-1/2 motion-safe:animate-float lg:block"
          />
          <h1 className="type-h1 text-ink">{hasSession ? thankYou.heading : thankYou.noSession}</h1>
        </div>
        <ThankYouForm content={thankYou} hasSession={hasSession} />
      </div>
      {/* Wobbie stays as the cursor after signing up (desktop only, like the landing page). */}
      <WobbieCursor lines={site.wobbie.cursor} />
    </main>
  );
}
