"use client";

import { useEffect } from "react";
import { track, trackOnce } from "@/lib/analytics";
import type { CtaLocation, SectionId } from "@/lib/events";

/**
 * Landing-page analytics that need no clicks: landing_viewed once per load, section_viewed the
 * first time half of each [data-section] is visible, and scroll_50 / scroll_90 from two sentinels
 * placed at those depths of the page. Observers only, no scroll listener.
 * Also one delegated listener for markup rendered on the server: [data-cta] buttons, [data-nav]
 * links and the FAQ's <details data-faq-id> (toggle does not bubble, so it listens in capture).
 */
export function LandingTracking() {
  useEffect(() => {
    track("landing_viewed");

    // "Viewed" = half the section is on screen, or it fills half the screen (for sections taller
    // than the screen). Read from the observer's own measurements, so nothing forces a layout.
    const sections = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const screen = e.rootBounds?.height ?? window.innerHeight;
          if (!(e.intersectionRatio >= 0.5 || e.intersectionRect.height >= screen * 0.5)) continue;
          const id = (e.target as HTMLElement).dataset.section as SectionId;
          trackOnce(`section:${id}`, "section_viewed", { section: id });
          sections.unobserve(e.target);
        }
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5] },
    );
    document.querySelectorAll<HTMLElement>("[data-section]").forEach((el) => sections.observe(el));

    const depth = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const d = (e.target as HTMLElement).dataset.depth;
        if (d === "50") trackOnce("scroll_50", "scroll_50");
        if (d === "90") trackOnce("scroll_90", "scroll_90");
        depth.unobserve(e.target);
      }
    });
    document.querySelectorAll<HTMLElement>("[data-depth]").forEach((el) => depth.observe(el));

    const onClick = (e: MouseEvent) => {
      const el = e.target instanceof Element ? e.target.closest<HTMLElement>("[data-cta], [data-nav]") : null;
      if (!el) return;
      if (el.dataset.cta) track("cta_clicked", { location: el.dataset.cta as CtaLocation });
      if (el.dataset.nav) track("nav_link_clicked", { target: el.dataset.nav });
    };
    const onToggle = (e: Event) => {
      const d = e.target;
      if (d instanceof HTMLDetailsElement && d.open && d.dataset.faqId) track("faq_opened", { question_id: d.dataset.faqId });
    };
    document.addEventListener("click", onClick);
    document.addEventListener("toggle", onToggle, true);

    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("toggle", onToggle, true);
      sections.disconnect();
      depth.disconnect();
    };
  }, []);

  return (
    <>
      {/* Positioned against <body>, which is relative and as tall as the page. */}
      <span aria-hidden data-depth="50" className="pointer-events-none absolute top-1/2 left-0 h-px w-px" />
      <span aria-hidden data-depth="90" className="pointer-events-none absolute top-[90%] left-0 h-px w-px" />
    </>
  );
}
