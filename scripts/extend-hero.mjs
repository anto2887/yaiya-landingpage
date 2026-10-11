// Builds the hero images from the founder's scene.
//
// Desktop uses the scene as it is: the pouches sit in the right half and the copy
// floats on the open wall on the left. Phones need a tall image, so a crop around the
// pouches is extended upward with more of the same sunlit wall, where the copy sits.
//
// In:  assets-src/scene-desk-hero-wide.png (1672 x 941, founder, 11 Oct)
// Out: public/images/hero-scene.jpg (1672 x 941), hero-tall.jpg (960 x 1960)
// Usage: node scripts/extend-hero.mjs   (also run by npm run images)
import path from "node:path";
import sharp from "sharp";

const DIR = "public/images";
const SCENE = "assets-src/scene-desk-hero-wide.png";
// Sampled from the scene's wall, top to bottom.
const WALL_TOP = "#f3e6da";
const WALL = "#ecd9cc";
// Phone crop: the pouches and the wall above them.
const PHONE_CROP = { left: 640, top: 0, width: 960, height: 941 };
const PHONE_HEIGHT = 1960;
const FEATHER = 360;

/** Plain sunlit wall with soft diagonal light, for the space above the phone crop. */
function wall(width, height) {
  const beams = [0.05, 0.35, 0.65]
    .map(
      (x, i) =>
        `<polygon points="${width * x},0 ${width * (x + 0.14)},0 ${width * (x + 0.44)},${height} ${width * (x + 0.3)},${height}" fill="#fff" opacity="${[0.22, 0.16, 0.12][i]}"/>`,
    )
    .join("");
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${WALL_TOP}"/>
          <stop offset="1" stop-color="${WALL}"/>
        </linearGradient>
        <filter id="soft"><feGaussianBlur stdDeviation="${Math.round(width / 30)}"/></filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <g filter="url(#soft)">${beams}</g>
    </svg>`,
  );
}

/** Alpha mask that eases the crop's top edge in over FEATHER px. */
function topFeather(width, height) {
  const stops = [0, 0.2, 0.45, 0.7, 1]
    .map((t) => {
      const eased = t * t * (3 - 2 * t);
      return `<stop offset="${((t * FEATHER) / height).toFixed(4)}" stop-color="#fff" stop-opacity="${eased.toFixed(3)}"/>`;
    })
    .join("");
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">${stops}</linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`,
  );
}

const outDir = process.argv[2] ?? DIR;

// Desktop: the scene as supplied.
await sharp(SCENE).jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(outDir, "hero-scene.jpg"));
console.log(`wrote       ${path.join(outDir, "hero-scene.jpg")}`);

// Phone: crop, feather the top edge, and stand it on more wall.
const { width: w, height: h } = PHONE_CROP;
const crop = await sharp(SCENE)
  .extract(PHONE_CROP)
  .ensureAlpha()
  .composite([{ input: topFeather(w, h), blend: "dest-in" }])
  .png()
  .toBuffer();
await sharp(await sharp(wall(w, PHONE_HEIGHT)).png().toBuffer())
  .composite([{ input: crop, left: 0, top: PHONE_HEIGHT - h }])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(path.join(outDir, "hero-tall.jpg"));
console.log(`extended    ${path.join(outDir, "hero-tall.jpg")} (${w} x ${PHONE_HEIGHT})`);
