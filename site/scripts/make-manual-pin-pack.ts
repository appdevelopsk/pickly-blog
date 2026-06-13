/**
 * make-manual-pin-pack.ts
 * ------------------------------------------------------------------
 * API承認待ちの間に「手で」Pinterestへ投稿するためのパックを生成する。
 * 各 (記事 × ロケール) について:
 *   - 縦長ピン画像 (public/og/<slug>-<locale>-pin.png) を manual-pins/images/ へコピー
 *   - ボード名 / タイトル / キャプション / ハッシュタグ / 記事URL を CSV に出力
 *
 * 使い方:
 *   cd site && npx tsx scripts/make-manual-pin-pack.ts --slugs a,b,c --locales en,ja,de,fr,es
 * 出力:
 *   ../manual-pins/manual-pins.csv   ← スプレッドシートで開ける
 *   ../manual-pins/images/*.png      ← アップロードする画像
 *   ../manual-pins/README.md
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.resolve(__dirname, "..");
const ARTICLES_DIR = path.join(SITE, "src/articles");
const OG_DIR = path.join(SITE, "public/og");
const OUT_DIR = path.resolve(SITE, "../manual-pins");
const IMG_DIR = path.join(OUT_DIR, "images");

const SITE_URL = "https://pickly.blog";

const args = process.argv.slice(2);
const flag = (n: string) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
const SLUGS = (flag("slugs") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const LOCALES = (flag("locales") ?? "en,ja,de,fr,es").split(",").map((s) => s.trim());

// genre(category) → Pinterest ボード名（CLAUDE.md ルール6: ジャンル別ボード）
const BOARD: Record<string, string> = {
  parenting: "Baby & Kids Gear",
  pets: "Pet Essentials",
  travel: "Travel Gear & Packing",
  fashion: "Style & Outfits",
  home: "Home Decor & Living",
  beauty: "Beauty & Skincare",
  fitness: "Fitness & Training",
  food: "Food & Kitchen",
  tech: "Tech & Gadgets",
  finance: "Money & Saving",
};

function readJson(slug: string, locale: string): any | null {
  try { return JSON.parse(fs.readFileSync(path.join(ARTICLES_DIR, slug, "messages", `${locale}.json`), "utf8")); }
  catch { return null; }
}
function category(slug: string): string {
  try {
    const meta = fs.readFileSync(path.join(ARTICLES_DIR, slug, "meta.ts"), "utf8");
    return meta.match(/category:\s*"([^"]+)"/)?.[1] ?? "";
  } catch { return ""; }
}
/** slug → ハッシュタグ。商品種別 + ジャンル + ブランド固定タグ。 */
function hashtags(slug: string, cat: string): string {
  const core = slug.replace(/^best-/, "").replace(/-2026$/, "");
  const productTag = "#" + core.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join("");
  const genreTag: Record<string, string> = {
    parenting: "#BabyGear", pets: "#PetCare", travel: "#TravelEssentials",
    fashion: "#OOTD", home: "#HomeDecor", beauty: "#BeautyTips",
  };
  return [productTag, genreTag[cat] ?? "", "#Pickly2026"].filter(Boolean).join(" ");
}
function csvCell(s: string): string {
  const v = (s ?? "").replace(/\r?\n/g, " ").trim();
  return /[",]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

fs.mkdirSync(IMG_DIR, { recursive: true });

const localeRank: Record<string, number> = { en: 0, ja: 1, de: 2, fr: 3, es: 4 };
type Row = { board: string; locale: string; title: string; caption: string; tags: string; url: string; image: string; cat: string };
const rows: Row[] = [];
let imgCopied = 0, imgMissing = 0;

for (const slug of SLUGS) {
  const cat = category(slug);
  const en = readJson(slug, "en");
  for (const locale of LOCALES) {
    const c = readJson(slug, locale) ?? en;
    if (!c) continue;
    const title = c.title ?? en?.title ?? slug;
    // キャプション: pinDescription(en/ja は本文に有り) → description → lede の順でフォールバック
    const caption = c.pinDescription ?? c.description ?? en?.pinDescription ?? en?.description ?? "";
    const imgName = `${slug}-${locale}-pin.png`;
    const src = path.join(OG_DIR, imgName);
    if (fs.existsSync(src)) { fs.copyFileSync(src, path.join(IMG_DIR, imgName)); imgCopied++; }
    else imgMissing++;
    rows.push({
      board: BOARD[cat] ?? cat,
      locale,
      title,
      caption,
      tags: hashtags(slug, cat),
      url: `${SITE_URL}/${locale}/articles/${slug}`,
      image: imgName,
      cat,
    });
  }
}

// ボード → ロケール(en,ja優先) → slug の順に並べる（バッチ投稿しやすく）
rows.sort((a, b) =>
  a.board.localeCompare(b.board) ||
  (localeRank[a.locale] ?? 9) - (localeRank[b.locale] ?? 9) ||
  a.url.localeCompare(b.url)
);

const header = ["board", "locale", "title", "caption", "hashtags", "destination_url", "image_file", "ready_to_paste"];
const lines = [header.join(",")];
for (const r of rows) {
  const ready = `${r.caption}\n\n${r.tags}`;
  lines.push([r.board, r.locale, r.title, r.caption, r.tags, r.url, r.image, ready].map(csvCell).join(","));
}
fs.writeFileSync(path.join(OUT_DIR, "manual-pins.csv"), lines.join("\n") + "\n");

const byBoard = rows.reduce<Record<string, number>>((m, r) => ((m[r.board] = (m[r.board] ?? 0) + 1), m), {});
const readme = `# Pickly 手動ピン投稿パック

Pinterest API (Standard) 承認待ちの間、ここの画像とキャプションを使って手で投稿します。

## 中身
- \`manual-pins.csv\` — 1行 = 1ピン。列: board / locale / title / caption / hashtags / destination_url / image_file / ready_to_paste
- \`images/\` — アップロードする縦長画像 (1000×1500)

## 手順 (1ピン)
1. Pinterest で **board** 列のボードを作る/選ぶ（ジャンル別。1ボードに混ぜない）
2. 「ピンを作成」→ \`images/<image_file>\` をアップロード
3. タイトル = **title**、説明 = **ready_to_paste**（キャプション＋ハッシュタグ）を貼る
4. リンク = **destination_url** を貼る
5. 公開

## おすすめの進め方
- 1日10〜20ピン。まず **locale=en と ja** を優先（キャプションが本文同等の品質）。
- 同じボードに連投せず、ボードをまたいで分散させる。
- de/fr/es はキャプションが翻訳済みdescription。海外オーディエンス狙いで追加投稿用。

## 集計
- 総ピン数: ${rows.length}（記事 ${SLUGS.length} × ロケール ${LOCALES.length}）
- 画像コピー: ${imgCopied}（不足 ${imgMissing}）
- ボード別: ${Object.entries(byBoard).map(([b, n]) => `${b}=${n}`).join(" / ")}
`;
fs.writeFileSync(path.join(OUT_DIR, "README.md"), readme);

console.log(`✓ 手動投稿パック生成`);
console.log(`  CSV   : ${path.relative(SITE, path.join(OUT_DIR, "manual-pins.csv"))}`);
console.log(`  画像  : ${imgCopied} 枚コピー (不足 ${imgMissing})`);
console.log(`  ピン数: ${rows.length}  (${SLUGS.length}記事 × ${LOCALES.length}locale)`);
console.log(`  ボード別: ${Object.entries(byBoard).map(([b, n]) => `${b}=${n}`).join("  ")}`);
