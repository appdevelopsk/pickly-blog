/**
 * gen-pin-images.ts
 * ------------------------------------------------------------------
 * Pinterest 用の縦長(2:3, 1000x1500)ピン画像を生成する。
 * OG 画像(1200x630 横長)は Pinterest でリーチが落ちるため、ピン専用に
 * /public/og/<slug>-<locale>-pin.png を作り、gen-pinterest-feed --pin-image で使う。
 *
 * 仕組み: 記事タイトル＋カテゴリから SVG を組み、@resvg/resvg-js で PNG 化。
 * 依存は既存の devDependencies のみ（@resvg/resvg-js）。投稿はしない。
 *
 * 使い方:
 *   npx tsx scripts/gen-pin-images.ts                       # en, 全 live 記事
 *   npx tsx scripts/gen-pin-images.ts --locales en,ja,de
 *   npx tsx scripts/gen-pin-images.ts --slug best-basketball-shoes-2026
 *   npx tsx scripts/gen-pin-images.ts --category fitness --limit 20
 *   npx tsx scripts/gen-pin-images.ts --force               # 既存も上書き
 *
 * 注: 非ラテン言語(ja/zh/ko/ar/hi/th)は OS のシステムフォントに依存する
 *   （resvg がシステムフォントを読み込む）。フォント未導入の環境では豆腐になる。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import { listArticles } from "@/lib/articles/registry";
import { hasApprovedAds } from "@/lib/affiliates/has-ads";
import type { ArticleMeta } from "@/lib/articles/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = path.resolve(__dirname, "../src/articles");
const OUT_DIR = path.resolve(__dirname, "../public/og");

const args = process.argv.slice(2);
const flag = (n: string) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const has = (n: string) => args.includes(`--${n}`);
const LOCALES = (flag("locales") ?? "en").split(",").map((s) => s.trim());
const CATEGORY = flag("category");
const ONLY_SLUG = flag("slug");
const LIMIT = flag("limit") ? parseInt(flag("limit")!, 10) : Infinity;
const FORCE = has("force");
const ALL = has("all"); // bypass hasApprovedAds — use when generating for brand-new articles

const W = 1000;
const H = 1500;
const BRAND = "#dc2626"; // tailwind red-600
const INK = "#0f172a"; // slate-900

const CATEGORY_LABEL: Record<string, string> = {
  tech: "TECH", home: "HOME", food: "FOOD & KITCHEN", fitness: "FITNESS",
  beauty: "BEAUTY", fashion: "FASHION", parenting: "BABY & KIDS",
  finance: "MONEY", travel: "TRAVEL", pet: "PETS",
};

function load(slug: string, locale: string): { title?: string } | null {
  for (const l of [locale, "en"]) {
    try {
      const c = JSON.parse(fs.readFileSync(path.join(ARTICLES_DIR, slug, "messages", `${l}.json`), "utf8"));
      return { title: c.title ?? c.meta?.title };
    } catch {
      /* next */
    }
  }
  return null;
}
function humanize(slug: string): string {
  return slug.replace(/-?\d{4}$/, "").split("-").join(" ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
/** タイトルを最大 maxLines 行に折り返す。1文字幅は概算。CJK等は1文字を広めに数える。 */
function wrap(title: string, maxCharsPerLine: number, maxLines: number): string[] {
  const words = title.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  const isWide = (ch: string) => /[　-鿿가-힯＀-￯]/.test(ch);
  const w = (s: string) => [...s].reduce((a, ch) => a + (isWide(ch) ? 2 : 1), 0);
  for (const word of words) {
    const cand = cur ? `${cur} ${word}` : word;
    if (w(cand) > maxCharsPerLine && cur) {
      lines.push(cur);
      cur = word;
    } else {
      cur = cand;
    }
    if (lines.length >= maxLines) break;
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  if (lines.length > maxLines) lines.length = maxLines;
  // 収まらなかった分は最終行に省略記号
  return lines;
}

function svg(title: string, category: string): string {
  const cat = CATEGORY_LABEL[category] ?? category.toUpperCase();
  const lines = wrap(title, 18, 7);
  const lineHeight = 96;
  const blockHeight = lines.length * lineHeight;
  let y = 560 - blockHeight / 2 + lineHeight; // 縦中央寄せ
  const titleSpans = lines
    .map((ln) => {
      const t = `<text x="80" y="${y}" font-family="Helvetica, Arial, sans-serif" font-size="78" font-weight="800" fill="${INK}">${esc(ln)}</text>`;
      y += lineHeight;
      return t;
    })
    .join("\n  ");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#ffffff"/>
  <rect x="0" y="0" width="${W}" height="16" fill="${BRAND}"/>
  <text x="80" y="150" font-family="Helvetica, Arial, sans-serif" font-size="56" font-weight="900" fill="${BRAND}" letter-spacing="2">Pickly</text>
  <rect x="80" y="220" width="${24 + cat.length * 22}" height="56" rx="28" fill="${BRAND}"/>
  <text x="${80 + 24}" y="258" font-family="Helvetica, Arial, sans-serif" font-size="30" font-weight="700" fill="#ffffff" letter-spacing="3">${esc(cat)}</text>
  ${titleSpans}
  <rect x="80" y="1180" width="160" height="10" fill="${BRAND}"/>
  <text x="80" y="1300" font-family="Helvetica, Arial, sans-serif" font-size="40" font-weight="700" fill="${INK}">Tested &amp; Compared · 2026</text>
  <rect x="0" y="${H - 90}" width="${W}" height="90" fill="${BRAND}"/>
  <text x="80" y="${H - 30}" font-family="Helvetica, Arial, sans-serif" font-size="38" font-weight="800" fill="#ffffff" letter-spacing="1">pickly.blog</text>
</svg>`;
}

// ---- 対象決定 -----------------------------------------------------
let live = listArticles().filter((a) => ALL || a.locales.some((l) => hasApprovedAds(a, l)));
if (ONLY_SLUG) live = live.filter((a) => a.slug === ONLY_SLUG);
if (CATEGORY) live = live.filter((a) => a.category === CATEGORY);
live = live.slice(0, LIMIT === Infinity ? live.length : LIMIT);

fs.mkdirSync(OUT_DIR, { recursive: true });

let made = 0;
let skipped = 0;
for (const a of live as ArticleMeta[]) {
  const builtLocales = ALL ? a.locales : a.locales.filter((l) => hasApprovedAds(a, l));
  for (const locale of LOCALES) {
    if (!builtLocales.includes(locale as ArticleMeta["locales"][number])) continue;
    const outPath = path.join(OUT_DIR, `${a.slug}-${locale}-pin.png`);
    if (!FORCE && fs.existsSync(outPath)) {
      skipped++;
      continue;
    }
    const c = load(a.slug, locale);
    const title = c?.title ?? humanize(a.slug);
    const png = new Resvg(svg(title, a.category), {
      fitTo: { mode: "width", value: W },
      font: { loadSystemFonts: true },
    })
      .render()
      .asPng();
    fs.writeFileSync(outPath, png);
    made++;
  }
}

console.log(`✓ 縦長ピン画像生成: ${made} 枚 (skip既存 ${skipped})`);
console.log(`  出力: public/og/<slug>-<locale>-pin.png`);
console.log(`  対象ロケール: ${LOCALES.join(", ")}  記事: ${live.length}`);
console.log(`  → gen-pinterest-feed.ts --pin-image でこの画像を使うCSV/JSONLを生成`);
