/**
 * GSC「ページがインデックスに登録されなかった理由」を**デプロイ前に**先回りして潰す門番。
 *
 * なぜ (2026-08-24):
 *   GSC のカバレッジレポートは事後観測で、しかも反映に数日〜数週かかる。
 *   そこに並ぶ理由のうち、我々の出力を見れば**デプロイ前に確定判定できる**ものがある：
 *
 *     GSC の理由                          | ここで検出できるか
 *     ------------------------------------|--------------------------------
 *     見つかりませんでした（404）          | ✅ sitemap の loc に対応する HTML が out/ に無い
 *     noindex タグによって除外されました   | ✅ sitemap に載せた URL が noindex を持つ（自己矛盾）
 *     ページにリダイレクトがあります       | ✅ sitemap の loc が _redirects の対象になっている
 *     代替ページ（canonical あり）         | ✅ sitemap の loc の canonical が自分以外を指す
 *     robots.txt によりブロックされました  | ✅ sitemap の loc が robots.txt の Disallow 配下
 *     重複（正規ページが別）               | ⚠️ 同一 canonical を複数 URL が主張＝重複の種
 *     検出 - インデックス未登録            | ❌ クロールバジェット。出力からは判定不能
 *     クロール済 - インデックス未登録      | ❌ コンテンツ品質。出力からは判定不能
 *
 *   下2つは原理的にここでは分からない。上6つは全部「sitemap に載せた URL が
 *   実は index されない状態になっている」という**同じ形の自己矛盾**で、
 *   sitemap と出力 HTML を突き合わせれば 100% 確定する。既存の門番
 *   (check-built-output.mjs / check-built-canonical.mjs) は個々のページの中身は
 *   見るが、**sitemap との突き合わせは一切していない**（grep で 0 件）。その穴を塞ぐ。
 *
 * 重大度は2段（memory: build-gate-severity-split）:
 *   FATAL — sitemap に載せた URL が index されない。GSC に必ずエラーとして出る。exit 1。
 *   WARN  — 出力にはあるが sitemap に無い等。設計意図のこともあるので落とさない。
 *
 * 使い方:
 *   node scripts/check-index-health.mjs            # out/ を検査
 *   node scripts/check-index-health.mjs --dir out
 *   node scripts/check-index-health.mjs --json     # 機械可読（日次監視用）
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const argDir = process.argv.indexOf("--dir");
const DIR = argDir >= 0 ? process.argv[argDir + 1] : join(ROOT, "out");
const JSON_OUT = process.argv.includes("--json");

if (!existsSync(DIR)) {
  console.error(`ビルド出力が無い: ${DIR}\n先に npm run build を実行すること。`);
  process.exit(1);
}

const SITEMAP = join(DIR, "sitemap.xml");
if (!existsSync(SITEMAP)) {
  console.error(`sitemap.xml が無い: ${SITEMAP}`);
  process.exit(1);
}

// ---- sitemap の loc を集める（sitemapindex なら子 sitemap も辿る） ----
// ★子 loc は攻撃者入力ではない（これはローカル出力）が、外部 URL は無視する。
const ORIGIN = "https://pickly.blog";

function locsOf(xmlPath) {
  const xml = readFileSync(xmlPath, "utf8");
  const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) =>
    m[1].replace(/&amp;/g, "&"),
  );
  if (!/<sitemapindex/i.test(xml)) return locs;
  // sitemapindex: 子を辿る（out/ 内に実在するものだけ）
  const out = [];
  for (const child of locs) {
    if (!child.startsWith(ORIGIN)) continue;
    const p = join(DIR, child.slice(ORIGIN.length).replace(/^\//, ""));
    if (existsSync(p) && statSync(p).isFile()) out.push(...locsOf(p));
  }
  return out;
}

const rawLocs = locsOf(SITEMAP);

// ---- robots.txt の Disallow（User-agent: * のブロックのみ） ----
function robotsDisallows() {
  const p = join(DIR, "robots.txt");
  if (!existsSync(p)) return [];
  const rules = [];
  let inStar = false;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const s = line.replace(/#.*$/, "").trim();
    if (!s) continue;
    const m = s.match(/^(User-agent|Disallow|Allow)\s*:\s*(.*)$/i);
    if (!m) continue;
    const [, key, val] = m;
    if (/^user-agent$/i.test(key)) { inStar = val.trim() === "*"; continue; }
    if (inStar && /^disallow$/i.test(key) && val.trim()) rules.push(val.trim());
  }
  return rules;
}
const DISALLOW = robotsDisallows();

// ---- _redirects（Cloudflare Pages）の 3xx 規則 ----
// ★ 罠1: status 200 の行は「リライト」であって**リダイレクトではない**。
//        除外しないと /og/* 200 のような配信規則まで FATAL になる。
// ★ 罠2: `/:locale` の `:name` は**1セグメントに一致するプレースホルダ**。
//        単純に ":" の手前で切ってプレフィックス一致にすると `/` になり、
//        全 7,129 URL が一致した（2026-08-24 に実際にやらかした）。
//        セグメント単位の正規表現に変換すること。
function redirectRules() {
  const p = join(DIR, "_redirects");
  if (!existsSync(p)) return [];
  const rules = [];
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const s = line.replace(/#.*$/, "").trim();
    if (!s) continue;
    const parts = s.split(/\s+/);
    const from = parts[0];
    const to = parts[1] ?? "";
    const status = parts[2] ? parseInt(parts[2], 10) : 302;
    if (!from || !from.startsWith("/")) continue;
    if (!(status >= 300 && status < 400)) continue; // 200 はリライト、410 等も対象外
    rules.push({ from, to, status, re: ruleToRegExp(from) });
  }
  return rules;
}

// `/a/:x/b` → ^/a/[^/]+/b$ 、`/og/*` → ^/og/.*$
function ruleToRegExp(from) {
  const src = from
    .split("/")
    .map((seg) => {
      if (seg === "*") return "__SPLAT__";
      if (seg.startsWith(":")) return "[^/]+";
      return seg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    })
    .join("/")
    .replace("__SPLAT__", ".*");
  return new RegExp(`^${src}$`);
}

const REDIRECTS = redirectRules();

// robots / redirect の一致判定。robots.txt はプレフィックス一致（規格どおり）。
const matchesDisallow = (path, rule) =>
  rule.endsWith("*") ? path.startsWith(rule.slice(0, -1)) : path.startsWith(rule);

// _redirects は上から順に最初に一致した規則が勝つ。
const matchedRedirect = (path) => REDIRECTS.find((r) => r.re.test(path)) || null;

// ---- URL → out/ 内の実ファイル解決 ----
// ★ 静的エクスポートは /en/foo/ → out/en/foo/index.html と out/en/foo.html の両方がありうる。
function resolveFile(path) {
  const clean = path.replace(/^\//, "").replace(/\/$/, "");
  const cands = clean === ""
    ? ["index.html"]
    : [`${clean}/index.html`, `${clean}.html`];
  for (const c of cands) {
    const p = join(DIR, c);
    if (existsSync(p) && statSync(p).isFile()) return p;
  }
  return null;
}

const strip = (p) => (p.replace(/\/$/, "") || "/");

// ---- 検査本体 ----
const fatal = { missing: [], noindexInSitemap: [], redirected: [], robotsBlocked: [], canonicalElsewhere: [] };
const warn = { external: [], dupCanonical: [], notInSitemap: [] };

const seenPaths = new Set();
const canonicalOwners = new Map(); // canonical -> [url,...]

for (const loc of rawLocs) {
  if (!loc.startsWith(ORIGIN)) { warn.external.push(loc); continue; }
  const path = loc.slice(ORIGIN.length) || "/";
  seenPaths.add(strip(path));

  // 1. robots.txt でブロックされている URL を sitemap に載せている
  if (DISALLOW.some((r) => matchesDisallow(path, r))) {
    fatal.robotsBlocked.push(path);
    continue; // 以降の検査は無意味
  }

  // 2. リダイレクト対象を sitemap に載せている
  const red = matchedRedirect(path);
  if (red) {
    fatal.redirected.push(`${path} → ${red.to || red.from} (${red.status}, 規則 ${red.from})`);
    continue;
  }

  // 3. 実ファイルが無い ＝ 404
  const file = resolveFile(path);
  if (!file) { fatal.missing.push(path); continue; }

  const html = readFileSync(file, "utf8");

  // 4. sitemap に載せた URL が noindex
  const robotsMeta = html.match(/<meta[^>]+name=["']robots["'][^>]*content=["']([^"']*)["']/i);
  if (robotsMeta && /noindex/i.test(robotsMeta[1])) {
    fatal.noindexInSitemap.push(path);
    continue;
  }

  // 5. canonical が自分以外を指す ＝「代替ページ」としてインデックスされない
  const can = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  if (can) {
    const href = can[1].replace(/&amp;/g, "&");
    const canPath = href.startsWith(ORIGIN) ? href.slice(ORIGIN.length) || "/" : href;
    if (strip(canPath) !== strip(path)) {
      fatal.canonicalElsewhere.push(`${path} → ${canPath}`);
    }
    const key = strip(canPath);
    if (!canonicalOwners.has(key)) canonicalOwners.set(key, []);
    canonicalOwners.get(key).push(strip(path));
  }
}

// 6. 同一 canonical を複数 URL が主張＝「重複」の種（WARN）
for (const [can, owners] of canonicalOwners) {
  if (owners.length > 1) warn.dupCanonical.push(`${can} ← ${owners.join(", ")}`);
}

// 7. index 可能な出力なのに sitemap に無い（WARN。noindex は正常なので除外）
(function walk(d) {
  for (const e of readdirSync(d)) {
    if (e === "_next" || e === "images" || e === "og" || e === "data" || e === "admin") continue;
    const p = join(d, e);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (e !== "index.html") continue;
    const rel = "/" + p.slice(DIR.length + 1).replace(/index\.html$/, "").replace(/\/$/, "");
    const path = strip(rel);
    if (seenPaths.has(path)) continue;
    const html = readFileSync(p, "utf8");
    if (/<meta[^>]+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) continue;
    warn.notInSitemap.push(path);
  }
})(DIR);

// ---- 出力 ----
const LABEL = {
  missing: "GSC「見つかりませんでした（404）」sitemap の URL に対応する HTML が無い",
  noindexInSitemap: "GSC「noindex タグによって除外されました」sitemap に載せた URL が noindex",
  redirected: "GSC「ページにリダイレクトがあります」sitemap の URL が _redirects の対象",
  robotsBlocked: "GSC「robots.txt によりブロックされました」sitemap の URL が Disallow 配下",
  canonicalElsewhere: "GSC「代替ページ（適切な canonical タグあり）」canonical が自分以外を指す",
};
const WLABEL = {
  external: "sitemap に外部ドメインの URL",
  dupCanonical: "GSC「重複しています」の種：同一 canonical を複数 URL が主張",
  notInSitemap: "index 可能だが sitemap に無い（意図的なら無視してよい）",
};

const fatalCount = Object.values(fatal).reduce((n, a) => n + a.length, 0);
const warnCount = Object.values(warn).reduce((n, a) => n + a.length, 0);

if (JSON_OUT) {
  console.log(JSON.stringify({
    checked: rawLocs.length, fatalCount, warnCount, fatal, warn,
  }, null, 2));
  process.exit(fatalCount > 0 ? 1 : 0);
}

const SHOW = 15;
console.log(`\n📋 インデックス健全性検査: sitemap ${rawLocs.length} URL / out=${DIR}\n`);

for (const [k, list] of Object.entries(fatal)) {
  if (!list.length) continue;
  console.error(`❌ FATAL ${list.length}件 — ${LABEL[k]}`);
  for (const x of list.slice(0, SHOW)) console.error(`     ${x}`);
  if (list.length > SHOW) console.error(`     …他 ${list.length - SHOW}件`);
  console.error("");
}
for (const [k, list] of Object.entries(warn)) {
  if (!list.length) continue;
  console.log(`⚠️  WARN ${list.length}件 — ${WLABEL[k]}`);
  for (const x of list.slice(0, SHOW)) console.log(`     ${x}`);
  if (list.length > SHOW) console.log(`     …他 ${list.length - SHOW}件`);
  console.log("");
}

if (fatalCount === 0) {
  console.log(`✅ FATAL 0件（WARN ${warnCount}件）— sitemap の URL は全て index 可能な状態`);
  console.log(`   ※ GSC の「検出 - 未登録」「クロール済 - 未登録」はクロールバジェットと`);
  console.log(`      コンテンツ品質の問題で、ビルド出力からは判定できない。`);
  process.exit(0);
}
console.error(`❌ FATAL ${fatalCount}件 — このままデプロイすると GSC にインデックスエラーとして出る`);
process.exit(1);
