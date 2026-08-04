/**
 * ビルド成果物(out/)をデプロイ前に検査する門番。
 *
 * なぜソースではなく出力を見るか (2026-08-04):
 *   この日に見つけた不具合は全て「ソースを読んでも分からず、出来上がった HTML を
 *   見て初めて分かる」形だった。
 *     - Amazon リンク 625本にアフィリエイトタグが無かった。カタログ側は
 *       `network: "direct"` と書いてあるだけで、URL がそのまま出力される経路だった。
 *       クリックされても永久に1円にもならないが、画面上は正常に見える。
 *     - 971ページの <title> が全ロケールで英語のままだった。本文の見出しは
 *       17言語に翻訳されており、画面を見ても気づけない(SERP に出るのは metadata)。
 *     - トップの <title> が「Pickly | Pickly」になっていた。
 *   よってゲートは**出力に対して**かけ、落ちたらデプロイしない。
 *
 * 使い方:
 *   node scripts/check-built-output.mjs            # out/ を検査
 *   node scripts/check-built-output.mjs --dir out  # ディレクトリ指定
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const argDir = process.argv.indexOf("--dir");
const ROOT = argDir >= 0 ? process.argv[argDir + 1] : "out";

// SERP の表示幅。全角(East Asian Width = W/F)は半角2つぶん。
const WIDE = /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦]/;
const width = (t) => [...t].reduce((n, c) => n + (WIDE.test(c) ? 2 : 1), 0);
const TITLE_LIMIT = 60;

function unescapeHtml(s) {
  return s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

const pages = [];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (e === "index.html") pages.push(p);
  }
})(ROOT);

const problems = { untaggedAffiliate: [], deadAffiliate: [], emptyTitle: [], wideTitle: [], rawKey: [], doubleBrand: [] };
const titlesByPath = new Map();   // ロケールを除いたパス -> Map(locale -> title)

for (const file of pages) {
  const html = readFileSync(file, "utf8");
  const rel = file.slice(ROOT.length + 1).replace(/\/index\.html$/, "") || "/";

  // ---- アフィリエイトリンク -------------------------------------------------
  for (const m of html.matchAll(/href="(https:\/\/www\.amazon\.[a-z.]+\/[^"]*)"/g)) {
    const url = unescapeHtml(m[1]);
    if (!/[?&]tag=/.test(url)) problems.untaggedAffiliate.push(`${rel}  ${url}`);
    // 商品でも検索でもないリンク(トップページ等)は読者にとって行き止まり
    if (/^https:\/\/www\.amazon\.[a-z.]+\/?(\?|$)/.test(url)) problems.deadAffiliate.push(`${rel}  ${url}`);
  }

  // ---- <title> --------------------------------------------------------------
  const robots = html.match(/<meta name="robots" content="([^"]*)"/);
  const noindex = !!robots && /noindex/.test(robots[1]);
  const tm = html.match(/<title>([\s\S]*?)<\/title>/);
  if (!tm) continue;
  const title = unescapeHtml(tm[1].replace(/\s+/g, " ").trim());
  if (noindex) continue;                       // 検索に出ないページは対象外

  if (!title) { problems.emptyTitle.push(rel); continue; }
  if (width(title) > TITLE_LIMIT) problems.wideTitle.push(`${width(title)}  ${rel}  ${title}`);
  // 生の翻訳キーが漏れていないか (例: crossBrokerPage.meta_title)
  if (/^[a-z][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)+(\s|$|\|)/.test(title)) problems.rawKey.push(`${rel}  ${title}`);
  // ブランドの二重付与 (例: Pickly | Pickly)
  const brand = title.match(/\|\s*([^|]+)$/);
  if (brand && title.split(brand[1]).length > 2) problems.doubleBrand.push(`${rel}  ${title}`);

  const seg = rel.split("/");
  const locale = seg[0];
  const rest = seg.slice(1).join("/") || "(home)";
  if (!titlesByPath.has(rest)) titlesByPath.set(rest, new Map());
  titlesByPath.get(rest).set(locale, title);
}

// ---- 全ロケールで同一のタイトル = metadata が未翻訳 --------------------------
// 記事は「その言語に翻訳が無ければ noindex」で既に除外されるので、ここに残るのは
// ハブページ等。5ロケール以上で完全一致していたら未翻訳とみなす。
const untranslated = [];
for (const [rest, byLocale] of titlesByPath) {
  if (byLocale.size < 5) continue;
  const uniq = new Set(byLocale.values());
  if (uniq.size === 1) untranslated.push(`${byLocale.size}ロケール  /${rest}  ${[...uniq][0]}`);
}

const checks = [
  ["Amazonリンクにアフィリエイトタグが無い（クリックされても報酬にならない）", problems.untaggedAffiliate],
  ["Amazonのトップページに飛ぶ行き止まりリンク", problems.deadAffiliate],
  ["<title> が空", problems.emptyTitle],
  [`<title> の表示幅が ${TITLE_LIMIT} 超（SERPで切れる）`, problems.wideTitle],
  ["<title> に生の翻訳キーが出ている", problems.rawKey],
  ["<title> にブランドが二重に付いている", problems.doubleBrand],
  ["<title> が全ロケールで同一（metadata が未翻訳）", untranslated],
];

let failed = 0;
console.log(`検査対象: ${pages.length} ページ (${ROOT})`);
for (const [label, list] of checks) {
  if (!list.length) { console.log(`  ✓ ${label}: 0`); continue; }
  failed += list.length;
  console.error(`  ✗ ${label}: ${list.length}`);
  for (const x of list.slice(0, 10)) console.error(`      ${x}`);
  if (list.length > 10) console.error(`      … 他 ${list.length - 10} 件`);
}

if (failed) {
  console.error(`\n❌ ${failed} 件。デプロイを中止する。`);
  process.exit(1);
}
console.log("\n✓ ビルド出力の検査を通過");
