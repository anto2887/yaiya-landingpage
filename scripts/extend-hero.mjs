// Builds the hero images from the founder's scene.
//
// Desktop uses the scene as it is: the pouches sit in the right half and the copy
// floats on the open wall and desk on the left. Phones show the photo first, as its own block,
// so they get a tight crop around the pouches and Wobbie (founder, 11 Oct).
//
// In:  assets-src/scene-desk-hero-v3.png (1672 x 941, founder, 12 Oct)
// Out: public/images/hero-scene-v3.jpg (1672 x 941), hero-phone-v3.jpg (1000 x 741)
// Usage: node scripts/extend-hero.mjs   (also run by npm run images)
import path from "node:path";
import sharp from "sharp";

const DIR = "public/images";
const SCENE = "assets-src/scene-desk-hero-v3.png";
// Phone crop: the three pouches, the fruit and Wobbie.
const PHONE_CROP = { left: 760, top: 120, width: 912, height: 676 };

const outDir = process.argv[2] ?? DIR;

await sharp(SCENE).jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(outDir, "hero-scene-v3.jpg"));
console.log(`wrote       ${path.join(outDir, "hero-scene-v3.jpg")}`);

await sharp(SCENE).extract(PHONE_CROP).resize(1000, 741).jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(outDir, "hero-phone-v3.jpg"));
console.log(`wrote       ${path.join(outDir, "hero-phone-v3.jpg")}`);
