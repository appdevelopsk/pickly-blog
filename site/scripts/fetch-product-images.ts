/**
 * Fetch product images via DuckDuckGo image search (no API key required).
 *
 * Usage:
 *   cd site && npx tsx scripts/fetch-product-images.ts            # all
 *   cd site && npx tsx scripts/fetch-product-images.ts --limit=50 # first 50
 *   cd site && DRY_RUN=1 npx tsx scripts/fetch-product-images.ts  # preview only
 *
 * Writes found URLs directly into catalog-additions.ts.
 * Safe to interrupt and re-run — already-filled entries are skipped.
 */

import fs from "node:fs";
import path from "node:path";

const CATALOG_PATH = path.resolve(__dirname, "../src/lib/affiliates/catalog-additions.ts");
const DDG_DELAY_MS = 1500;   // between DDG requests (polite)
const SAVE_EVERY = 20;        // write file after every N successes
const DRY_RUN = process.env.DRY_RUN === "1";

const limitArg = process.argv.find(a => a.startsWith("--limit="));
const LIMIT = limitArg ? parseInt(limitArg.split("=")[1], 10) : Infinity;

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

// ── DDG image search ──────────────────────────────────────────────────────────

async function getVqd(query: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`,
      { headers: { "User-Agent": UA } },
    );
    const html = await res.text();
    return html.match(/vqd=["']([^"']+)["']/)?.[1] ?? null;
  } catch { return null; }
}

async function ddgImageSearch(query: string): Promise<string | null> {
  const vqd = await getVqd(query);
  if (!vqd) return null;
  await sleep(400);

  try {
    const res = await fetch(
      `https://duckduckgo.com/i.js?q=${encodeURIComponent(query)}&o=json&vqd=${encodeURIComponent(vqd)}&f=,,,,,&p=1`,
      { headers: { "User-Agent": UA, "Referer": "https://duckduckgo.com/", "Accept": "application/json" } },
    );
    if (!res.ok) return null;

    type DdgResult = { image: string; height?: number; width?: number };
    const data = await res.json() as { results?: DdgResult[] };

    for (const r of (data.results ?? []).slice(0, 8)) {
      const url = r.image;
      if (!url || !url.startsWith("http")) continue;
      if (/\.(svg|gif|webp)(\?|$)/i.test(url)) continue;
      if (url.includes('"')) continue;  // skip URLs with embedded quotes — they corrupt .ts string literals
      // Skip tiny thumbnails — prefer larger images
      if (r.width && r.width < 100) continue;
      return url;
    }
  } catch { /* fall through */ }
  return null;
}

// ── Image URL validation ──────────────────────────────────────────────────────

async function validateImage(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(6000),
      headers: { "User-Agent": UA },
    });
    const ct = res.headers.get("content-type") ?? "";
    return res.ok && ct.startsWith("image/") && !ct.includes("svg");
  } catch { return false; }
}

// ── Catalog parsing ───────────────────────────────────────────────────────────

interface OfferEntry { id: string; name: string }

function parseEmptyOffers(content: string): OfferEntry[] {
  const offers: OfferEntry[] = [];
  const lines = content.split("\n");
  let id: string | null = null;
  let name: string | null = null;

  for (const line of lines) {
    const idMatch = line.match(/"id":\s*"([^"]+)"/);
    if (idMatch) { id = idMatch[1]; name = null; }

    // First "en" after the id is the product name
    if (id && !name) {
      const nameMatch = line.match(/"en":\s*"([^"]+)"/);
      if (nameMatch) name = nameMatch[1];
    }

    if (id && line.includes('"imageUrl": ""')) {
      offers.push({ id, name: name ?? id });
      id = null;
      name = null;
    }
  }
  return offers;
}

function applyImageUrl(content: string, id: string, imageUrl: string): string {
  // The id and imageUrl are on consecutive lines:
  //   "id": "back-brace-mueller-lumbar",
  //   "imageUrl": "",
  const before = `"id": "${id}",\n    "imageUrl": ""`;
  const after  = `"id": "${id}",\n    "imageUrl": "${imageUrl}"`;
  return content.includes(before) ? content.replace(before, after) : content;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const original = fs.readFileSync(CATALOG_PATH, "utf-8");
  const offers = parseEmptyOffers(original);
  const total = Math.min(offers.length, LIMIT);

  console.log(`\nPickly — fetch-product-images`);
  console.log(`Offers with empty imageUrl : ${offers.length}`);
  console.log(`Processing this run        : ${total}`);
  if (DRY_RUN) console.log("⚠  DRY RUN — catalog will not be modified\n");
  else console.log(`Writing to: ${CATALOG_PATH}\n`);

  let catalog = original;
  let success = 0;
  let failed = 0;

  for (let i = 0; i < total; i++) {
    const { id, name } = offers[i];
    const label = `[${i + 1}/${total}]`;
    process.stdout.write(`${label} ${id.slice(0, 45).padEnd(45)} `);

    // Search: product name + "product" to bias toward product shots
    const query = name.length > 5 ? `${name} product` : id.replace(/-/g, " ") + " product";
    const imageUrl = await ddgImageSearch(query);

    if (!imageUrl) {
      process.stdout.write("✗  no results\n");
      failed++;
    } else {
      const ok = await validateImage(imageUrl);
      if (!ok) {
        process.stdout.write(`✗  dead URL  ${imageUrl.slice(0, 50)}\n`);
        failed++;
      } else {
        process.stdout.write(`✓  ${imageUrl.slice(0, 65)}\n`);
        if (!DRY_RUN) {
          catalog = applyImageUrl(catalog, id, imageUrl);
          success++;
          if (success % SAVE_EVERY === 0) {
            fs.writeFileSync(CATALOG_PATH, catalog, "utf-8");
            console.log(`    → saved checkpoint (${success} filled)\n`);
          }
        } else {
          success++;
        }
      }
    }

    if (i < total - 1) await sleep(DDG_DELAY_MS);
  }

  // Final save
  if (!DRY_RUN && catalog !== original) {
    fs.writeFileSync(CATALOG_PATH, catalog, "utf-8");
  }

  console.log(`\n─────────────────────────────────────────`);
  console.log(`✓ Success : ${success}`);
  console.log(`✗ Failed  : ${failed}`);
  console.log(`  Total   : ${total}`);
  if (!DRY_RUN && success > 0) {
    console.log(`\nNext: commit + push to deploy`);
    console.log(`  git add site/src/lib/affiliates/catalog-additions.ts`);
    console.log(`  git commit -m "chore: add product image URLs (${success} offers)"`);
    console.log(`  git push origin main`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
