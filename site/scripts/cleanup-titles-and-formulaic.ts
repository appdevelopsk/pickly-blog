/**
 * Mechanical cleanup for the patterns the user wants gone, applied across all locales:
 *
 *   1. Shorten over-long titles (>80 chars) by cutting at the first " — " / " — " / "—"
 *      separator. If the prefix is still >80 chars, also try at the first ":" / "：".
 *      If still too long, leave it for an LLM rewrite (logged at the end).
 *
 *   2. Strip "明確な弱点：" / "Explicit weakness:" sentence-prefix labels — the
 *      weakness sentence that follows stays, just without the formulaic prefix.
 *
 *   3. Delete trailing "全製品に弱点あり" / "全製品に明確な弱点あり" / "explicit weakness on every
 *      product" tagline fragments from titles and descriptions.
 *
 *   4. Remove "本比較で唯一" / "本比較で最も" leaning when it appears more than once
 *      per article (keep the first occurrence — strip the rest).
 *
 * The script does NOT delete "総評" sections (those need editorial judgment to
 * either delete or replace). It only flags them for review.
 *
 * Run: npx tsx scripts/cleanup-titles-and-formulaic.ts [--dry]
 */
import fs from "node:fs";
import path from "node:path";
import { listArticles } from "../src/lib/articles/registry";

const DRY = process.argv.includes("--dry");
const ROOT = path.resolve(__dirname, "..");
const ARTICLES_DIR = path.join(ROOT, "src/articles");
const TITLE_LIMIT = 80;

const TITLE_SEPARATORS = [" — ", " – ", " — ", "—", "–"];
const FALLBACK_SEPARATORS = [": ", "：", " : "];
const STRIP_FRAGMENTS = [
  /[、,。.]\s*全製品に(明確な|明示的)?弱点あり。?/g,
  /[、,]\s*全製品に明示的弱点付きで/g,
  /[,;.]\s*explicit weakness on every product\.?/gi,
  /[,;.]\s*explicit weakness on every pick\.?/gi,
  /[,;.]\s*with an explicit weakness on every pick\.?/gi,
  /[,;.]\s*Every (product|pick) has a weakness\.?/gi,
];

type Stat = {
  shortened: number;
  fragmentsStripped: number;
  weaknessLabelsStripped: number;
  ruleClause: number;
  stillLong: string[];
  hasSouhyou: string[];
};
const stat: Stat = {
  shortened: 0,
  fragmentsStripped: 0,
  weaknessLabelsStripped: 0,
  ruleClause: 0,
  stillLong: [],
  hasSouhyou: [],
};

function shortenTitle(title: string): string {
  let t = title;
  for (const frag of STRIP_FRAGMENTS) {
    const before = t;
    t = t.replace(frag, "");
    if (t !== before) stat.fragmentsStripped++;
  }
  if (t.length <= TITLE_LIMIT) return t;

  // try em-dash separators first — preserves the editorial headline
  for (const sep of TITLE_SEPARATORS) {
    const idx = t.indexOf(sep);
    if (idx > 0 && idx <= TITLE_LIMIT) {
      return t.slice(0, idx).trim();
    }
  }
  // fall back to colon separators only if em-dash failed
  for (const sep of FALLBACK_SEPARATORS) {
    const idx = t.indexOf(sep);
    if (idx > 0 && idx <= TITLE_LIMIT) {
      return t.slice(0, idx + sep.length - 1).trim();
    }
  }
  return t; // unchanged — needs manual / LLM rewrite
}

function stripWeaknessLabels(text: string): { out: string; n: number } {
  let n = 0;
  const out = text
    .replace(/明確な弱点：\s*/g, () => {
      n++;
      return "";
    })
    .replace(/Explicit weakness:\s*/gi, () => {
      n++;
      return "";
    });
  return { out, n };
}

function stripRedundantRuleClauses(text: string): { out: string; n: number } {
  // Keep the first occurrence of 本比較で唯一/最も/最大/最高 per article. Strip later ones.
  let n = 0;
  const pattern = /本比較で(唯一|最も|最大|最高)/g;
  let firstSeen = false;
  const out = text.replace(pattern, (m) => {
    if (!firstSeen) {
      firstSeen = true;
      return m;
    }
    n++;
    return "";
  });
  return { out, n };
}

function deepWalk(value: unknown, fn: (s: string) => string): unknown {
  if (typeof value === "string") return fn(value);
  if (Array.isArray(value)) return value.map((v) => deepWalk(v, fn));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = deepWalk(v, fn);
    }
    return out;
  }
  return value;
}

function flagSouhyou(slug: string, locale: string, content: unknown) {
  // Look for sections whose heading is exactly 総評 or "Conclusion" or "In summary".
  const sections = (content as { sections?: Array<{ heading?: string }> })?.sections;
  if (!Array.isArray(sections)) return;
  for (const s of sections) {
    const h = (s.heading ?? "").trim();
    if (/^(総評|Conclusion|Summary|In summary|Final thoughts|Final verdict|Bottom line)$/i.test(h)) {
      stat.hasSouhyou.push(`${slug}\t${locale}\t"${h}"`);
    }
  }
}

for (const article of listArticles()) {
  const dir = path.join(ARTICLES_DIR, article.slug, "messages");
  if (!fs.existsSync(dir)) continue;

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".json")) continue;
    const locale = file.replace(/\.json$/, "");
    const filePath = path.join(dir, file);
    const raw = fs.readFileSync(filePath, "utf8");
    let content: Record<string, unknown>;
    try {
      content = JSON.parse(raw);
    } catch {
      continue;
    }

    // Title
    const meta = content.meta as { title?: string } | undefined;
    const originalTitle = meta?.title ?? (typeof content.title === "string" ? content.title : "");
    if (originalTitle) {
      const newTitle = shortenTitle(originalTitle);
      if (newTitle !== originalTitle) {
        if (newTitle.length > TITLE_LIMIT) {
          stat.stillLong.push(`${article.slug}\t${locale}\t${newTitle.length}\t${newTitle}`);
        } else {
          stat.shortened++;
        }
        if (meta) meta.title = newTitle;
        if (typeof content.title === "string") content.title = newTitle;
      } else if (originalTitle.length > TITLE_LIMIT) {
        stat.stillLong.push(`${article.slug}\t${locale}\t${originalTitle.length}\t${originalTitle}`);
      }
    }

    // Description — strip fragments only
    const desc = (content.meta as { description?: string } | undefined)?.description;
    if (desc) {
      let d = desc;
      for (const frag of STRIP_FRAGMENTS) d = d.replace(frag, "");
      if (d !== desc) {
        (content.meta as { description?: string }).description = d.trim();
        stat.fragmentsStripped++;
      }
    }

    // Recurse through body to strip weakness labels and trim rule-clause repetition
    let weaknessCount = 0;
    let ruleCount = 0;
    content = deepWalk(content, (s) => {
      const { out: s1, n: n1 } = stripWeaknessLabels(s);
      weaknessCount += n1;
      const { out: s2, n: n2 } = stripRedundantRuleClauses(s1);
      ruleCount += n2;
      // strip trailing fragments
      let s3 = s2;
      for (const frag of STRIP_FRAGMENTS) s3 = s3.replace(frag, "");
      return s3;
    }) as Record<string, unknown>;
    stat.weaknessLabelsStripped += weaknessCount;
    stat.ruleClause += ruleCount;

    flagSouhyou(article.slug, locale, content);

    if (!DRY) {
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + "\n", "utf8");
    }
  }
}

console.log(`Shortened titles: ${stat.shortened}`);
console.log(`Trailing fragments stripped: ${stat.fragmentsStripped}`);
console.log(`"明確な弱点：" / "Explicit weakness:" labels removed: ${stat.weaknessLabelsStripped}`);
console.log(`Duplicate "本比較で〜" clauses removed: ${stat.ruleClause}`);
console.log(`\nTitles still > ${TITLE_LIMIT} chars (need editorial rewrite): ${stat.stillLong.length}`);
for (const l of stat.stillLong.slice(0, 30)) console.log("  " + l);
if (stat.stillLong.length > 30) console.log(`  ... ${stat.stillLong.length - 30} more`);

console.log(`\n総評/Conclusion-style section headings (need editorial review): ${stat.hasSouhyou.length}`);
for (const l of stat.hasSouhyou.slice(0, 30)) console.log("  " + l);
if (stat.hasSouhyou.length > 30) console.log(`  ... ${stat.hasSouhyou.length - 30} more`);
