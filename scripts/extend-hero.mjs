// Builds the hero images from the founder's scene.
//
// Desktop uses the scene as it is: the pouches sit in the right half and the copy
// floats on the open wall and desk on the left. Phones show the photo first, as its own block,
// so they get a tight crop around the pouches and Wobbie (founder, 11 Oct).
//
// In:  assets-src/scene-desk-hero-v5.png (1672 x 941, founder, 13 Oct, latest lineup)
// Out: public/images/hero-scene-v6.jpg (1672 x 941), hero-phone-v6.jpg (912 x 676)
// Nothing is upscaled, and the JPEGs are near-lossless (q95, full color resolution) so the
// image server's own compression is the only visible step.
// Usage: node scripts/extend-hero.mjs   (also run by npm run images)
import path from "node:path";
import sharp from "sharp";

const DIR = "public/images";
const SCENE = "assets-src/scene-desk-hero-v5.png";
// Phone crop: the three pouches, the fruit and Wobbie.
const PHONE_CROP = { left: 760, top: 120, width: 912, height: 676 };

const JPEG = { quality: 95, chromaSubsampling: "4:4:4", mozjpeg: true };

const outDir = process.argv[2] ?? DIR;

await sharp(SCENE).jpeg(JPEG).toFile(path.join(outDir, "hero-scene-v6.jpg"));
console.log(`wrote       ${path.join(outDir, "hero-scene-v6.jpg")}`);

await sharp(SCENE).extract(PHONE_CROP).jpeg(JPEG).toFile(path.join(outDir, "hero-phone-v6.jpg"));
console.log(`wrote       ${path.join(outDir, "hero-phone-v6.jpg")}`);
