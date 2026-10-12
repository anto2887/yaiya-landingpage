// Prepares page images in public/images/.
// Spec: guide/docs/09-assets.md
//
// For each target below:
//   1. If a new original named after the target exists in assets-src/
//      (e.g. assets-src/hero-desktop.jpg), crop it to the target ratio,
//      resize it and write it to public/images/, replacing what is there.
//   2. Otherwise, if public/images/ has no file for the target, write a
//      labelled placeholder (tier C). Placeholders must never ship.
//   3. Otherwise leave the existing file alone.
//
// Usage: npm run images
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = "assets-src";
const OUT = "public/images";

// width x height is the output size. Cutouts keep their transparency (png).
const TARGETS = [
  { file: "hero-desktop.jpg", width: 2400, height: 1800 },
  { file: "hero-mobile.jpg", width: 1358, height: 1086 },
  { file: "flavor-strawberry-peach.jpg", width: 768, height: 1024 },
  { file: "flavor-chocolate-silk.jpg", width: 768, height: 1024 },
  { file: "flavor-matcha-yuzu.jpg", width: 768, height: 1024 },
  { file: "occasion-protein-regular-v3.jpg", width: 960, height: 1200 },
  { file: "occasion-busy-day-v3.jpg", width: 960, height: 1200 },
  { file: "occasion-wellness-snacker-v2.jpg", width: 960, height: 1200 },
  { file: "story-konjac-v2.jpg", width: 1500, height: 1000 },
  { file: "inside-konjac.png", width: 600, height: 600, fit: "inside" },
  { file: "inside-flavors.png", width: 640, height: 480, fit: "inside" },
  { file: "compare-pouch.jpg", width: 1448, height: 1086 },
  { file: "og.jpg", width: 1200, height: 630 },
];

const CREAM = "#FBF4EC";
const MUTED = "#8A7065";

function findOriginal(file) {
  const base = path.parse(file).name;
  for (const ext of [".jpg", ".jpeg", ".png", ".webp"]) {
    const p = path.join(SRC, base + ext);
    if (existsSync(p)) return p;
  }
  return null;
}

async function processOriginal(src, t) {
  const out = path.join(OUT, t.file);
  let img = sharp(src).rotate().resize(t.width, t.height, {
    fit: t.fit ?? "cover",
    position: "attention",
    withoutEnlargement: true,
  });
  img = t.file.endsWith(".png")
    ? img.png({ compressionLevel: 9 })
    : img.jpeg({ quality: 82, mozjpeg: true });
  await img.toFile(out);
  console.log(`processed   ${src} -> ${out}`);
}

async function writePlaceholder(t) {
  const out = path.join(OUT, t.file);
  const fontSize = Math.max(14, Math.round(t.width / 24));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${t.width}" height="${t.height}">
  <rect width="100%" height="100%" fill="${CREAM}"/>
  <text x="50%" y="50%" fill="${MUTED}" font-family="sans-serif" font-size="${fontSize}" text-anchor="middle">
    <tspan x="50%" dy="-0.6em">PLACEHOLDER ${t.file}</tspan>
    <tspan x="50%" dy="1.4em">${t.width} x ${t.height}</tspan>
  </text>
</svg>`;
  let img = sharp(Buffer.from(svg));
  img = t.file.endsWith(".png") ? img.png() : img.jpeg({ quality: 80 });
  await img.toFile(out);
  console.log(`placeholder ${out}`);
}

for (const t of TARGETS) {
  const original = findOriginal(t.file);
  if (original) await processOriginal(original, t);
  else if (!existsSync(path.join(OUT, t.file))) await writePlaceholder(t);
}
console.log("Done.");
