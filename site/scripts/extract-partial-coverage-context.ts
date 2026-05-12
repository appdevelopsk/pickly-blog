/**
 * Like extract-zero-coverage-context but for the 196 articles with PARTIAL
 * image coverage. Emits TSV of missing-only offers.
 */
import { CATALOG } from "../src/lib/affiliates/catalog";
import { listArticles } from "../src/lib/articles/registry";

const byId = new Map(CATALOG.map((o) => [o.id, o]));
const printed = new Set<string>();

for (const article of listArticles()) {
  for (const id of article.offerIds) {
    if (printed.has(id)) continue;
    const o = byId.get(id);
    if (!o || o.imageUrl) continue;
    printed.add(id);
    const name = o.name as Record<string, string>;
    const link = o.links.find((l) => l.network === "moshimo") ?? o.links[0];
    console.log(`${id}\t${name.en ?? ""}\t${name.ja ?? ""}\t${o.category}\t${link?.rawUrl ?? ""}`);
  }
}
