/**
 * gen-pinterest-feed.ts
 * ------------------------------------------------------------------
 * Pickly の主流入エンジンである Pinterest 向けに、ライブ記事から
 * 「投稿キュー」を生成する。投稿自体はしない（このスクリプトは認証不要）。
 *
 * なぜ専用か: gen-social-drafts.ts は人間が読む md。本スクリプトは
 *   スケジューラ / Pinterest API / 手動バルクのいずれにも食わせられる
 *   機械可読フォーマット（CSV 分割 + JSONL）を出す。
 *
 * 冪等性: meta.pinned[locale] が true の (記事, locale) は除外する。
 *   投稿後に pinned を立てれば再投稿しない（mark-pinned.ts で更新想定）。
 *
 * 生成物（out-pinterest/ 配下）:
 *   - <locale>/pins-001.csv ...   : 1ファイル最大 --per-file 行（既定200）
 *       列: Title, Media URL, Board, Description, Link, Keywords
 *       → Pinterest のバルク投稿 / Tailwind 等スケジューラの取込用
 *   - queue.jsonl                 : 全 (記事,locale) を1行1JSON。API投稿用の単一ソース
 *   - summary.md                  : 件数内訳とオペレーション手順
 *
 * 使い方:
 *   npx tsx scripts/gen-pinterest-feed.ts                  # en のみ
 *   npx tsx scripts/gen-pinterest-feed.ts --locales all    # 全ビルド済ロケール
 *   npx tsx scripts/gen-pinterest-feed.ts --locales en,ja,de
 *   npx tsx scripts/gen-pinterest-feed.ts --category food
 *   npx tsx scripts/gen-pinterest-feed.ts --per-file 100 --limit 50
 *   npx tsx scripts/gen-pinterest-feed.ts --pin-image     # 縦長 -pin.png を画像に使う
 *
 * ⚠ 画像について: 既定の OG 画像 (/og/<slug>-<locale>.png) は 1200x630 の横長。
 *   Pinterest は 2:3 縦長(1000x1500)を強く優遇し、横長はリーチが落ちる。
 *   縦長バリアント /og/<slug>-<locale>-pin.png を用意したら --pin-image を付ける。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { listArticles } from "@/lib/articles/registry";
import { hasApprovedAds } from "@/lib/affiliates/has-ads";
import type { ArticleMeta, Locale } from "@/lib/articles/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = path.resolve(__dirname, "../src/articles");
const OUT_DIR = path.resolve(__dirname, "../out-pinterest");
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";

const args = process.argv.slice(2);
function flag(name: string): string | undefined {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
}
function has(name: string): boolean {
  return args.includes(`--${name}`);
}
const LIMIT = flag("limit") ? parseInt(flag("limit")!, 10) : Infinity;
const CATEGORY = flag("category");
const PER_FILE = flag("per-file") ? parseInt(flag("per-file")!, 10) : 200;
const USE_PIN_IMAGE = has("pin-image");
const DRY_RUN = has("dry-run");
const LOCALES_ARG = flag("locales") ?? "en";

interface Content {
  title?: string;
  description?: string;
  lede?: string;
  pinDescription?: string;
}

function load(slug: string, locale: string): Content | null {
  for (const l of [locale, "en"]) {
    const f = path.join(ARTICLES_DIR, slug, "messages", `${l}.json`);
    try {
      return JSON.parse(fs.readFileSync(f, "utf8"));
    } catch {
      /* next */
    }
  }
  return null;
}
function humanize(id: string): string {
  return id
    .replace(/-\d{4}$/, "")
    .split("-")
    .join(" ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
function firstSentence(t = "", max = 480): string {
  const m = t.match(/^(.*?[.!?。])\s/);
  const s = (m ? m[1] : t).trim();
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}
function csvCell(v: string): string {
  // Pinterest の取込CSVは RFC4180 準拠で十分。改行・引用符・カンマをエスケープ。
  const s = (v ?? "").replace(/\r?\n/g, " ").trim();
  return /[",]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function extractHashtags(desc: string): string {
  return (desc.match(/#[\w-]+/g) ?? []).join(" ");
}

/** カテゴリ → Pinterest ボード名。未知カテゴリは humanize でフォールバック。 */
const BOARD_BY_CATEGORY: Record<string, string> = {
  tech: "Best Tech & Gadgets",
  home: "Home & Living Finds",
  food: "Kitchen & Food Picks",
  fitness: "Fitness Gear Guides",
  beauty: "Beauty & Skincare Picks",
  fashion: "Fashion & Accessories",
  parenting: "Baby & Parenting",
  finance: "Money & Finance Tools",
  travel: "Travel Essentials",
  pet: "Pet Supplies We Love",
};
function boardFor(category: string): string {
  return BOARD_BY_CATEGORY[category] ?? humanize(category);
}

// ---- ロケール解決 -------------------------------------------------
const live = listArticles().filter(
  (a) => (!CATEGORY || a.category === CATEGORY) && a.locales.some((l) => hasApprovedAds(a, l)),
);
const sliced = live.slice(0, LIMIT === Infinity ? live.length : LIMIT);

const ALL_BUILT_LOCALES = Array.from(
  new Set(sliced.flatMap((a) => a.locales.filter((l) => hasApprovedAds(a, l)))),
);
const targetLocales: string[] =
  LOCALES_ARG === "all" ? ALL_BUILT_LOCALES : LOCALES_ARG.split(",").map((s) => s.trim());

interface PinRow {
  slug: string;
  locale: string;
  category: string;
  board: string;
  title: string;
  description: string;
  link: string;
  mediaUrl: string;
  keywords: string;
}

function pinned(a: ArticleMeta, locale: string): boolean {
  return Boolean(a.pinned?.[locale as Locale]);
}

const rows: PinRow[] = [];
let skippedPinned = 0;
let skippedNoContent = 0;

for (const a of sliced) {
  const builtLocales = a.locales.filter((l) => hasApprovedAds(a, l));
  for (const locale of targetLocales) {
    if (!builtLocales.includes(locale as Locale)) continue; // そのロケールは未ビルド=404
    if (pinned(a, locale)) {
      skippedPinned++;
      continue;
    }
    const c = load(a.slug, locale);
    if (!c) {
      skippedNoContent++;
      continue;
    }
    const title = (c.title ?? humanize(a.slug)).slice(0, 100);
    const desc = c.pinDescription ?? firstSentence(c.description ?? c.lede ?? "", 480);
    const imgSuffix = USE_PIN_IMAGE ? "-pin" : "";
    rows.push({
      slug: a.slug,
      locale,
      category: a.category,
      board: boardFor(a.category),
      title,
      description: desc.slice(0, 500),
      link: `${SITE_URL}/${locale}/articles/${a.slug}/`,
      mediaUrl: `${SITE_URL}/og/${a.slug}-${locale}${imgSuffix}.png`,
      keywords: extractHashtags(desc).replace(/#/g, ""),
    });
  }
}

// ---- 出力 ---------------------------------------------------------
const byLocale = new Map<string, PinRow[]>();
for (const r of rows) {
  (byLocale.get(r.locale) ?? byLocale.set(r.locale, []).get(r.locale)!).push(r);
}

console.log(`Pinterest feed:`);
console.log(`  live記事: ${live.length}  対象記事(limit後): ${sliced.length}`);
console.log(`  対象ロケール: ${targetLocales.join(", ")}`);
console.log(`  生成ピン: ${rows.length}（pinned除外 ${skippedPinned} / content無 ${skippedNoContent}）`);
console.log(`  画像: ${USE_PIN_IMAGE ? "縦長 -pin.png" : "横長 OG (Pinterest非推奨/暫定)"}`);

if (DRY_RUN) {
  console.log(`\n[dry-run] 書き込みなし。内訳:`);
  for (const [loc, rs] of byLocale) console.log(`  ${loc}: ${rs.length} pins`);
  process.exit(0);
}

fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

// JSONL（API投稿の単一ソース）
fs.writeFileSync(
  path.join(OUT_DIR, "queue.jsonl"),
  rows.map((r) => JSON.stringify(r)).join("\n") + "\n",
);

// ロケール別 CSV 分割
const CSV_HEADER = "Title,Media URL,Board,Description,Link,Keywords";
for (const [loc, rs] of byLocale) {
  const dir = path.join(OUT_DIR, loc);
  fs.mkdirSync(dir, { recursive: true });
  for (let i = 0; i < rs.length; i += PER_FILE) {
    const chunk = rs.slice(i, i + PER_FILE);
    const lines = chunk.map((r) =>
      [r.title, r.mediaUrl, r.board, r.description, r.link, r.keywords].map(csvCell).join(","),
    );
    const n = String(Math.floor(i / PER_FILE) + 1).padStart(3, "0");
    fs.writeFileSync(path.join(dir, `pins-${n}.csv`), [CSV_HEADER, ...lines].join("\n") + "\n");
  }
}

// サマリ
const summary: string[] = [
  `# Pinterest 投稿キュー`,
  ``,
  `- 生成ピン総数: **${rows.length}**`,
  `- 対象ロケール: ${targetLocales.join(", ")}`,
  `- 画像: ${USE_PIN_IMAGE ? "縦長 -pin.png" : "横長 OG（暫定・縦長推奨）"}`,
  `- pinned 済み除外: ${skippedPinned}`,
  ``,
  `## ロケール別内訳`,
  ...Array.from(byLocale.entries()).map(([loc, rs]) => `- ${loc}: ${rs.length} pins`),
  ``,
  `## 投稿オペレーション`,
  `1. **画像を縦長化（最優先）**: OG は横長でリーチが落ちる。/og テンプレに 2:3(1000x1500) の`,
  `   pin バリアントを足し、生成後は \`--pin-image\` で再生成する。`,
  `2. **投稿方法（いずれか）**:`,
  `   - スケジューラ(Tailwind等)に <locale>/pins-*.csv を取込み、1日10〜25ピンに分散。`,
  `   - Pinterest API v5 で queue.jsonl を投稿（scripts/post-pinterest.ts を実装）。`,
  `   - 手動バルク（少量）。`,
  `3. **投稿したら pinned を立てる**（再投稿防止）。meta.ts の pinned[locale]=true。`,
  `4. **ペース厳守**: 新規アカウントの大量一括はスパム判定。徐々に増やす。`,
];
fs.writeFileSync(path.join(OUT_DIR, "summary.md"), summary.join("\n") + "\n");

console.log(`\n✓ 出力: ${OUT_DIR}`);
console.log(`  queue.jsonl / <locale>/pins-*.csv / summary.md`);
