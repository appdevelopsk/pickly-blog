/**
 * Generate the site-wide default OG image (1200x630 PNG).
 *
 * Non-article pages (home, /articles, /category/*, /tag/* ...) had no og:image
 * at all — social/Pinterest shares of those URLs rendered a blank card.
 * Article pages keep their own 1000x1500 pin (scripts/generate-og.ts, served
 * from R2); this is the single brand fallback and IS committed under public/
 * (one file — no impact on the Cloudflare Pages 20,000-file limit).
 *
 * Run: npx tsx scripts/generate-brand-og.ts
 * Output: public/images/og-default.png
 */
import fs from "node:fs/promises";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "public/images/og-default.png");

const W = 1200;
const H = 630;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7f1d1d"/>
      <stop offset="55%" stop-color="#450a0a"/>
      <stop offset="100%" stop-color="#1c0505"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect x="0" y="0" width="${W}" height="10" fill="#dc2626"/>
  <text x="80" y="250" font-family="Helvetica, Arial, 'Noto Sans', sans-serif" font-size="112" font-weight="700" fill="#ffffff">Pickly</text>
  <rect x="82" y="292" width="120" height="8" rx="4" fill="#dc2626"/>
  <text x="80" y="392" font-family="Helvetica, Arial, 'Noto Sans', sans-serif" font-size="46" fill="#fecaca">Real reviews, no filler.</text>
  <text x="80" y="462" font-family="Helvetica, Arial, 'Noto Sans', sans-serif" font-size="32" fill="#f5c9c9">Curated reviews and comparisons in 17 languages</text>
  <text x="80" y="558" font-family="Helvetica, Arial, 'Noto Sans', sans-serif" font-size="30" font-weight="700" fill="#ffffff">pickly.blog</text>
</svg>`;

async function main() {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: W },
    font: { loadSystemFonts: true, defaultFontFamily: "Helvetica" },
  });
  const png = resvg.render().asPng();
  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, png);
  console.log(`✓ ${OUT} (${png.length} bytes, ${W}x${H})`);
}

main();
