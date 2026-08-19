/**
 * i18n audit: ensure every active locale has the same key shape as en.json,
 * both in /src/messages/<locale>.json and in each /src/articles/<slug>/messages/<locale>.json.
 */
import fs from "node:fs";
import path from "node:path";
import { LOCALES, DEFAULT_LOCALE } from "../src/lib/i18n/locales";
import { listArticles } from "../src/lib/articles/registry";

const ROOT = path.resolve(__dirname, "..");

function readJson(file: string): Record<string, unknown> | null {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function flatKeys(obj: unknown, prefix = ""): string[] {
  if (obj === null || typeof obj !== "object") return [prefix];
  if (Array.isArray(obj)) return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    flatKeys(v, prefix ? `${prefix}.${k}` : k),
  );
}

let errors = 0;

/** loader.ts の BODY_KEYS と同じ。欠けると記事が stub 送りになるキー。 */
const BODY_KEYS = ["sections", "products", "faqs"];
const missingBodyHits: string[] = [];
/** ロケールファイルが存在しない = 同じく stub 送り。落とさず可視化のみ(理由は audit() 内)。 */
const missingFileHits: string[] = [];
/** 既存 backlog は数千件あるので即エラーにはできない。増えたときだけ落とすラチェット。 */
const BASELINE_PATH = path.join(ROOT, "scripts/i18n-stub-baseline.json");

function audit(label: string, baseFile: string, otherFile: string) {
  const base = readJson(baseFile);
  const other = readJson(otherFile);
  if (!base) {
    console.error(`✗ ${label}: missing base file ${baseFile}`);
    errors++;
    return;
  }
  if (!other) {
    // ★2026-08-19: ここには "falls back to English at runtime" と書いてあったが、
    //   記事メッセージについてはこれも誤り。loader.ts の isArticleBodyTranslated() は
    //   `if (!msg?.title) return false` なので、ファイルごと無い場合も BODY_KEYS 欠落と
    //   同じく stub 送りになる(そのロケールでは実質存在しない)。
    //   ただしこれは「まだ翻訳していない」正常状態でもあり、sitemap/feed も
    //   isArticleBodyTranslated で除外するため英語本文が index される害は無い。
    //   新記事を足すたびに CI が赤くなるのは不適切なので、落とさず件数だけ可視化する。
    missingFileHits.push(label);
    return;
  }
  const baseKeys = new Set(flatKeys(base));
  const otherKeys = new Set(flatKeys(other));
  // Extra keys (in locale but not in en.json) = stale translations that can't merge cleanly.
  const extra = [...otherKeys].filter((k) => !baseKeys.has(k));
  if (extra.length) {
    console.error(`✗ ${label}`);
    console.error(`  extra:   ${extra.join(", ")}`);
    errors++;
  }
  // ★2026-08-17: ここには "Missing keys = OK — runtime falls back to English" と
  //   書いてあったが、記事メッセージについてはこの前提が成り立たない。page.tsx は
  //   そのロケールのファイルしか読まないので en へのフォールバックは存在せず、
  //   BODY_KEYS(sections/products/faqs) が1つでも欠けると isArticleBodyTranslated() が
  //   false になり、記事ごと /en/ への meta-refresh stub として出力される。
  //   欠落キーを実際に見ていながら「問題なし」と判定していたのがこの事故の再発点。
  const missingBody = BODY_KEYS.filter((k) => baseKeys.has(k) && !otherKeys.has(k));
  if (missingBody.length) missingBodyHits.push(`${label}: ${missingBody.join(", ")}`);
}

// 1) common messages
const commonBase = path.join(ROOT, "src/messages", `${DEFAULT_LOCALE}.json`);
for (const locale of LOCALES) {
  if (locale === DEFAULT_LOCALE) continue;
  audit(
    `messages/${locale}.json`,
    commonBase,
    path.join(ROOT, "src/messages", `${locale}.json`),
  );
}

// 2) per-article messages — articleの locales array で限定
const articles = listArticles();
const articlesDir = path.join(ROOT, "src/articles");
for (const article of articles) {
  const dir = path.join(articlesDir, article.slug, "messages");
  if (!fs.existsSync(dir)) continue;
  const base = path.join(dir, `${DEFAULT_LOCALE}.json`);
  // article で許可された locale のみチェック
  for (const locale of article.locales) {
    if (locale === DEFAULT_LOCALE) continue;
    audit(`articles/${article.slug}/messages/${locale}.json`, base, path.join(dir, `${locale}.json`));
  }
}

// 3) BODY_KEYS 欠落 = stub 送りになる記事。増加したときだけ落とす。
const baseline = (readJson(BASELINE_PATH) ?? {}) as { count?: number };
const prev = typeof baseline.count === "number" ? baseline.count : Infinity;
if (process.argv.includes("--update-baseline")) {
  fs.writeFileSync(BASELINE_PATH, JSON.stringify({ count: missingBodyHits.length }, null, 2) + "\n");
  console.log(`baseline を ${missingBodyHits.length} で更新しました。`);
} else if (missingBodyHits.length > prev) {
  console.error(
    `\n✗ BODY_KEYS 欠落で stub 落ちする記事が ${prev} → ${missingBodyHits.length} に増えました。` +
      `\n  en.json にキーを足したなら、他ロケールにも展開してください:` +
      `\n    npx tsx scripts/fill-translations.ts --locale <loc> --fill-keys` +
      `\n  そのキーが欠けてもページが成立するなら loader.ts の BODY_KEYS から外してください。`,
  );
  for (const h of missingBodyHits.slice(0, 20)) console.error(`  ${h}`);
  if (missingBodyHits.length > 20) console.error(`  ... 他 ${missingBodyHits.length - 20}件`);
  errors++;
} else {
  console.log(`stub 落ち: ${missingBodyHits.length} 件 (baseline ${prev})`);
}

// 3.5) ファイル自体が無いロケール = 未翻訳。ゲートはしないが、黙って増えるのを防ぐため常に表示。
if (missingFileHits.length) {
  const byLocale = new Map<string, number>();
  for (const h of missingFileHits) {
    const loc = h.slice(h.lastIndexOf("/") + 1).replace(/\.json$/, "");
    byLocale.set(loc, (byLocale.get(loc) ?? 0) + 1);
  }
  const top = [...byLocale.entries()].sort((a, b) => b[1] - a[1]).map(([l, n]) => `${l} ${n}`);
  console.log(`未翻訳(ファイル未作成): ${missingFileHits.length} 件 — ${top.join(" / ")}`);
  console.log(`  埋めるなら: npx tsx scripts/fill-translations.ts --locale <loc>`);
}

if (errors > 0) {
  console.error(`\n${errors} i18n issue(s) found.`);
  process.exit(1);
}
console.log("i18n OK");
