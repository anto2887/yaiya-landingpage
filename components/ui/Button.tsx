import Link from "next/link";
import { ArrowRight, LoaderCircle } from "lucide-react";

type Variant = "primary" | "outline";
type Size = "default" | "compact";

const base =
  "group/btn relative inline-flex shrink-0 items-center justify-center gap-2 rounded-pill type-button whitespace-nowrap transition-[background-color,transform,box-shadow] duration-200 ease-out motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-berry text-white hover:bg-berry-hover hover:shadow-[0_10px_24px_-10px_var(--color-berry)]",
  outline: "border-2 border-outline bg-transparent text-ink hover:border-berry hover:bg-paper",
};

// The compact button is 40px tall; the ::before extends its tap area to 44px.
const sizes: Record<Size, string> = {
  default: "h-12 px-[22px]",
  compact: "h-10 px-[14px] text-[13px] before:absolute before:-inset-y-0.5 before:inset-x-0 before:content-['']",
};

export function buttonClasses({
  variant = "primary",
  size = "default",
  className = "",
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`;
}

type CommonProps = {
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  className?: string;
  children: React.ReactNode;
};

/** The trailing arrow, or a spinner in the same box so the width holds. */
export function ButtonIcon({ loading = false }: { loading?: boolean }) {
  return loading ? (
    <LoaderCircle aria-hidden className="size-4 animate-spin motion-reduce:animate-none" />
  ) : (
    <ArrowRight aria-hidden className="size-4 transition-transform duration-200 motion-safe:group-hover/btn:translate-x-1" />
  );
}

type ButtonProps = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    loading?: boolean;
  };

export function Button({
  variant,
  size,
  arrow = true,
  loading = false,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      data-wobbie-cursor
      type={type}
      className={buttonClasses({ variant, size, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {children}
      {(arrow || loading) && <ButtonIcon loading={loading} />}
    </button>
  );
}

type ButtonLinkProps = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
  };

export function ButtonLink({ variant, size, arrow = true, className, children, href, ...rest }: ButtonLinkProps) {
  return (
    // data-wobbie-cursor: the Wobbie cursor stays over call-to-action buttons (WobbieCursor.tsx).
    <Link href={href} data-wobbie-cursor className={buttonClasses({ variant, size, className })} {...rest}>
      {children}
      {arrow && <ButtonIcon />}
    </Link>
  );
}
