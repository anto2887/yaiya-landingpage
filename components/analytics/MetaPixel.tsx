"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef } from "react";
import { trackPageView } from "@/lib/meta-pixel";

/**
 * Meta's standard pixel base code, in the page and loaded as soon as the page is interactive, only
 * when a pixel id is set. It is not deferred like PostHog: Meta's setup and diagnostic tools look for
 * this exact code on the page and do not wait (founder hit "no pixel detected", 4 Nov).
 * The first PageView comes from the snippet; route changes send their own. Lead is sent by the form.
 */
export function MetaPixel({ pixelId }: { pixelId: string }) {
  const pathname = usePathname();
  const first = useRef(true);
  const valid = /^\d{5,20}$/.test(pixelId);

  useEffect(() => {
    // Lets trackLead() install the pixel itself if a signup beats the script.
    if (valid) document.documentElement.dataset.metaPixel = pixelId;
  }, [pixelId, valid]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    trackPageView();
  }, [pathname]);

  if (!valid) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${pixelId}');fbq('track','PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element -- Meta's no-JavaScript fallback */}
        <img height="1" width="1" style={{ display: "none" }} alt="" src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`} />
      </noscript>
    </>
  );
}
