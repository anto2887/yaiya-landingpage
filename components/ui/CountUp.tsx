"use client";

import { useEffect, useRef, useState } from "react";

type CountUpProps = {
  /** e.g. "15g", "25%", "0g". The leading number counts up; the rest stays. */
  value: string;
  durationMs?: number;
};

/**
 * Counts a stat up from 0 the first time it scrolls into view.
 * Renders the final value first, so no-JS, screen readers and reduced motion all
 * get the real number; the animation only replays it.
 */
export function CountUp({ value, durationMs = 1100 }: CountUpProps) {
  const match = value.match(/^(\d+(?:\.\d+)?)(.*)$/);
  const target = match ? Number(match[1]) : 0;
  const suffix = match ? match[2] : "";
  const [shown, setShown] = useState(target);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !match || target === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / durationMs);
          const eased = 1 - Math.pow(1 - t, 3);
          setShown(Math.round(target * eased));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        setShown(0);
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // match is derived from value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, target, durationMs]);

  if (!match) return <>{value}</>;
  return (
    <span ref={ref}>
      <span className="sr-only">{value}</span>
      <span aria-hidden className="tabular-nums">
        {shown}
        {suffix}
      </span>
    </span>
  );
}
