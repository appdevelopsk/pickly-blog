/**
 * make-pinterest-bulk-csv.ts
 * ------------------------------------------------------------------
 * Pinterest 公式「Bulk create Pins」(ビジネスアカウント) 用のCSVを生成する。
 * APIもボットも使わない、規約準拠の一括投稿。画像は公開URL (pickly.blog/pins/) を参照。
 *
 * Pinterest のテンプレ列に準拠:
 *   Title, Media URL, Pinterest board, Thumbnail, Description, Link, Publish date, Keywords
 *
 * 使い方:
 *   cd site && npx tsx scripts/make-pinterest-bulk-csv.ts --slugs a,b,c --locales en,ja
 * 出力: ../manual-pins/pinterest-bulk-<locale>.csv （1ファイル≤200ピン）
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.resolve(__dirname, "..");
const ARTICLES_DIR = path.join(SITE, "src/articles");
const OUT_DIR = path.resolve(SITE, "../manual-pins");
const SITE_URL = "https://pickly.blog";
// Pin image = the article's 1000x1500 OG image already hosted on R2
// (img.pickly.blog/og/<slug>-<locale>.png). Reusing it costs zero Pages file
// budget vs. duplicating images under /pins.
const OG_BASE = process.env.NEXT_PUBLIC_OG_BASE_URL || "https://img.pickly.blog";

const args = process.argv.slice(2);
const flag = (n: string) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
const SLUGS = (flag("slugs") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const LOCALES = (flag("locales") ?? "en,ja").split(",").map((s) => s.trim());

const BOARD: Record<string, string> = {
  parenting: "Baby & Kids Gear", pets: "Pet Essentials", travel: "Travel Gear & Packing",
  fashion: "Style & Outfits", home: "Home Decor & Living", beauty: "Beauty & Skincare",
  fitness: "Fitness & Training", food: "Food & Kitchen", tech: "Tech & Gadgets", finance: "Money & Saving",
};
const GENRE_KW: Record<string, string> = {
  parenting: "baby gear, parenting", pets: "pet care, pets", travel: "travel essentials, packing tips",
  fashion: "outfit ideas, fashion", home: "home decor, interior", beauty: "beauty tips, skincare",
};

function readJson(slug: string, locale: string): any | null {
  try { return JSON.parse(fs.readFileSync(path.join(ARTICLES_DIR, slug, "messages", `${locale}.json`), "utf8")); }
  catch { return null; }
}
function category(slug: string): string {
  try { return fs.readFileSync(path.join(ARTICLES_DIR, slug, "meta.ts"), "utf8").match(/category:\s*"([^"]+)"/)?.[1] ?? ""; }
  catch { return ""; }
}
/** slug → プレーンキーワード（# なし・カンマ区切り、Pinterest Keywords列用） */
function keywords(slug: string, cat: string): string {
  const product = slug.replace(/^best-/, "").replace(/-2026$/, "").replace(/-/g, " ");
  return [product, GENRE_KW[cat] ?? "", "2026 picks"].filter(Boolean).join(", ");
}
function csvCell(s: string): string {
  const v = (s ?? "").replace(/\r?\n/g, " ").trim();
  return /[",]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

fs.mkdirSync(OUT_DIR, { recursive: true });
const HEADERS = ["Title", "Media URL", "Pinterest board", "Thumbnail", "Description", "Link", "Publish date", "Keywords"];

let totalRows = 0;
for (const locale of LOCALES) {
  const rows: string[][] = [];
  for (const slug of SLUGS) {
    const en = readJson(slug, "en");
    const c = readJson(slug, locale) ?? en;
    if (!c) continue;
    const cat = category(slug);
    const title = (c.title ?? en?.title ?? slug).slice(0, 100); // Pinterest title上限100字
    const desc = (c.pinDescription ?? c.description ?? en?.pinDescription ?? en?.description ?? "").slice(0, 500);
    rows.push([
      title,
      `${OG_BASE}/og/${slug}-${locale}.png`,
      BOARD[cat] ?? cat,
      "",                                   // Thumbnail (video only)
      desc,
      `${SITE_URL}/${locale}/articles/${slug}`,
      "",                                   // Publish date (空=即時。後でスケジュールも可)
      keywords(slug, cat),
    ]);
  }
  // ボード順に並べる（アップロード後の見通し用）
  rows.sort((a, b) => a[2].localeCompare(b[2]) || a[5].localeCompare(b[5]));
  // 1ファイル200ピン上限でチャンク分割
  const CHUNK = 200;
  for (let i = 0; i * CHUNK < rows.length; i++) {
    const slice = rows.slice(i * CHUNK, (i + 1) * CHUNK);
    const suffix = rows.length > CHUNK ? `-${i + 1}` : "";
    const file = path.join(OUT_DIR, `pinterest-bulk-${locale}${suffix}.csv`);
    fs.writeFileSync(file, [HEADERS.join(","), ...slice.map((r) => r.map(csvCell).join(","))].join("\n") + "\n");
    console.log(`✓ ${path.relative(SITE, file)}  (${slice.length} pins)`);
  }
  totalRows += rows.length;
}
console.log(`\n合計 ${totalRows} ピン  (${SLUGS.length}記事 × ${LOCALES.length}locale)`);
console.log(`画像URL例: ${OG_BASE}/og/${SLUGS[0]}-${LOCALES[0]}.png`);
