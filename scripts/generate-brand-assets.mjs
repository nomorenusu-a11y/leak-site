import sharp from "sharp";
import { resolve } from "node:path";

const source = process.argv[2];

if (!source) {
  throw new Error("Usage: node scripts/generate-brand-assets.mjs <source-logo.png>");
}

const root = process.cwd();
const publicDir = resolve(root, "public");

const trimmed = await sharp(source)
  .trim({ background: "#ffffff", threshold: 14 })
  .png()
  .toBuffer();

async function circularLogo(size, destination) {
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 1}" fill="#fff"/></svg>`,
  );

  await sharp(trimmed)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .composite([{ input: mask, blend: "dest-in" }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(resolve(publicDir, destination));
}

await circularLogo(512, "logo.png");
await circularLogo(32, "favicon-32.png");
await circularLogo(192, "favicon-192.png");
await circularLogo(180, "apple-touch-icon.png");

const ogLogo = await sharp(trimmed)
  .resize(430, 430, { fit: "contain" })
  .ensureAlpha()
  .composite([
    {
      input: Buffer.from(
        '<svg width="430" height="430"><circle cx="215" cy="215" r="214" fill="#fff"/></svg>',
      ),
      blend: "dest-in",
    },
  ])
  .png()
  .toBuffer();

const ogText = Buffer.from(`
  <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <style>
      .brand { font-family: "Apple SD Gothic Neo", "Noto Sans CJK KR", sans-serif; font-weight: 800; }
      .copy { font-family: "Apple SD Gothic Neo", "Noto Sans CJK KR", sans-serif; font-weight: 600; }
    </style>
    <text x="545" y="245" class="brand" font-size="78" fill="#071d38">노모어누수</text>
    <text x="550" y="318" class="copy" font-size="31" fill="#1279bc">누수탐지 · 배관설비 전문</text>
    <text x="550" y="382" class="copy" font-size="27" fill="#40566e">서울 · 경기 · 인천 전 지역 출장</text>
    <rect x="550" y="420" width="388" height="62" rx="31" fill="#0b7ec1"/>
    <text x="744" y="460" text-anchor="middle" class="copy" font-size="25" fill="#ffffff">365일 빠른 상담 010-5700-4026</text>
  </svg>
`);

await sharp({
  create: {
    width: 1200,
    height: 630,
    channels: 4,
    background: { r: 244, g: 249, b: 253, alpha: 1 },
  },
})
  .composite([
    { input: ogLogo, left: 70, top: 100 },
    { input: ogText, left: 0, top: 0 },
  ])
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(resolve(publicDir, "og-image.png"));

console.log("Generated logo, favicons, Apple touch icon, and Open Graph image.");
