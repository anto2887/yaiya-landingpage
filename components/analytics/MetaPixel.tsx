"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { onIntentOrLoad } from "@/lib/defer";
import { loadPixel, trackPageView } from "@/lib/meta-pixel";

/**
 * Loads the Meta pixel on the visitor's first scroll, tap or key press, or 3 seconds after load
 * (lib/defer.ts), and only when a pixel id is set. The first PageView comes from the loader; later
 * route changes send their own. Lead is sent by the signup form, which loads the pixel if needed.
 */
export function MetaPixel({ pixelId }: { pixelId: string }) {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (!/^\d{5,20}$/.test(pixelId)) return;
    // Lets trackLead() load the pixel early if someone signs up before the deferred load.
    document.documentElement.dataset.metaPixel = pixelId;
    return onIntentOrLoad(() => loadPixel(pixelId));
  }, [pixelId]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    trackPageView();
  }, [pathname]);

  return null;
}
