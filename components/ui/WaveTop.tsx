type WaveTopProps = {
  /** Fill class in the PREVIOUS section's color, e.g. "fill-cream". */
  fill: string;
  /** Mirror the wave so neighbouring edges don't repeat. */
  flip?: boolean;
};

/**
 * A jelly-soft wavy edge at the top of a section, drawn in the color of the
 * section above so the two melt together. Sits inside the section (parent needs
 * `relative`), so it works even where the section clips its overflow.
 */
export function WaveTop({ fill, flip = false }: WaveTopProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 48"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-x-0 top-0 h-6 w-full lg:h-12 ${fill} ${flip ? "-scale-x-100" : ""}`}
    >
      <path d="M0 0h1440v22c-120 18-260 26-420 10S720 0 560 12 240 46 0 26Z" />
    </svg>
  );
}
