// Builds the photo frames for the animated hero (components/HeroAnimation.tsx).
//
// Desktop frames are wide (1672 x 941) with the copy floating on their left side.
// Phones show the film first, as its own square block, so each frame gets a square crop
// around the pouches. The flavor and jelly moments are built in the page, not here.
//
// In:  assets-src/scene-desk-hero-v4.png (1672 x 941, founder, 12 Oct, new pack)
//      assets-src/occasion-busy-day-desk-v2.png (1122 x 1402, founder, 12 Oct)
//      assets-src/occasion-wellness-snacker-bag-v3.png (1122 x 1402, founder, 12 Oct)
// Out: public/images/hero-{lineup,desk}-wide.jpg, hero-{lineup,desk,bag}-square.jpg
// Usage: node scripts/extend-hero.mjs   (also run by npm run images)
import path from "node:path";
import sharp from "sharp";

const DIR = "public/images";
const WIDE = { width: 1672, height: 941 };
const SQUARE = { width: 1000, height: 1000 };

const FRAMES = [
  // The lineup is used as supplied; its left side is open wall and marble.
  { out: "hero-lineup-wide.jpg", src: "assets-src/scene-desk-hero-v4.png", size: WIDE },
  { out: "hero-lineup-square.jpg", src: "assets-src/scene-desk-hero-v4.png", crop: { left: 790, top: 50, width: 882, height: 882 }, size: SQUARE },
  // Desk: a wide band through the mug, laptop and pouch. The pouch lands just right of center.
  { out: "hero-desk-wide.jpg", src: "assets-src/occasion-busy-day-desk-v2.png", crop: { left: 0, top: 300, width: 1122, height: 631 }, size: WIDE },
  { out: "hero-desk-square.jpg", src: "assets-src/occasion-busy-day-desk-v2.png", crop: { left: 0, top: 160, width: 1122, height: 1122 }, size: SQUARE },
  // Bag: phones only. On desktop the copy would cover a pouch label.
  { out: "hero-bag-square.jpg", src: "assets-src/occasion-wellness-snacker-bag-v3.png", crop: { left: 0, top: 170, width: 1122, height: 1122 }, size: SQUARE },
];

const outDir = process.argv[2] ?? DIR;

for (const f of FRAMES) {
  let img = sharp(f.src);
  if (f.crop) img = img.extract(f.crop);
  await img.resize(f.size.width, f.size.height).jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(outDir, f.out));
  console.log(`wrote       ${path.join(outDir, f.out)}`);
}
