// Pouch cutouts as ready-made WebP files (served as-is, with next/image's `unoptimized`).
//
// The live image optimizer on Railway has hung on single image/size pairs (an AVIF size on 16 Oct,
// a Mango Goji size on 4 Nov); once one hangs, every visitor asking for that size waits on it.
// The cutouts are small and shown at 300px at most, so one 600px file (sharp on 2x screens) each
// avoids the optimizer entirely.
//
// In:  public/images/pouch-<flavor>-<v>.png (transparent cutouts, 800px tall)
// Out: public/images/pouch-<flavor>-<v>.webp (600px wide, transparency kept)
// Usage: node scripts/prepare-pouches.mjs   (also run by npm run images)
import path from "node:path";
import sharp from "sharp";

const DIR = "public/images";
const POUCHES = ["pouch-strawberry-peach-v5", "pouch-chocolate-silk-v5", "pouch-mango-goji-v1"];

for (const name of POUCHES) {
  const out = path.join(DIR, `${name}.webp`);
  const info = await sharp(path.join(DIR, `${name}.png`)).resize({ width: 600 }).webp({ quality: 80, alphaQuality: 90, effort: 6 }).toFile(out);
  console.log(`wrote       ${out} (${info.width}x${info.height}, ${Math.round(info.size / 1024)} KB)`);
}
