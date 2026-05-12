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

function stringifyText(content: Record<string, unknown>): string {
  // Flatten title / description / lede / sections / faqs into one big searchable string.
  const out: string[] = [];
  const meta = content.meta as { title?: string; description?: string } | undefined;
  if (meta?.title) out.push(meta.title);
  if (meta?.description) out.push(meta.description);
  if (typeof content.title === "string") out.push(content.title);
  if (typeof content.description === "string") out.push(content.description);
  if (typeof content.lede === "string") out.push(content.lede);
  const sections = content.sections as Array<{ heading?: string; paragraphs?: string[] }> | undefined;
  if (Array.isArray(sections)) {
    for (const s of sections) {
      if (s.heading) out.push(s.heading);
      if (Array.isArray(s.paragraphs)) out.push(...s.paragraphs);
    }
  }
  const faqs = content.faqs as Array<{ q?: string; a?: string }> | undefined;
  if (Array.isArray(faqs)) {
    for (const f of faqs) {
      if (f.q) out.push(f.q);
      if (f.a) out.push(f.a);
    }
  }
  return out.join("\n");
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
    const body = stringifyText(content);
    if (locale === "en" || locale === "ja") {
      for (const offerId of offerIds) {
        const offer = offersById.get(offerId);
        if (!offer) continue;
        const localeName = (offer.name as Record<string, string>)[locale];
        const enName = (offer.name as Record<string, string>).en;
        const jaName = (offer.name as Record<string, string>).ja;
        const candidates = [localeName, enName, jaName].filter(Boolean) as string[];
        const tokens = candidates.flatMap((n) =>
          n.split(/[\s\-—／/、,。.()（）]+/).filter((t) => t.length >= 3),
        );
        const found = tokens.some((t) => body.includes(t));
        if (!found) {
          issues.push({
            slug: article.slug,
            locale,
            kind: "offer-unmentioned",
            detail: `${offerId} (tried: ${tokens.slice(0, 3).join("/")})`,
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
