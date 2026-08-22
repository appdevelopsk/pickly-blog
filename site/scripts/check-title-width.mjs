#!/usr/bin/env node
/**
 * ソースJSONだけで <title> の表示幅超過を事前検出する軽量チェッカー。
 *
 * 背景(2026-08-22): ja翻訳75本を入れたデプロイが `Gate the built output` の
 * 幅60チェックで停止した(run 32549896128)。ビルドに10分以上かかるため、
 * 本番CIまで気づけないのが問題だった。本スクリプトは src/articles/ の
 * messages/*.json だけを読み、約1秒で同じ判定を返す。
 *
 * check-built-output.mjs と条件を一致させる3点:
 *   1. 表示幅ルール(WIDE 正規表現)は同一のものをコピー。
 *   2. noindex ページは門番が検査対象外(`if (noindex) continue;`)なので、
 *      deindexed-slugs.ts のスラッグを除外する。
 *   3. INDEXED_LOCALES 外のロケール(ar/hi/id/th/vi/tr等)は layout.tsx で
 *      サイト全体 noindex なので除外する。これを入れないと th/tr/id が
 *      大量に誤検出される(実際に204件の誤報を出したことがある)。
 *
 * 使い方:
 *   node scripts/check-title-width.mjs        # 超過があれば exit 1
 *   npm run check:titles
 */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ARTICLES = resolve(HERE, "../src/articles");
const LOCALES_TS = resolve(HERE, "../src/lib/i18n/locales.ts");
const DEINDEXED_TS = resolve(HERE, "../src/lib/articles/deindexed-slugs.ts");

// check-built-output.mjs と同一。全角(East Asian Width = W/F)は半角2つぶん。
const WIDE = /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦]/;
const width = (t) => [...t].reduce((n, c) => n + (WIDE.test(c) ? 2 : 1), 0);
const TITLE_LIMIT = 60;

function indexedLocales() {
  const src = readFileSync(LOCALES_TS, "utf8");
  const m = src.match(/INDEXED_LOCALES\s*:\s*Locale\[\]\s*=\s*\[([^\]]*)\]/);
  if (!m) {
    console.error("INDEXED_LOCALES を locales.ts から読めませんでした。");
    process.exit(2);
  }
  return new Set([...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]));
}

function deindexedSlugs() {
  const src = readFileSync(DEINDEXED_TS, "utf8");
  return new Set([...src.matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]));
}

/** meta.ts の locales を読む。ALL_LOCALES 展開時は "ALL" を返す。 */
function localesOf(dir) {
  const src = readFileSync(`${dir}/meta.ts`, "utf8");
  if (/locales:\s*(\[\s*\.\.\.)?ALL_LOCALES/.test(src)) return "ALL";
  const m = src.match(/locales:\s*\[([^\]]*)\]/);
  return new Set(m ? [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]) : []);
}

const INDEXED = indexedLocales();
const DEINDEXED = deindexedSlugs();
const over = [];
let checked = 0;

for (const slug of readdirSync(ARTICLES)) {
  const dir = `${ARTICLES}/${slug}`;
  if (!statSync(dir).isDirectory()) continue;
  if (DEINDEXED.has(slug)) continue; // noindex は門番の対象外
  const msgDir = `${dir}/messages`;
  if (!existsSync(msgDir) || !existsSync(`${dir}/meta.ts`)) continue;

  let locs;
  try {
    locs = localesOf(dir);
  } catch {
    continue;
  }

  for (const f of readdirSync(msgDir)) {
    if (!f.endsWith(".json")) continue;
    const locale = f.slice(0, -5);
    if (!INDEXED.has(locale)) continue; // サイト全体 noindex のロケール
    if (locs !== "ALL" && !locs.has(locale)) continue;

    let j;
    try {
      j = JSON.parse(readFileSync(`${msgDir}/${f}`, "utf8"));
    } catch {
      continue;
    }
    // title は meta.title 形式とトップレベル title 形式が混在している。
    const title = typeof j.meta?.title === "string" ? j.meta.title
      : typeof j.title === "string" ? j.title : "";
    if (!title) continue;
    checked++;
    const w = width(title);
    if (w > TITLE_LIMIT) over.push({ w, slug, locale, title });
  }
}

over.sort((a, b) => b.w - a.w);
console.log(`検査対象: ${checked} タイトル (src/articles、noindex記事・非INDEXEDロケールを除く)`);
if (!over.length) {
  console.log(`✓ <title> の表示幅は全て ${TITLE_LIMIT} 以内`);
  process.exit(0);
}
console.error(`✗ 表示幅 ${TITLE_LIMIT} 超のタイトル: ${over.length}件`);
for (const t of over) console.error(`  ${t.w}  ${t.slug}/${t.locale}: ${t.title}`);
console.error(`\n短縮するには: npx tsx scripts/fix-title-width.ts`);
process.exit(1);
