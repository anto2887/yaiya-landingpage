import { Backpack, Box, Cherry, CupSoda, Droplet, Dumbbell, Leaf, Sprout, Sun, type LucideProps } from "lucide-react";

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** A soft jelly cube. */
export function JellyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...stroke} {...props}>
      <path d="M5 9.5c0-2 1.3-3.6 3.3-4l5.2-1c2.2-.4 4.3 1.1 4.7 3.3l.9 5.4c.4 2.4-1.2 4.6-3.6 5l-5.6.9c-2.4.4-4.6-1.3-4.9-3.7L5 9.5Z" />
      <path d="M8.5 8.5c.6-.6 1.6-.9 2.6-1" />
    </svg>
  );
}

/** A spouted pouch. */
export function PouchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...stroke} {...props}>
      <path d="M10 2.5h4v3h-4z" />
      <path d="M8 5.5h8c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2v-12c0-1.1.9-2 2-2Z" />
      <path d="M6 12c2 1.2 4 1.2 6 0s4-1.2 6 0" />
    </svg>
  );
}

/** A squeeze mark: a soft S-curve. */
export function SqueezeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...stroke} {...props}>
      <path d="M6 19c-2-2-1-5 1.5-6s4-1.5 4.5-4-1-5 3-5.5 4 3 2.5 5" />
      <circle cx="18.5" cy="9.5" r="1.2" />
    </svg>
  );
}

type IconComponent = (props: LucideProps & React.SVGProps<SVGSVGElement>) => React.ReactNode;

/** Benefit icons, keyed by `site.benefits[].id`. Never a leaf for protein (C-01). */
export const BENEFIT_ICONS: Record<string, IconComponent> = {
  konjac: JellyIcon,
  protein: Dumbbell,
  flavors: Cherry,
  pocket: PouchIcon,
};

/** Nutrition stat icons, keyed by `site.nutrition.stats[].id`. */
export const STAT_ICONS: Record<string, IconComponent> = {
  protein: Dumbbell,
  fiber: Leaf,
  sugar: Box,
  "daily-value": Sun,
};

/** Convenience icons, keyed by `site.occasions.conveniences[].id`. */
export const CONVENIENCE_ICONS: Record<string, IconComponent> = {
  "no-fridge": Backpack,
  pocket: CupSoda,
  "no-spoon": SqueezeIcon,
};

/** What's inside icons, keyed by `site.inside.items[].icon`. No leaf or plant for protein or collagen (C-01). */
export const INSIDE_ICONS: Record<string, IconComponent> = {
  konjac: JellyIcon,
  flavors: Cherry,
  protein: Dumbbell,
  collagen: Droplet,
  fiber: Sprout,
  vitamins: Sun,
};
