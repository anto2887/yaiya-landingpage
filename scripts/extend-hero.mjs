// Builds the full-bleed hero backgrounds from the supplied scene.
//
// The scene has its pouches in the middle, so copy laid over the full photo would
// cover them. This widens the canvas (desktop: to the left; mobile: upward) with a
// calm "studio" continuation of the scene: its own wall and desk colors, a soft desk
// edge and diagonal sunbeams. The photo fades into it over a wide band, so the copy
// sits on clean background and the pouches stay sharp.
//
// This is a stand-in. A render composed with empty space on the left (like the
// founder's reference mockups) will look better; drop it in as hero-wide.jpg.
//
// In:  assets-src/scene-desk-hero.png (1672 x 941, founder, 11 Oct)
// Out: public/images/hero-wide.jpg (2400 x 941), hero-tall.jpg (1176 x 1992)
// Usage: node scripts/extend-hero.mjs   (also run by npm run images)
import path from "node:path";
import sharp from "sharp";

const DIR = "public/images";
const SCENE = "assets-src/scene-desk-hero.png";
// Sampled from the scene: sunlit wall and light desk wood.
const WALL_TOP = "#f7ece4";
const WALL = "#ecdad0";
const DESK = "#e8c6a6";
const DESK_DEEP = "#dcb18c";
// Phone crop: 5:4 around the pouches and Wobbie (their center is about x = 770).
const PHONE_CROP = { left: 182, top: 0, width: 1176, height: 941 };

/** Studio background: wall, desk from `deskAt` (0..1 of height), soft sunbeams. */
function studio(width, height, deskAt) {
  const d = (deskAt * 100).toFixed(1);
  const beams = [0.1, 0.32, 0.55]
    .map(
      (x, i) =>
        `<polygon points="${width * x},0 ${width * (x + 0.12)},0 ${width * (x + 0.42)},${height} ${width * (x + 0.3)},${height}" fill="#fff" opacity="${[0.22, 0.16, 0.12][i]}"/>`,
    )
    .join("");
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${WALL_TOP}"/>
          <stop offset="${d - 6}%" stop-color="${WALL}"/>
          <stop offset="${d}%" stop-color="${DESK}"/>
          <stop offset="100%" stop-color="${DESK_DEEP}"/>
        </linearGradient>
        <filter id="soft"><feGaussianBlur stdDeviation="${Math.round(width / 40)}"/></filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <g filter="url(#soft)">${beams}</g>
    </svg>`,
  );
}

/** Alpha mask: transparent at the start edge, opaque after `feather` px, eased. */
function featherMask(width, height, feather, vertical) {
  const stops = [0, 0.15, 0.35, 0.6, 0.85, 1]
    .map((t) => {
      const eased = t * t * (3 - 2 * t); // smoothstep
      return `<stop offset="${((t * feather) / (vertical ? height : width)).toFixed(4)}" stop-color="#fff" stop-opacity="${eased.toFixed(3)}"/>`;
    })
    .join("");
  const dir = vertical ? 'x1="0" y1="0" x2="0" y2="1"' : "";
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><defs><linearGradient id="g" ${dir}>${stops}</linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`,
  );
}

async function feathered(src, width, height, feather, vertical) {
  return sharp(src)
    .ensureAlpha()
    .composite([{ input: featherMask(width, height, feather, vertical), blend: "dest-in" }])
    .png()
    .toBuffer();
}

async function extendLeft(src, out, W) {
  const { width: w, height: h } = await sharp(src).metadata();
  const ext = W - w;
  // The scene's desk edge sits at about 53% of its height on the left.
  const bg = await sharp(studio(W, h, 0.53)).png().toBuffer();
  await sharp(bg)
    .composite([{ input: await feathered(src, w, h, 420, false), left: ext, top: 0 }])
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(out);
  console.log(`extended    ${out} (${W} x ${h})`);
}

async function extendUp(src, out, H) {
  const { width: w, height: h } = await sharp(src).metadata();
  const ext = H - h;
  // Above the photo there is only wall, so the desk starts below the canvas.
  const bg = await sharp(studio(w, H, 1.2)).png().toBuffer();
  await sharp(bg)
    .composite([{ input: await feathered(src, w, h, 360, true), left: 0, top: ext }])
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(out);
  console.log(`extended    ${out} (${w} x ${H})`);
}

const outDir = process.argv[2] ?? DIR;
const scene = await sharp(SCENE).toBuffer();
const phone = await sharp(SCENE).extract(PHONE_CROP).toBuffer();
await extendLeft(scene, path.join(outDir, "hero-wide.jpg"), 2400);
await extendUp(phone, path.join(outDir, "hero-tall.jpg"), 1992);
