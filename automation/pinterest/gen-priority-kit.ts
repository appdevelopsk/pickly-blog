/**
 * Generate a focused, copy-paste Pinterest posting kit (Markdown) for the
 * highest-value articles, using the live OG image domain (img.pickly.blog).
 *
 * Manual posting needs NO Standard API access — paste each block into the
 * Pinterest pin-builder. Run:
 *   NEXT_PUBLIC_OG_BASE_URL=https://img.pickly.blog \
 *   npx tsx pinterest/gen-priority-kit.ts > ../../PINTEREST_PRIORITY_POSTS.md
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import * as yaml from "js-yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OG_BASE = process.env.NEXT_PUBLIC_OG_BASE_URL || "https://img.pickly.blog";
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://pickly.blog";

// GSC-proven / high-commercial priority order. Post these first.
const PRIORITY = [
  "best-basketball-shoes-2026",
  "best-basketball-shoes-ankle-support-2026",
  "best-basketball-shoes-for-beginners-2026",
  "best-oat-milk-2026",
  "best-almond-butter-2026",
  "best-dark-chocolate-2026",
  "best-soccer-cleats-2026",
  "best-workout-gloves-2026",
  "best-hair-straightener-2026",
  "best-vpn-2026",
];
const LOCALES = ["en", "ja"];
const VARIANTS_PER = 2; // how many pin angles per article×locale

interface Pin {
  pin_id: string; article_slug?: string; locale: string; variant: string;
  title: string; description: string; link: string; image_alt?: string;
}

const raw = fs.readFileSync(path.resolve(__dirname, "pins.yaml"), "utf8");
const pins = ((yaml.load(raw) as { pins: Pin[] }).pins) ?? [];
const slugOf = (p: Pin) => p.article_slug ?? (p.link?.match(/\/([^/]+)\/?$/) ?? [])[1] ?? "";

const out: string[] = [];
out.push("# Pinterest 優先投稿キット（手動・API承認不要）");
out.push("");
out.push(`画像は ${OG_BASE} から配信（全URL有効）。Pinterest の pin-builder に下記を貼り付け。`);
out.push("**1日10〜15ピンに分散**（バースト投稿はスパム判定）。GSC実績順に並べてあります。");
out.push("");
let n = 0;
for (const slug of PRIORITY) {
  const title0 = pins.find((p) => slugOf(p) === slug)?.title ?? slug;
  out.push(`\n## ${slug}`);
  for (const loc of LOCALES) {
    const cands = pins.filter((p) => slugOf(p) === slug && p.locale === loc).slice(0, VARIANTS_PER);
    for (const p of cands) {
      n++;
      const link = p.link?.startsWith("http") ? p.link : `${SITE}${p.link}`;
      const img = `${OG_BASE}/og/${slug}-${loc}.png`;
      out.push(`\n### [${loc}] ${p.variant}`);
      out.push(`- **Title**: ${p.title}`);
      out.push(`- **Description**: ${p.description.trim().replace(/\s+/g, " ")}`);
      out.push(`- **Link**: ${link}`);
      out.push(`- **Image URL**: ${img}`);
      if (p.image_alt) out.push(`- **Alt**: ${p.image_alt}`);
    }
  }
}
out.push(`\n---\n合計 ${n} ピン（${PRIORITY.length}記事 × ${LOCALES.length}言語 × 最大${VARIANTS_PER}案）。`);
console.log(out.join("\n"));
