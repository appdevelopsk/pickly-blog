/**
 * Content audit:
 *  - meta.ts offerIds match offerNotes keys in each locale's messages JSON
 *  - every offerId is mentioned by name (in either en or ja form) in lede/sections/faqs
 *  - flag titles longer than 80 chars in any locale
 *  - flag formulaic phrases ("明確な弱点：", "本比較で唯一", "総評" as heading, etc.)
 *
 * Reads the catalog once to resolve offer ID -> brand+model names.
 * Outputs a TSV-style report and exits non-zero on any error.
 */
import fs from "node:fs";
import path from "node:path";
import { CATALOG } from "../src/lib/affiliates/catalog";
import { listArticles } from "../src/lib/articles/registry";

const ROOT = path.resolve(__dirname, "..");
const ARTICLES_DIR = path.join(ROOT, "src/articles");

const TITLE_LIMIT = 80;
const FORMULAIC_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /明確な弱点：/g, label: "明確な弱点：" },
  { pattern: /本比較で(唯一|最も|最高|最大)/g, label: "本比較で〜系" },
  { pattern: /全製品に弱点あり/g, label: "全製品に弱点あり" },
  { pattern: /^総評$/m, label: "総評 (heading)" },
  { pattern: /いかがでし(た|ょう)/g, label: "いかがでした" },
  { pattern: /In conclusion[,，]/gi, label: "In conclusion," },
  { pattern: /Furthermore[,，]/gi, label: "Furthermore," },
  { pattern: /\bMoreover[,，]/gi, label: "Moreover," },
];

type Issue = { slug: string; locale: string; kind: string; detail: string };
const issues: Issue[] = [];

function readJson(file: string): Record<string, unknown> | null {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function stringifyText(content: unknown): string {
  // Recursively collect all string values from the JSON tree.
  const out: string[] = [];
  function collect(node: unknown): void {
    if (typeof node === "string") {
      out.push(node);
    } else if (Array.isArray(node)) {
      for (const item of node) collect(item);
    } else if (node !== null && typeof node === "object") {
      for (const val of Object.values(node as Record<string, unknown>)) collect(val);
    }
  }
  collect(content);
  return out.join("\n");
}

function hasCJK(s: string): boolean {
  return /[　-鿿豈-﫿가-힯]/.test(s);
}

function extractTokens(name: string): string[] {
  // Split on spaces, hyphens, punctuation, and common Japanese function characters
  const parts = name
    .split(/[\s\-—／/、。.()（）\[\]【】!！用とのでが]+/)
    .filter((t) => (hasCJK(t) ? t.length >= 2 : t.length >= 3));

  // For long CJK-only tokens (no Latin), also generate 3-5 char substrings
  const extra: string[] = [];
  for (const t of parts) {
    if (hasCJK(t) && !/[a-zA-Z]/.test(t) && t.length > 5) {
      for (let len = 3; len <= Math.min(t.length, 5); len++) {
        for (let i = 0; i <= t.length - len; i++) {
          extra.push(t.slice(i, i + len));
        }
      }
    }
  }
  return [...parts, ...extra];
}

const offersById = new Map(CATALOG.map((o) => [o.id, o]));

for (const article of listArticles()) {
  const dir = path.join(ARTICLES_DIR, article.slug, "messages");
  if (!fs.existsSync(dir)) continue;

  const offerIds = article.offerIds;

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".json")) continue;
    const locale = file.replace(/\.json$/, "");
    const content = readJson(path.join(dir, file));
    if (!content) {
      issues.push({ slug: article.slug, locale, kind: "parse-error", detail: file });
      continue;
    }

    // 1) Title length
    const title =
      (content.meta as { title?: string } | undefined)?.title ??
      (typeof content.title === "string" ? content.title : "");
    if (title.length > TITLE_LIMIT) {
      issues.push({
        slug: article.slug,
        locale,
        kind: "long-title",
        detail: `${title.length} chars`,
      });
    }

    // 2) offerNotes keys vs meta.ts offerIds
    const offerNotes = content.offerNotes as Record<string, string> | undefined;
    if (offerNotes) {
      const noteKeys = Object.keys(offerNotes);
      const extra = noteKeys.filter((k) => !offerIds.includes(k));
      const missing = offerIds.filter((k) => !noteKeys.includes(k));
      if (extra.length) {
        issues.push({
          slug: article.slug,
          locale,
          kind: "offerNotes-extra",
          detail: extra.join(","),
        });
      }
      if (missing.length) {
        issues.push({
          slug: article.slug,
          locale,
          kind: "offerNotes-missing",
          detail: missing.join(","),
        });
      }
    }

    // 3) Each offerId should be mentioned by brand+model in the body.
    //    Only enforce on en/ja — other locales may use transliterated brand names.
    //    offer-unmentioned uses fuzzy name matching and is warning-only (not a hard error).
    const body = stringifyText(content);
    if (locale === "en" || locale === "ja") {
      for (const offerId of offerIds) {
        const offer = offersById.get(offerId);
        if (!offer) continue;
        const localeName = (offer.name as Record<string, string>)[locale];
        const enName = (offer.name as Record<string, string>).en;
        const jaName = (offer.name as Record<string, string>).ja;
        const candidates = [localeName, enName, jaName].filter(Boolean) as string[];
        const bodyLower = body.toLowerCase();
        const tokens = candidates.flatMap(extractTokens);
        const found = tokens.some((t) => bodyLower.includes(t.toLowerCase()));
        if (!found) {
          const preview = [...new Set(tokens)].slice(0, 3).join("/");
          issues.push({
            slug: article.slug,
            locale,
            kind: "offer-unmentioned",
            detail: `${offerId} (tried: ${preview})`,
          });
        }
      }
    }

    // 4) Formulaic patterns
    for (const { pattern, label } of FORMULAIC_PATTERNS) {
      const matches = body.match(pattern);
      if (matches && matches.length) {
        issues.push({
          slug: article.slug,
          locale,
          kind: "formulaic",
          detail: `${label} x${matches.length}`,
        });
      }
    }
  }
}

// Group + print
const byKind = new Map<string, Issue[]>();
for (const issue of issues) {
  const list = byKind.get(issue.kind) ?? [];
  list.push(issue);
  byKind.set(issue.kind, list);
}

const ORDER = [
  "parse-error",
  "offerNotes-extra",
  "offerNotes-missing",
  "offer-unmentioned",
  "long-title",
  "formulaic",
];

let totalErrors = 0;
for (const kind of ORDER) {
  const list = byKind.get(kind);
  if (!list) continue;
  console.log(`\n=== ${kind} (${list.length}) ===`);
  for (const i of list) {
    console.log(`  ${i.slug}\t${i.locale}\t${i.detail}`);
  }
  // offerNotes-* are the canonical mismatch signal and gate the build.
  // offer-unmentioned uses fuzzy name matching and is too noisy under
  // transliterated brand names — keep it as a warning only.
  if (kind === "offerNotes-extra" || kind === "offerNotes-missing" || kind === "parse-error") {
    totalErrors += list.length;
  }
}

console.log(`\n${issues.length} total issue(s), ${totalErrors} hard error(s).`);
if (totalErrors > 0) process.exit(1);
