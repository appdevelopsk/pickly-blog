/**
 * Browser-based image validation using Playwright.
 * Visits live article pages on pickly.blog and detects broken <img> tags
 * (img.naturalWidth === 0 after load, or img.complete === false).
 *
 * Usage:
 *   cd site && npx tsx scripts/visual-check-images.ts              # all articles
 *   cd site && npx tsx scripts/visual-check-images.ts --limit=20   # first 20
 *   cd site && npx tsx scripts/visual-check-images.ts --locale=en  # en only
 */
import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";
const ARTICLES_DIR = path.resolve(__dirname, "../src/articles");
const CONCURRENCY = 4;
const TIMEOUT_MS = 20_000;
const LOCALE = process.argv.find(a => a.startsWith("--locale="))?.split("=")[1] ?? "en";
const limitArg = process.argv.find(a => a.startsWith("--limit="));
const LIMIT = limitArg ? parseInt(limitArg.split("=")[1], 10) : Infinity;

interface BrokenImage { slug: string; locale: string; src: string; alt: string }

async function checkPage(
  page: import("playwright").Page,
  slug: string,
  locale: string,
): Promise<BrokenImage[]> {
  const url = `${SITE_URL}/${locale}/articles/${slug}/`;
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: TIMEOUT_MS });
    // Wait a bit for lazy-loaded images
    await page.waitForTimeout(2000);

    const broken = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll("img"));
      return imgs
        .filter(img => img.complete && img.naturalWidth === 0 && img.src && !img.src.startsWith("data:"))
        .map(img => ({ src: img.src, alt: img.alt ?? "" }));
    });

    return broken.map(b => ({ slug, locale, src: b.src, alt: b.alt }));
  } catch (e) {
    console.error(`  ✗ timeout/error: ${url}`);
    return [];
  }
}

async function main() {
  // Collect article slugs
  const slugs = fs.readdirSync(ARTICLES_DIR)
    .filter(d => fs.statSync(path.join(ARTICLES_DIR, d)).isDirectory())
    .slice(0, LIMIT);

  console.log(`\nPickly — visual image check (Playwright/Chromium)`);
  console.log(`Site    : ${SITE_URL}`);
  console.log(`Locale  : ${LOCALE}`);
  console.log(`Articles: ${slugs.length}`);
  console.log(`Checking article pages...\n`);

  const browser = await chromium.launch({ headless: true });
  const allBroken: BrokenImage[] = [];
  let done = 0;

  // Process in batches of CONCURRENCY
  for (let i = 0; i < slugs.length; i += CONCURRENCY) {
    const batch = slugs.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(async (slug) => {
        const ctx = await browser.newContext({
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        });
        const page = await ctx.newPage();
        const broken = await checkPage(page, slug, LOCALE);
        await ctx.close();
        done++;
        if (done % 10 === 0 || done === slugs.length) {
          process.stdout.write(`\r  [${done}/${slugs.length}] pages checked...`);
        }
        return broken;
      })
    );
    allBroken.push(...results.flat());
  }

  await browser.close();
  process.stdout.write("\n\n");

  // Report
  if (allBroken.length === 0) {
    console.log("✓ No broken images found!");
    return;
  }

  console.log(`✗ ${allBroken.length} broken images found:\n`);

  // Group by src (same URL broken across multiple pages)
  const bySrc = new Map<string, string[]>();
  for (const b of allBroken) {
    const key = b.src;
    if (!bySrc.has(key)) bySrc.set(key, []);
    bySrc.get(key)!.push(b.slug);
  }

  for (const [src, slugList] of bySrc) {
    console.log(`  ${src.slice(0, 90)}`);
    console.log(`    → ${slugList.join(", ")}`);
  }

  // Save JSON report for downstream processing
  const reportPath = "/tmp/visual-broken-images.json";
  fs.writeFileSync(reportPath, JSON.stringify(allBroken, null, 2));
  console.log(`\nReport saved to ${reportPath}`);
  console.log(`\nNext: run fix-visual-broken-images.ts to replace these URLs`);
}

main().catch(e => { console.error(e); process.exit(1); });
