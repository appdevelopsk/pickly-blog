/**
 * Affiliate catalog audit:
 *  - every offerId referenced by an article exists in catalog
 *  - every offer has at least 1 link
 *  - every link.network is a known ASP
 *  - warn on offers with 0 approved links (they will all show "pending")
 */
import { CATALOG } from "../src/lib/affiliates/catalog";
import { listArticles } from "../src/lib/articles/registry";
import type { AspNetwork } from "../src/lib/affiliates/types";

const KNOWN_NETWORKS: AspNetwork[] = [
  "amazon-jp", "amazon-us", "amazon-uk", "amazon-de", "amazon-ca",
  "amazon-fr", "amazon-es", "amazon-it", "amazon-au", "amazon-in",
  "a8", "moshimo", "valuecommerce", "rakuten-affiliate",
  "shareasale", "cj", "impact", "awin", "direct",
];

let errors = 0;
let warnings = 0;

for (const offer of CATALOG) {
  if (offer.links.length === 0) {
    console.error(`✗ offer ${offer.id} has no links`);
    errors++;
    continue;
  }
  for (const link of offer.links) {
    if (!KNOWN_NETWORKS.includes(link.network)) {
      console.error(`✗ offer ${offer.id}: unknown network "${link.network}"`);
      errors++;
    }
  }
  const approved = offer.links.filter((l) => l.approved).length;
  if (approved === 0) {
    console.warn(`⚠ offer ${offer.id}: 0 approved links — UI will show "pending"`);
    warnings++;
  }
}

const offerIds = new Set(CATALOG.map((o) => o.id));
for (const article of listArticles()) {
  for (const id of article.offerIds) {
    if (!offerIds.has(id)) {
      console.error(`✗ article ${article.slug}: references unknown offerId "${id}"`);
      errors++;
    }
  }
}

if (errors > 0) {
  console.error(`\n${errors} affiliate error(s), ${warnings} warning(s).`);
  process.exit(1);
}
if (warnings > 0) {
  console.log(`affiliate OK (${warnings} warnings)`);
} else {
  console.log("affiliate OK");
}
