type IconBadgeProps = {
  /** A 22px stroke icon, e.g. from lucide-react. */
  children: React.ReactNode;
  tone?: "accent" | "ink";
  className?: string;
};

export function IconBadge({ children, tone = "accent", className = "" }: IconBadgeProps) {
  return (
    <span
      aria-hidden
      className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-line bg-paper [&>svg]:size-[22px] ${tone === "accent" ? "text-accent" : "text-ink"} ${className}`}
    >
      {children}
    </span>
  );
}
