/**
 * Image coverage audit: for each article, report how many of its offers
 * are missing an imageUrl in the catalog. Output is grouped so we can fix
 * the worst-covered articles first.
 */
import { CATALOG } from "../src/lib/affiliates/catalog";
import { listArticles } from "../src/lib/articles/registry";

const byId = new Map(CATALOG.map((o) => [o.id, o]));

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

console.log(`Articles with all images present: ${full.length}/${rows.length}`);
console.log(`Articles with some images missing: ${partial.length}`);
console.log(`Articles with NO product images: ${fullyMissing.length}`);

if (fullyMissing.length) {
  console.log(`\n=== ZERO COVERAGE (all ${"" + fullyMissing[0]?.total} offers missing imageUrl) ===`);
  for (const r of fullyMissing) {
    console.log(`  ${r.slug}\t${r.missing.length}/${r.total}\t${r.missing.join(", ")}`);
  }
}
if (partial.length) {
  console.log(`\n=== PARTIAL COVERAGE ===`);
  // sort by gap size, worst first
  partial.sort((a, b) => b.missing.length - a.missing.length);
  for (const r of partial) {
    console.log(`  ${r.slug}\t${r.missing.length}/${r.total}\t${r.missing.join(", ")}`);
  }
}
