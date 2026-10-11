// Builds the full-bleed hero backgrounds from the supplied scene.
//
// The scene has its pouches in the middle, so copy laid over the full photo would
// cover them. This widens the canvas (desktop: to the left; mobile: upward) with a
// mirrored, heavily blurred copy of the photo's own edge, feathered into the original.
// The copy then sits over soft background and the pouches stay sharp.
//
// In:  public/images/hero-desktop.jpg (1448 x 1086), hero-mobile.jpg (1358 x 1086)
// Out: public/images/hero-wide.jpg (2400 x 1086), hero-tall.jpg (1358 x 2300)
// Usage: node scripts/extend-hero.mjs   (also run by npm run images)
import path from "node:path";
import sharp from "sharp";

const DIR = "public/images";
const FEATHER = 220;
const BASE = "#f3e6dc"; // fallback under the blur; matches the scene's wall

function featherMask(width, height, vertical) {
  const stop = FEATHER / (vertical ? height : width);
  const dir = vertical ? 'x1="0" y1="0" x2="0" y2="1"' : "";
  return Buffer.from(
    `<svg width="${width}" height="${height}"><defs><linearGradient id="g" ${dir}>` +
      `<stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="${stop}" stop-color="#fff" stop-opacity="1"/>` +
      `</linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`,
  );
}

async function feathered(src, width, height, vertical) {
  return sharp(src)
    .ensureAlpha()
    .composite([{ input: featherMask(width, height, vertical), blend: "dest-in" }])
    .png()
    .toBuffer();
}

async function extendLeft(src, out, W) {
  const { width: w, height: h } = await sharp(src).metadata();
  const ext = W - w;
  const strip = Math.min(w, ext + FEATHER);
  // Mirror the photo, so its left edge continues seamlessly outward, then blur it.
  const fill = await sharp(src)
    .flop()
    .extract({ left: w - strip, top: 0, width: strip, height: h })
    .resize(ext + FEATHER, h, { fit: "fill" })
    .blur(32)
    .modulate({ brightness: 1.05, saturation: 0.85 })
    .toBuffer();
  await sharp({ create: { width: W, height: h, channels: 3, background: BASE } })
    .composite([
      { input: fill, left: 0, top: 0 },
      { input: await feathered(src, w, h, false), left: ext, top: 0 },
    ])
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(out);
  console.log(`extended    ${out} (${W} x ${h})`);
}

async function extendUp(src, out, H) {
  const { width: w, height: h } = await sharp(src).metadata();
  const ext = H - h;
  // Only the top band (wall and plant), so no ghost pouches appear in the blur.
  const band = Math.round(h * 0.28);
  const fill = await sharp(src)
    .extract({ left: 0, top: 0, width: w, height: band })
    .flip()
    .resize(w, ext + FEATHER, { fit: "fill" })
    .blur(34)
    .modulate({ brightness: 1.05, saturation: 0.85 })
    .toBuffer();
  await sharp({ create: { width: w, height: H, channels: 3, background: BASE } })
    .composite([
      { input: fill, left: 0, top: 0 },
      { input: await feathered(src, w, h, true), left: 0, top: ext },
    ])
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(out);
  console.log(`extended    ${out} (${w} x ${H})`);
}

const outDir = process.argv[2] ?? DIR;
await extendLeft(path.join(DIR, "hero-desktop.jpg"), path.join(outDir, "hero-wide.jpg"), 2400);
await extendUp(path.join(DIR, "hero-mobile.jpg"), path.join(outDir, "hero-tall.jpg"), 2300);
