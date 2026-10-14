// Builds the photo frames for the animated hero (components/HeroAnimation.tsx).
//
// Desktop frames are the founder's photos at their native size, with the copy floating on their
// calm left side. Phones show the film first, as its own square block, so each frame also gets a
// square crop around the pouch. Nothing is upscaled, and the JPEGs are near-lossless (q95, full
// color resolution) so the image server's own compression is the only visible step.
//
// In:  assets-src/hero/hero-0N-<id>.png (1672 x 941, founder, 13 Oct; desk, flavors and tote
//      updated to the latest pack 13 Oct; 08 is the 13 Oct lineup)
// Out: public/images/hero-<id>-<VERSION>.jpg (1672 x 941) and hero-<id>-<VERSION>-square.jpg
// Bump VERSION (and FRAME_VERSION in HeroAnimation.tsx) whenever photos change, so caches refresh.
// Usage: node scripts/extend-hero.mjs   (also run by npm run images)
import path from "node:path";
import sharp from "sharp";

const DIR = "public/images";
const SRC = "assets-src/hero";
const VERSION = "v4";
const JPEG = { quality: 95, chromaSubsampling: "4:4:4", mozjpeg: true };

// `square` is the phone crop: its left edge and size, in source pixels.
const FRAMES = [
  { id: "desk", file: "hero-01-desk.png", square: { left: 700, top: 0, size: 941 } },
  { id: "reach", file: "hero-02-reach.png", square: { left: 731, top: 0, size: 941 } },
  { id: "jelly", file: "hero-03-jelly.png", square: { left: 700, top: 0, size: 941 } },
  { id: "strawberry-peach", file: "hero-04-strawberry-peach.png", square: { left: 731, top: 0, size: 941 } },
  { id: "chocolate-silk", file: "hero-05-chocolate-silk.png", square: { left: 700, top: 0, size: 941 } },
  { id: "matcha-yuzu", file: "hero-06-matcha-yuzu.png", square: { left: 731, top: 0, size: 941 } },
  { id: "to-go", file: "hero-07-to-go.png", square: { left: 731, top: 0, size: 941 } },
  // The lineup is tighter so the pouches and Wobbie fill the square.
  { id: "lineup", file: "hero-08-lineup.png", square: { left: 790, top: 50, size: 882 } },
];

const outDir = process.argv[2] ?? DIR;

for (const f of FRAMES) {
  const src = path.join(SRC, f.file);
  await sharp(src).jpeg(JPEG).toFile(path.join(outDir, `hero-${f.id}-${VERSION}.jpg`));
  const { left, top, size } = f.square;
  await sharp(src).extract({ left, top, width: size, height: size }).jpeg(JPEG).toFile(path.join(outDir, `hero-${f.id}-${VERSION}-square.jpg`));
  console.log(`wrote       hero-${f.id}-${VERSION}.jpg and its square crop`);
}
