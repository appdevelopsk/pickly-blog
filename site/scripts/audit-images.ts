/**
 * Mandatory catalog quality audit — fails the build if:
 *   - any offer is missing imageUrl
 *   - any offer is missing description.en
 *
 * Run via: npm run audit:images
 * Also called by: npm run validate
 */
import { CATALOG } from "../src/lib/affiliates/catalog";
import { listArticles } from "../src/lib/articles/registry";

const FAIL_ON_MISSING = process.env.CI === "true";  // hard-fail in CI; warn locally

const byId = new Map(CATALOG.map((o) => [o.id, o]));
let errors = 0;
let warnings = 0;

// ── 1. Catalog-level checks (every offer must have image + description) ────────
const missingImage: string[] = [];
const missingDesc: string[] = [];

for (const offer of CATALOG) {
  if (!offer.imageUrl) missingImage.push(offer.id);
  const desc = (offer.description as Record<string, string>);
  if (!desc?.en) missingDesc.push(offer.id);
}

if (missingImage.length) {
  console.error(`\n✗ ${missingImage.length} offer(s) missing imageUrl:`);
  missingImage.slice(0, 20).forEach((id) => console.error(`    ${id}`));
  if (missingImage.length > 20) console.error(`    ... and ${missingImage.length - 20} more`);
  errors += missingImage.length;
}

if (missingDesc.length) {
  console.error(`\n✗ ${missingDesc.length} offer(s) missing description.en:`);
  missingDesc.slice(0, 20).forEach((id) => console.error(`    ${id}`));
  if (missingDesc.length > 20) console.error(`    ... and ${missingDesc.length - 20} more`);
  errors += missingDesc.length;
}

// ── 2. Article coverage report ─────────────────────────────────────────────────
type Row = { slug: string; total: number; missing: string[] };
const rows: Row[] = [];

for (const article of listArticles()) {
  const total = article.offerIds.length;
  const missing: string[] = [];
  for (const id of article.offerIds) {
    const offer = byId.get(id);
    if (!offer) continue;
    if (!offer.imageUrl) missing.push(id);
  }
  rows.push({ slug: article.slug, total, missing });
}

const fullyMissing = rows.filter((r) => r.missing.length === r.total);
const partial = rows.filter((r) => r.missing.length > 0 && r.missing.length < r.total);
const full = rows.filter((r) => r.missing.length === 0);

console.log(`\nArticle image coverage:`);
console.log(`  ✓ All images present : ${full.length}/${rows.length}`);
if (partial.length)      console.log(`  ⚠ Partial coverage   : ${partial.length}`);
if (fullyMissing.length) console.log(`  ✗ Zero coverage      : ${fullyMissing.length}`);

if (fullyMissing.length) {
  warnings += fullyMissing.length;
  console.warn(`\n⚠ Articles with NO product images (${fullyMissing.length}):`);
  for (const r of fullyMissing.slice(0, 10)) {
    console.warn(`    ${r.slug}  [${r.missing.join(", ")}]`);
  }
}

// ── Exit code ──────────────────────────────────────────────────────────────────
if (errors > 0) {
  // ローカルでは exit 0 で返す(FAIL_ON_MISSING は CI のみ)。
  // 「FAILED」と出しながら validate 側が ✓ を付けるのは読み手を欺くので、
  // どちらの意味なのかを行そのものに書く。
  console.error(
    FAIL_ON_MISSING
      ? `\n✗ audit:images FAILED — ${errors} error(s), ${warnings} warning(s)`
      : `\n⚠ audit:images — ${errors} error(s), ${warnings} warning(s) (ローカルは非致命。CI=true では失敗する)`
  );
  console.error(`  Run: npm run images:fetch   to fill missing imageUrls`);
  if (FAIL_ON_MISSING) process.exit(1);
} else if (warnings > 0) {
  console.warn(`\n⚠ audit:images passed with ${warnings} warning(s)`);
} else {
  console.log(`\n✓ audit:images passed — all offers have imageUrl + description.en`);
}
