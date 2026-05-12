/**
 * Reads /tmp/img-batch-*-result.tsv files and adds the imageUrl field to
 * matching catalog entries in src/lib/affiliates/catalog.ts.
 *
 * Each result file is TSV: offerId<TAB>imageUrl
 * Skips entries whose catalog block already has an imageUrl.
 * Reports how many entries were modified vs skipped vs not-found.
 *
 * Usage: npx tsx scripts/apply-image-urls.ts [--dry]
 */
import fs from "node:fs";
import path from "node:path";
import { glob } from "node:fs";

const DRY = process.argv.includes("--dry");
const ROOT = path.resolve(__dirname, "..");
const CATALOG = path.join(ROOT, "src/lib/affiliates/catalog.ts");

// Collect all results
type Entry = { offerId: string; imageUrl: string };
const results: Entry[] = [];

const files = fs.readdirSync("/tmp").filter((f) => /^img-batch-\d+-result\.tsv$/.test(f));
for (const f of files) {
  const content = fs.readFileSync(path.join("/tmp", f), "utf8");
  for (const line of content.split("\n")) {
    const parts = line.split("\t");
    if (parts.length >= 2 && parts[0] && parts[1]) {
      results.push({ offerId: parts[0].trim(), imageUrl: parts[1].trim() });
    }
  }
}

console.log(`Loaded ${results.length} candidate imageUrls from ${files.length} batch files`);

let catalogText = fs.readFileSync(CATALOG, "utf8");
let modified = 0;
let alreadyHas = 0;
let notFound = 0;

for (const { offerId, imageUrl } of results) {
  // Find the catalog entry. Look for `    id: "<offerId>",` then check the next
  // few lines for an existing imageUrl. Insert one if missing.
  const idLine = `    id: "${offerId}",`;
  const idIdx = catalogText.indexOf(idLine);
  if (idIdx < 0) {
    notFound++;
    console.log(`! offerId not found in catalog: ${offerId}`);
    continue;
  }

  // Look at the next ~10 lines for existing imageUrl
  const blockStart = idIdx + idLine.length;
  const blockEnd = catalogText.indexOf("\n  },", blockStart);
  const block = catalogText.slice(blockStart, blockEnd);
  if (/^\s+imageUrl:/m.test(block)) {
    alreadyHas++;
    continue;
  }

  // Insert imageUrl line right after id line
  const insertion = `\n    imageUrl: ${JSON.stringify(imageUrl)},`;
  catalogText = catalogText.slice(0, blockStart) + insertion + catalogText.slice(blockStart);
  modified++;
}

if (!DRY) {
  fs.writeFileSync(CATALOG, catalogText, "utf8");
}

console.log(`\nmodified: ${modified}`);
console.log(`already had imageUrl: ${alreadyHas}`);
console.log(`not in catalog: ${notFound}`);
if (DRY) console.log("\n(dry run — catalog.ts not written)");
