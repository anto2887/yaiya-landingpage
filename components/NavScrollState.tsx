"use client";

import { useEffect } from "react";

/**
 * Marks the header with data-scrolled once the page leaves the very top, so the
 * nav can float transparently over the hero and turn frosted after that.
 * Watches a 1px sentinel at the top of the page; no scroll listeners.
 */
export function NavScrollState() {
  useEffect(() => {
    const header = document.getElementById("site-header");
    const sentinel = document.getElementById("top-sentinel");
    if (!header || !sentinel) return;
    const io = new IntersectionObserver(([e]) => {
      header.toggleAttribute("data-scrolled", !e.isIntersecting);
    });
    io.observe(sentinel);
    return () => io.disconnect();
  }, []);
  return null;
}
