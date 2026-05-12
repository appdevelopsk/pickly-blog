/**
 * For each offer ID in /tmp/zero-coverage-ids.txt, emit:
 *   <offerId>\t<en name>\t<ja name>\t<category>\t<sample rakuten search URL>
 * so a sub-agent has enough context to search for a product image without
 * needing to read the catalog itself.
 */
import fs from "node:fs";
import { CATALOG } from "../src/lib/affiliates/catalog";

const ids = fs.readFileSync("/tmp/zero-coverage-ids.txt", "utf8").split("\n").filter(Boolean);
const byId = new Map(CATALOG.map((o) => [o.id, o]));

for (const id of ids) {
  const o = byId.get(id);
  if (!o) {
    console.log(`${id}\t<NOT IN CATALOG>\t\t\t`);
    continue;
  }
  const name = (o.name as Record<string, string>);
  const link = o.links.find((l) => l.network === "moshimo") ?? o.links[0];
  console.log(`${id}\t${name.en ?? ""}\t${name.ja ?? ""}\t${o.category}\t${link?.rawUrl ?? ""}`);
}
