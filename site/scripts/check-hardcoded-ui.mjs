#!/usr/bin/env node
/**
 * UI直書き英語ゲート（ラチェット方式・2026-07-08）。
 *
 * 背景: audit:i18n はメッセージキーの整合だけを検査し、tsxに直書きされたUI英語
 * （t()を経由しない表示文字列）を検出できない。2026-07-07〜08にホーム/フッター/
 * 特殊ページ14種で計200+の直書き英語が全ロケールに露出していた事故の再発防止。
 * （EAリポの check_hardcoded_ja.mjs の逆向き＝英語版）
 *
 * 検出対象:
 *  - JSXテキストノード（ >Text< ）に含まれる「英単語3文字以上を含む表示文字列」
 *  - ユーザー可視の文字列属性: title= / placeholder= / alt= / aria-label=
 * 除外:
 *  - {式} 内（tt("key","English fallback") のフォールバック文字列は正当＝対象外）
 *  - 記号/数字のみ・単一の固有名詞（Pickly等）・許可トークン（RSS/FAQ/OK/NEW/vs等）
 *
 * ラチェット: scripts/hardcoded-ui-baseline.json に「ファイル→文字列リスト」を記録。
 *  - baseline に無い新規の直書き → exit 1（ビルド/validate 失敗）
 *  - 直書きを解消したら --update-baseline で締め直す
 *
 * 使い方:
 *   node scripts/check-hardcoded-ui.mjs                 # 検査（新規があれば exit 1）
 *   node scripts/check-hardcoded-ui.mjs --update-baseline
 *   node scripts/check-hardcoded-ui.mjs --list          # 全検出を表示（baseline含む）
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const SRC_DIRS = [join(ROOT, "src/app"), join(ROOT, "src/components")];
const BASELINE_PATH = join(HERE, "hardcoded-ui-baseline.json");
const UPDATE = process.argv.includes("--update-baseline");
const LIST = process.argv.includes("--list");

// 単独で許可するトークン（大文字略語・慣用・固有名詞・法的定型）
const ALLOW = new Set([
  "RSS", "FAQ", "OK", "NEW", "AI", "URL", "API", "PR", "vs", "VS",
  "Pickly", "Toolify365", "FXEA365", "nattzy", "SK APPS", "YouTube", "Amazon",
  "All rights reserved.", ". All rights reserved.",
]);
// 部分一致で許可（ブランド/ドメイン/技術値）
const ALLOW_RE = /pickly|toolify|fxea365|nattzy|https?:|@|\.com|\.png|\.svg|^\d|^[#$€¥£+\-.,:;·—–|→←&%\s\d()\[\]\/]*$/i;

function englishy(s) {
  if (!/[A-Za-z]{3}/.test(s)) return false;                       // 英単語なし
  if (!/^[\x20-\x7E’‘“”—–·€£¥]+$/.test(s)) return false;          // 非ASCII(=翻訳済み)を含むなら対象外
  const w = s.trim();
  if (ALLOW.has(w)) return false;
  if (ALLOW_RE.test(w)) return false;
  if (/^[A-Z][a-z]+$/.test(w)) return false;                       // 単一固有名詞
  return true;
}

function stripNonDisplay(src) {
  return src
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")   // JSXコメント
    .replace(/\/\*[\s\S]*?\*\//g, "")        // ブロックコメント
    .replace(/^\s*\/\/.*$/gm, "");           // 行コメント
  // 注: {式}は潰さない(単純なファイルで関数本体ごと消える欠陥があった)。
  //     >text< 抽出は式を含むテキストを拾わないため、コード断片ノイズは baseline で吸収する。
}

function scanFile(path) {
  const raw = readFileSync(path, "utf8");
  const src = stripNonDisplay(raw);
  const found = new Set();
  // JSXテキストノード
  for (const m of src.matchAll(/>([^<>{}\n][^<>{}]{2,90})</g)) {
    const s = m[1].replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").trim();
    if (s && englishy(s)) found.add(s);
  }
  // ユーザー可視の文字列属性（生文字列のみ。{式}経由は対象外）
  for (const m of src.matchAll(/\b(title|placeholder|alt|aria-label)="([^"{}]{3,90})"/g)) {
    const s = m[2].trim();
    if (s && englishy(s)) found.add(`[${m[1]}] ${s}`);
  }
  return [...found];
}

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".tsx")) out.push(p);
  }
  return out;
}

const findings = {};
let total = 0;
for (const d of SRC_DIRS) {
  for (const f of walk(d)) {
    const hits = scanFile(f);
    if (hits.length) {
      findings[relative(ROOT, f)] = hits.sort();
      total += hits.length;
    }
  }
}

if (UPDATE) {
  writeFileSync(BASELINE_PATH, JSON.stringify(findings, null, 1) + "\n");
  console.log(`baseline更新: ${Object.keys(findings).length}ファイル / ${total}文字列 → ${BASELINE_PATH}`);
  process.exit(0);
}

const baseline = existsSync(BASELINE_PATH) ? JSON.parse(readFileSync(BASELINE_PATH, "utf8")) : {};
const newOnes = [];
for (const [file, hits] of Object.entries(findings)) {
  const known = new Set(baseline[file] ?? []);
  for (const h of hits) if (!known.has(h)) newOnes.push({ file, s: h });
}

if (LIST) {
  for (const [file, hits] of Object.entries(findings)) {
    console.log(file);
    for (const h of hits) console.log("   ", h);
  }
  console.log(`計: ${Object.keys(findings).length}ファイル / ${total}文字列`);
}

if (newOnes.length) {
  console.error(`\n✗ 新規のUI直書き英語 ${newOnes.length}件（i18nキー化するか、意図的なら --update-baseline）:`);
  for (const { file, s } of newOnes.slice(0, 30)) console.error(`  ${file}: "${s}"`);
  console.error(`\n対処: t()/tt("key","fallback") でキー化して 17ロケールへ翻訳を追加。`);
  process.exit(1);
}
console.log(`✓ hardcoded-ui: 新規の直書き英語なし（baseline ${Object.keys(baseline).length}ファイル/${Object.values(baseline).flat().length}件は既知）`);
