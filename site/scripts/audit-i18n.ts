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

function audit(label: string, baseFile: string, otherFile: string) {
  const base = readJson(baseFile);
  const other = readJson(otherFile);
  if (!base) {
    console.error(`✗ ${label}: missing base file ${baseFile}`);
    errors++;
    return;
  }
  if (!other) {
    console.error(`✗ ${label}: missing ${otherFile}`);
    errors++;
    return;
  }
  const baseKeys = new Set(flatKeys(base));
  const otherKeys = new Set(flatKeys(other));
  const missing = [...baseKeys].filter((k) => !otherKeys.has(k));
  const extra = [...otherKeys].filter((k) => !baseKeys.has(k));
  if (missing.length || extra.length) {
    console.error(`✗ ${label}`);
    if (missing.length) console.error(`  missing: ${missing.join(", ")}`);
    if (extra.length) console.error(`  extra:   ${extra.join(", ")}`);
    errors++;
  }
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

if (errors > 0) {
  console.error(`\n${errors} i18n issue(s) found.`);
  process.exit(1);
}
console.log("i18n OK");
