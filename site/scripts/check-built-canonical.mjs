/**
 * ビルド出力の canonical / hreflang をデプロイ前に検査する門番。(pickly)
 *
 * なぜ (2026-08-17):
 *   GSC カバレッジで pickly は「検出 - 未登録」3,285ページを抱えている。この種の不具合は
 *   **HTTP 200 を返したまま**起きるので、外部クロール監査では見えない。canonical が
 *   自分以外を指す / 欠落する / hreflang クラスタが壊れる、はいずれも型が通り画面も
 *   正常に見えるため、出来上がった HTML を検査するしかない。
 *   既存の check-built-output.mjs は title・アフィリタグ・i18n を見るが canonical は
 *   一切見ていなかった（grep で 0 件）。その穴を塞ぐ。
 *
 * 検査内容（致命 = デプロイ中止）:
 *   1. index 対象ページに canonical が無い
 *   2. canonical が二重ロケール接頭辞 (/ja/ja/... など)
 *   3. canonical が自己参照でない
 *   4. hreflang が二重ロケール接頭辞
 *   5. hreflang クラスタが noindex ロケール(ar/hi/id/th/tr/vi)を指している
 *      ＝ index 対象ページが検索除外ページへ誘導する矛盾
 *
 * 検査対象外:
 *   - `noindex` ページ。ar/hi/id/th/tr/vi は INDEXED_LOCALES から外して
 *     意図的に noindex + sitemap除外にしている（locales.ts 参照）。自己canonical で
 *     hreflang クラスタに入らないのは**設計どおり**で、欠陥ではない。
 *   - 404.html などフレームワーク側のページ。
 *
 * 使い方: node scripts/check-built-canonical.mjs [out]
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = process.argv[2] ?? join(ROOT, "out");
if (!existsSync(DIR)) {
  console.error(`ビルド出力が無い: ${DIR}\n先に npm run build を実行すること。`);
  process.exit(1);
}

const ALL_LOCALES = [
  "en", "ja", "zh-CN", "zh-TW", "ko", "es", "pt-BR", "fr", "de",
  "it", "ru", "ar", "hi", "id", "th", "vi", "tr",
];
// locales.ts の INDEXED_LOCALES と一致させること（片方だけ動かすと検査が嘘をつく）
const INDEXED = ["en", "ja", "de", "es", "fr", "it", "ru", "pt-BR", "zh-TW", "zh-CN", "ko"];
const NOINDEX_LOCALES = ALL_LOCALES.filter((l) => !INDEXED.includes(l));
const DOUBLE = new RegExp(`/(${ALL_LOCALES.join("|")})/(${ALL_LOCALES.join("|")})(/|$)`);

const files = [];
(function walk(d) {
  for (const e of readdirSync(d)) {
    if (e === "_next" || e === "images" || e === "og" || e === "data") continue;
    const p = join(d, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (e.endsWith(".html")) files.push(p);
  }
})(DIR);

const unescapeHtml = (s) => s.replace(/&amp;/g, "&");
const strip = (p) => (p.replace(/\/$/, "") || "/");

/** 出力ファイルパス → 配信URLパス。static export なので dir/index.html = /dir/ */
function pagePath(file) {
  let p = "/" + relative(DIR, file).replace(/\\/g, "/").replace(/\.html$/, "");
  p = p.replace(/\/index$/, "");
  return p || "/";
}
// ロケール接頭辞を持たないページは検査対象外。
// 404.html / googleXXXX.html(Search Console 所有権確認) など、canonical を持つ理由が無い。
const isFrameworkPage = (p) => !ALL_LOCALES.includes(p.slice(1).split("/")[0]);

const missing = [], dblCanonical = [], notSelf = [], dblHreflang = [], badCluster = [];
let skipped = 0, checked = 0;

for (const f of files) {
  const path = pagePath(f);
  if (isFrameworkPage(path)) { skipped++; continue; }
  const html = readFileSync(f, "utf-8");
  // noindex ページは検索対象外＝canonical/hreflang の整合を問う意味が無い
  if (/<meta[^>]+name="robots"[^>]*content="[^"]*noindex/i.test(html)) { skipped++; continue; }
  checked++;

  const canonTag = html.match(/<link[^>]+rel="canonical"[^>]*>/i);
  if (!canonTag) { missing.push(path); continue; }
  const href = unescapeHtml(canonTag[0].match(/href="([^"]+)"/i)?.[1] ?? "");
  let canonPath = href;
  try { canonPath = new URL(href).pathname; } catch {}

  if (DOUBLE.test(canonPath)) dblCanonical.push({ path, href });
  else if (strip(canonPath) !== strip(path)) notSelf.push({ path, href });

  for (const m of html.matchAll(/<link[^>]+rel="alternate"[^>]+hreflang="([^"]+)"[^>]*>/gi)) {
    const code = m[1];
    const h = unescapeHtml(m[0].match(/href="([^"]+)"/i)?.[1] ?? "");
    let hp = h;
    try { hp = new URL(h).pathname; } catch {}
    if (DOUBLE.test(hp)) { dblHreflang.push({ path, href: h }); break; }
    // "en-GB" のような地域付きは基底言語で判定する
    if (NOINDEX_LOCALES.includes(code)) { badCluster.push({ path, code }); break; }
  }
}

const show = (label, arr, fmt) => {
  if (!arr.length) return;
  console.error(`\n❌ ${label}: ${arr.length}件`);
  for (const x of arr.slice(0, 15)) console.error(`   ${fmt(x)}`);
  if (arr.length > 15) console.error(`   ...他 ${arr.length - 15} 件`);
};
show("canonical が無い", missing, (x) => x);
show("canonical が二重ロケール接頭辞", dblCanonical, (x) => `${x.path} -> ${x.href}`);
show("canonical が自己参照でない", notSelf, (x) => `${x.path} -> ${x.href}`);
show("hreflang が二重ロケール接頭辞", dblHreflang, (x) => `${x.path} -> ${x.href}`);
show("hreflang が noindex ロケールを指す", badCluster, (x) => `${x.path} -> hreflang=${x.code}`);

const fatal = missing.length + dblCanonical.length + notSelf.length + dblHreflang.length + badCluster.length;
if (fatal) {
  console.error(`\n検査 ${checked} ページ / 致命的な問題 ${fatal} 件。デプロイ中止。`);
  process.exit(1);
}
console.log(`✅ canonical/hreflang 検査 OK（検査 ${checked} ページ / 対象外 ${skipped} ページ(noindex・404)）`);
