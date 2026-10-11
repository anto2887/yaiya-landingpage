type HandNoteProps = {
  children: React.ReactNode;
  /** Degrees, between -6 and 6. */
  rotate?: number;
  mark?: "arrow" | "heart";
  /** Hidden on mobile unless the section spec says otherwise. */
  showOnMobile?: boolean;
  /** Set when the note repeats nearby copy. */
  decorative?: boolean;
  className?: string;
};

export function HandNote({
  children,
  rotate = -4,
  mark,
  showOnMobile = false,
  decorative = true,
  className = "",
}: HandNoteProps) {
  return (
    // A small tilted sticker in Fraunces italic.
    <p
      aria-hidden={decorative || undefined}
      style={{ transform: `rotate(${rotate}deg)` }}
      className={`${showOnMobile ? "" : "hidden lg:block"} ${className}`}
    >
      <span className="inline-flex items-center gap-1.5 rounded-pill bg-white px-3.5 py-1.5 type-hand text-ink shadow-[0_8px_20px_-10px_rgb(58_20_64/0.4)]">
        {children}
        {mark === "heart" && (
          <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-berry" fill="currentColor" aria-hidden>
            <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
          </svg>
        )}
        {mark === "arrow" && (
          <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-berry" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 4v16M6 14l6 6 6-6" />
          </svg>
        )}
      </span>
    </p>
  );
}
