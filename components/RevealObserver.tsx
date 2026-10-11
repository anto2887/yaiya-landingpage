"use client";

import { useEffect } from "react";

/**
 * Sets data-revealed on every [data-reveal] element the first time it scrolls into
 * view. One observer for the whole page. CSS in globals.css does the animation.
 * An attribute, not a class: React rewrites className on re-render and would
 * strip a class added here, hiding the element again.
 */
export function RevealObserver() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.setAttribute("data-revealed", "");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
