"use client";

import { useEffect, useState } from "react";
import { ButtonIcon, buttonClasses } from "@/components/ui/Button";
import type { site } from "@/content/site";
import { HERO_CTA_ID, scrollToWaitlist } from "@/lib/scroll";

type StickyCtaProps = {
  content: typeof site.stickyCta;
};

export function StickyCta({ content }: StickyCtaProps) {
  const [heroVisible, setHeroVisible] = useState(true);
  const [waitlistVisible, setWaitlistVisible] = useState(false);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const hero = document.getElementById(HERO_CTA_ID);
    const waitlist = document.getElementById("waitlist");
    const observers: IntersectionObserver[] = [];
    if (hero) {
      const o = new IntersectionObserver(([e]) => setHeroVisible(e.isIntersecting));
      o.observe(hero);
      observers.push(o);
    } else {
      setHeroVisible(false);
    }
    if (waitlist) {
      const o = new IntersectionObserver(([e]) => setWaitlistVisible(e.isIntersecting));
      o.observe(waitlist);
      observers.push(o);
    }
    // Treat a focused text field as "keyboard open".
    const isField = (t: EventTarget | null) => t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement;
    const onIn = (e: FocusEvent) => setTyping(isField(e.target));
    const onOut = () => setTyping(false);
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    return () => {
      observers.forEach((o) => o.disconnect());
      document.removeEventListener("focusin", onIn);
      document.removeEventListener("focusout", onOut);
    };
  }, []);

  const shown = !heroVisible && !waitlistVisible && !typing;

  return (
    <div
      role="region"
      aria-label={content.regionLabel}
      inert={!shown}
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/96 px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] backdrop-blur-[12px] motion-safe:transition-transform motion-safe:duration-200 sm:hidden ${
        shown ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[14px] font-semibold text-ink max-[359px]:hidden">{content.line}</p>
        <button
          type="button"
          onClick={() => {
            scrollToWaitlist();
            // TODO(M5): track("cta_clicked", { location: "sticky" })
          }}
          className={buttonClasses({ size: "compact", className: "max-[359px]:w-full" })}
        >
          {content.button}
          <ButtonIcon />
        </button>
      </div>
    </div>
  );
}
