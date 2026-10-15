"use client";

import { useEffect, useRef, useState } from "react";

type WobbieCursorProps = {
  // Passed from the server so site.ts stays out of the client bundle.
  lines: readonly string[];
};

/** Over these the normal cursor comes back, so links, buttons and fields keep their usual cues. */
const INTERACTIVE = "a, button, input, textarea, select, label, summary, [role='button'], [role='radio'], [role='tab'], [role='checkbox']";
/**
 * Interactive elements that keep Wobbie anyway: flavor cards, the Wobbies on the page, call-to-action
 * buttons and the email box. A click there squishes him, no bubble.
 */
const KEEPS_WOBBIE = "[data-wobbie-cursor]";

function zone(target: EventTarget | null): "page" | "keeps" | "native" {
  if (!(target instanceof Element)) return "page";
  if (target.closest(KEEPS_WOBBIE)) return "keeps";
  return target.closest(INTERACTIVE) ? "native" : "page";
}

/**
 * Wobbie follows the mouse in place of the arrow (trial). A click on empty page squishes him and
 * pops a short line. Mouse and trackpad only: off on touch screens and with reduced motion.
 * Decorative and aria-hidden; it never intercepts clicks.
 */
export function WobbieCursor({ lines }: WobbieCursorProps) {
  const [enabled, setEnabled] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [squish, setSquish] = useState(0);
  const [bubble, setBubble] = useState<{ n: number; text: string } | null>(null);
  const lineIndex = useRef(0);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(fine.matches && !reduce.matches);
    update();
    fine.addEventListener("change", update);
    reduce.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      reduce.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const html = document.documentElement;
    html.classList.add("wobbie-cursor");

    let frame = 0;
    let x = -100;
    let y = -100;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      setVisible(zone(e.target) !== "native");
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          if (root.current) root.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        });
      }
    };
    const leave = () => setVisible(false);
    const down = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      const where = zone(e.target);
      if (where === "native") return;
      setSquish((n) => n + 1);
      if (where === "keeps") return;
      const text = lines[lineIndex.current % lines.length];
      lineIndex.current += 1;
      setBubble((b) => ({ n: (b?.n ?? 0) + 1, text }));
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      html.classList.remove("wobbie-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      document.documentElement.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(frame);
    };
  }, [enabled, lines]);

  if (!enabled) return null;

  return (
    <div
      ref={root}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[100]"
      style={{ transform: "translate3d(-100px, -100px, 0)" }}
    >
      {/* Centered on the pointer. */}
      <div className={`-translate-x-1/2 -translate-y-1/2 transition-opacity duration-150 ${visible ? "opacity-100" : "opacity-0"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- a 1 KB SVG; next/image adds nothing here */}
        <img
          key={`body-${squish}`}
          src="/images/wobbie/cursor.svg"
          alt=""
          width={36}
          height={36}
          className={`block size-9 origin-bottom drop-shadow-[0_3px_4px_rgb(58_20_64/0.25)] ${squish ? "animate-[wobbie-squish_520ms_ease-out]" : ""}`}
        />
        {bubble && (
          <span
            key={`bubble-${bubble.n}`}
            className="absolute bottom-full left-1/2 mb-1 animate-[wobbie-owie_1100ms_ease-out_forwards] rounded-pill bg-paper px-2.5 py-1 font-hand text-[18px] leading-none font-semibold whitespace-nowrap text-ink shadow-[0_4px_12px_rgb(38_34_32/0.18)]"
          >
            {bubble.text}
          </span>
        )}
      </div>
    </div>
  );
}
