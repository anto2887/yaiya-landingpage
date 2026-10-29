"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef } from "react";
import { trackPageView } from "@/lib/meta-pixel";

/**
 * The standard Meta pixel, loaded after the page is interactive and only when a pixel id is set.
 * Fires PageView on the first load and on each route change. Lead is sent by the signup form.
 */
export function MetaPixel({ pixelId }: { pixelId: string }) {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (!pixelId) return;
    // The first PageView is sent by the snippet itself.
    if (first.current) {
      first.current = false;
      return;
    }
    trackPageView();
  }, [pathname, pixelId]);

  if (!/^\d{5,20}$/.test(pixelId)) return null;

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${pixelId}');fbq('track','PageView');`}
    </Script>
  );
}
