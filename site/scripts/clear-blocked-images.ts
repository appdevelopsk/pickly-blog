/**
 * Scan catalog-additions.ts for image URLs that block hotlinking from pickly.blog,
 * then clear them so fetch-product-images.ts can re-fill with better sources.
 *
 * Usage:
 *   cd site && npx tsx scripts/clear-blocked-images.ts            # dry run
 *   cd site && DRY_RUN=0 npx tsx scripts/clear-blocked-images.ts  # write changes
 */

import fs from "node:fs";
import path from "node:path";

const CATALOG_PATH = path.resolve(__dirname, "../src/lib/affiliates/catalog-additions.ts");
const DRY_RUN = process.env.DRY_RUN !== "0";
const CONCURRENCY = 12;
const REFERER = "https://pickly.blog/";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36";

// Domains known to block hotlinking (don't even bother HEAD-testing them)
const INSTA_BLOCK = new Set([
  "lsco.scene7.com", "target.scene7.com", "academy.scene7.com", "dks.scene7.com",
  "athleta.scene7.com", "hrbent.scene7.com", "lakelandcamel.scene7.com",
  "s7d1.scene7.com", "totousa.scene7.com", "akamai-scene7.frontgate.com",
  "www.ugg.com", "ugg.com", "www.stevemadden.com",
  "images.songmics.com", "img.cupshe.com", "hips.hearstapps.com",
  "assets.thenorthface.eu", "assets.hermes.com",
  "bananarepublic.gap.com", "athleta.gap.com",
  "slimages.macysassets.com", "assets.wsimgs.com", "assets.wfcdn.com", "assets.weimgs.com",
  "down-my.img.susercontent.com", "down-id.img.susercontent.com",
  "down-ph.img.susercontent.com", "down-th.img.susercontent.com",
  "down-sg.img.susercontent.com", "down-vn.img.susercontent.com",
  "i.pinimg.com",
  "www.nordstrom.com", "assets.nordstromrack.com",
  "images.containerstore.com",
  "media.licdn.com", "lookaside.fbsbx.com",
]);

interface Entry { id: string; imageUrl: string; lineNum: number }

function parseFilledOffers(content: string): Entry[] {
  const entries: Entry[] = [];
  const lines = content.split("\n");
  let id: string | null = null;
  for (let i = 0; i < lines.length; i++) {
    const idM = lines[i].match(/"id":\s*"([^"]+)"/);
    if (idM) { id = idM[1]; }
    if (id) {
      const urlM = lines[i].match(/"imageUrl":\s*"(https?:\/\/[^"]+)"/);
      if (urlM) {
        entries.push({ id, imageUrl: urlM[1], lineNum: i + 1 });
        id = null;
      }
    }
  }
  return entries;
}

async function isBlocked(url: string): Promise<boolean> {
  try {
    const host = new URL(url).hostname;
    if (INSTA_BLOCK.has(host)) return true;
  } catch { return true; }
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(7000),
      headers: { "User-Agent": UA, "Referer": REFERER },
    });
    const ct = res.headers.get("content-type") ?? "";
    return !(res.ok && ct.startsWith("image/") && !ct.includes("svg"));
  } catch { return true; }
}

async function main() {
  const original = fs.readFileSync(CATALOG_PATH, "utf-8");
  const entries = parseFilledOffers(original);
  console.log(`\nPickly — clear-blocked-images`);
  console.log(`Total filled entries to scan: ${entries.length}`);
  console.log(DRY_RUN ? "DRY RUN — no changes written\n" : "LIVE MODE — will clear blocked URLs\n");

  let blocked = 0;
  let ok = 0;
  const toBlock: Entry[] = [];

  // Test in batches
  for (let i = 0; i < entries.length; i += CONCURRENCY) {
    const batch = entries.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(async (e) => {
      const bad = await isBlocked(e.imageUrl);
      return { e, bad };
    }));
    for (const { e, bad } of results) {
      if (bad) {
        toBlock.push(e);
        blocked++;
        process.stdout.write(`✗ [${i + toBlock.length + ok}/${entries.length}] ${e.id.slice(0,40).padEnd(40)} BLOCKED\n`);
      } else {
        ok++;
      }
    }
    if ((i + CONCURRENCY) % 100 === 0) {
      process.stdout.write(`  ... scanned ${i + CONCURRENCY}/${entries.length}, ${blocked} blocked so far\n`);
    }
  }

  console.log(`\nResults: ${ok} OK, ${blocked} blocked`);

  if (blocked === 0) {
    console.log("✓ No blocked images found.");
    return;
  }

  if (DRY_RUN) {
    console.log("\nBlocked IDs (would be cleared):");
    toBlock.forEach(e => console.log("  " + e.id));
    console.log("\nRe-run with DRY_RUN=0 to apply.");
    return;
  }

  // Clear blocked entries
  let catalog = original;
  let cleared = 0;
  for (const e of toBlock) {
    const before = `"id": "${e.id}",\n    "imageUrl": "${e.imageUrl}"`;
    const after  = `"id": "${e.id}",\n    "imageUrl": ""`;
    if (catalog.includes(before)) {
      catalog = catalog.replace(before, () => after);
      cleared++;
    }
  }
  fs.writeFileSync(CATALOG_PATH, catalog, "utf-8");
  console.log(`\n✓ Cleared ${cleared} blocked image URLs.`);
  console.log("Next: npx tsx scripts/fetch-product-images.ts  to re-fill with working images");
}

main().catch(e => { console.error(e); process.exit(1); });
