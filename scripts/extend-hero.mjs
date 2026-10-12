// Builds the hero images from the founder's scene.
//
// Desktop uses the scene as it is: the pouches sit in the right half and the copy
// floats on the open wall on the left. Phones show the photo first, as its own block,
// so they get a tight crop around the pouches and Wobbie (founder, 11 Oct).
//
// In:  assets-src/scene-desk-hero-wide.png (1672 x 941, founder, 11 Oct)
// Out: public/images/hero-scene.jpg (1672 x 941), hero-phone.jpg (1000 x 741)
// Usage: node scripts/extend-hero.mjs   (also run by npm run images)
import path from "node:path";
import sharp from "sharp";

const DIR = "public/images";
const SCENE = "assets-src/scene-desk-hero-wide.png";
// Phone crop: the three pouches, the fruit and Wobbie in the tote.
const PHONE_CROP = { left: 640, top: 200, width: 1000, height: 741 };

const outDir = process.argv[2] ?? DIR;

await sharp(SCENE).jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(outDir, "hero-scene.jpg"));
console.log(`wrote       ${path.join(outDir, "hero-scene.jpg")}`);

await sharp(SCENE).extract(PHONE_CROP).jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(outDir, "hero-phone.jpg"));
console.log(`wrote       ${path.join(outDir, "hero-phone.jpg")}`);
