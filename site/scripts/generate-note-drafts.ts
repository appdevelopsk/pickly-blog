/**
 * Generate note.com draft articles for all pickly.blog articles.
 *
 * Reads each article's meta.ts and messages/ja.json to produce
 * an 800-1200 char note.com-style Japanese draft saved to note-drafts/<slug>.md
 *
 * Usage: cd site && npx tsx scripts/generate-note-drafts.ts
 */
import fs from "node:fs";
import path from "node:path";

const ARTICLES_DIR = path.resolve(__dirname, "../src/articles");
const OUT_DIR = path.resolve(__dirname, "../note-drafts");
const SITE_BASE = "https://pickly.blog";

// Category → hashtag mapping
const CATEGORY_HASHTAGS: Record<string, string> = {
  fitness: "#フィットネス",
  food: "#料理 #食",
  tech: "#テック #ガジェット",
  home: "#インテリア #生活",
  beauty: "#美容",
  travel: "#旅行",
};

interface Product {
  offerId: string;
  badge?: string;
  review?: string;
  pros?: string[];
  cons?: string[];
  grade?: string;
}

interface RecommendedFor {
  label: string;
  offerId?: string;
  reason: string;
}

interface JaJson {
  // title can be at top level or nested under meta
  title?: string;
  description?: string;
  meta?: {
    title?: string;
    description?: string;
  };
  lede?: string;
  products?: Product[];
  recommendedFor?: RecommendedFor[];
}

function readMetaCategory(slug: string): string {
  const metaPath = path.join(ARTICLES_DIR, slug, "meta.ts");
  if (!fs.existsSync(metaPath)) return "home";
  const content = fs.readFileSync(metaPath, "utf-8");
  const m = content.match(/category:\s*["']([^"']+)["']/);
  return m ? m[1] : "home";
}

function readJaJson(slug: string): JaJson | null {
  const jaPath = path.join(ARTICLES_DIR, slug, "messages", "ja.json");
  if (!fs.existsSync(jaPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(jaPath, "utf-8")) as JaJson;
  } catch {
    return null;
  }
}

function getTitle(data: JaJson): string {
  return data.title ?? data.meta?.title ?? "";
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1) + "…";
}

function generateDraft(slug: string, category: string, data: JaJson): string {
  const title = getTitle(data);
  const lede = data.lede ?? "";
  const products = data.products ?? [];
  const recommendedFor = data.recommendedFor ?? [];

  const articleUrl = `${SITE_BASE}/ja/articles/${slug}/`;
  const categoryHashtag = CATEGORY_HASHTAGS[category] ?? "#おすすめ";

  const lines: string[] = [];

  // Title
  lines.push(`# ${title}`);
  lines.push("");

  // Hook: first 1-2 sentences from lede
  if (lede) {
    // Take up to 2 sentences
    const sentences = lede.match(/[^。！？]+[。！？]/g) ?? [lede];
    const hook = sentences.slice(0, 2).join("").trim();
    lines.push(truncate(hook, 200));
    lines.push("");
  }

  // Top pick section (only if products exist)
  if (products.length > 0) {
    const topProduct = products[0];
    const badgeLabel = topProduct.badge ?? "総合1位";
    // Get product name from the badge/offerId — use offerId as fallback display
    // Try to extract a clean product name from sections title if possible,
    // otherwise use badge + offerId
    const productDisplay = topProduct.offerId
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    lines.push("## 結論から言うと");
    lines.push("");

    // Build reason from pros[0] if available
    if (topProduct.pros && topProduct.pros.length > 0) {
      const reason = truncate(topProduct.pros[0], 40);
      lines.push(`**${badgeLabel}**: ${truncate(productDisplay, 50)} が総合1位。${reason}`);
    } else {
      lines.push(`**${badgeLabel}**: ${truncate(productDisplay, 50)} が総合1位。`);
    }
    lines.push("");

    // Why we chose it
    if (topProduct.pros && topProduct.pros.length > 0) {
      lines.push("## なぜこれを選んだか");
      lines.push("");
      const prosToShow = topProduct.pros.slice(0, 3);
      for (const pro of prosToShow) {
        lines.push(`- ${truncate(pro, 40)}`);
      }
      lines.push("");
    }
  }

  // Recommended for section (only if data exists)
  if (recommendedFor.length > 0) {
    lines.push("## こんな人に向いている");
    lines.push("");
    const recs = recommendedFor.slice(0, 2);
    for (const rec of recs) {
      const label = truncate(rec.label, 25);
      const reason = truncate(rec.reason, 40);
      lines.push(`**${label}**: ${reason}`);
    }
    lines.push("");
  }

  // CTA
  lines.push("## 詳しい比較レビューはこちら");
  lines.push("");
  lines.push(
    `${articleUrl} で5製品の詳細スペック・スコア・採点基準を公開しています。`
  );
  lines.push("");

  // Hashtags
  lines.push(`${categoryHashtag} #おすすめ #比較 #レビュー2026`);

  return lines.join("\n");
}

function main() {
  // Create output directory
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    console.log(`Created directory: ${OUT_DIR}`);
  }

  const slugs = fs
    .readdirSync(ARTICLES_DIR)
    .filter((name) => {
      const p = path.join(ARTICLES_DIR, name);
      return fs.statSync(p).isDirectory();
    })
    .sort();

  let generated = 0;
  let skipped = 0;

  for (const slug of slugs) {
    const data = readJaJson(slug);
    if (!data) {
      console.warn(`  SKIP ${slug}: no ja.json`);
      skipped++;
      continue;
    }

    const title = getTitle(data);
    if (!title) {
      console.warn(`  SKIP ${slug}: no title found`);
      skipped++;
      continue;
    }

    const category = readMetaCategory(slug);
    const draft = generateDraft(slug, category, data);
    const outPath = path.join(OUT_DIR, `${slug}.md`);
    fs.writeFileSync(outPath, draft, "utf-8");

    const charCount = draft.length;
    console.log(`  OK ${slug} (${charCount} chars)`);
    generated++;
  }

  console.log("");
  console.log(`Done. Generated: ${generated}, Skipped: ${skipped}`);
  console.log(`Output directory: ${OUT_DIR}`);
}

main();
