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
    <p
      aria-hidden={decorative || undefined}
      style={{ transform: `rotate(${rotate}deg)` }}
      className={`type-hand text-ink ${showOnMobile ? "" : "hidden lg:block"} ${className}`}
    >
      {children}
      {mark === "heart" && (
        <svg viewBox="0 0 24 24" className="ml-1 inline-block size-5 align-middle" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
        </svg>
      )}
      {mark === "arrow" && (
        <svg viewBox="0 0 40 40" className="mt-1 block size-8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 4c10 6 16 16 14 30M22 34l-6-5M22 34l5-6" />
        </svg>
      )}
    </p>
  );
}
