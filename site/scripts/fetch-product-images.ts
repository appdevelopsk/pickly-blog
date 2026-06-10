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

    // CDNs known to block hotlinking or return dead images
    const BLOCKED_HOSTS = [
      "assets.adidas.com", "assets.tatcha.com", "storage.skinsort.com",
      "image.rehabmart.com", "bigbigmart.com", "petico.sg",
      "www.snowcountry.eu", "www.huntingworkequipment.com", "images.publixcdn.com",
      "www.hassleless.com", "microless.com", "image.invaluable.com",
      "ca.umbra.com", "cdn.rona.ca", "www.lunablanket.com",
      "www.vejainuae.com", "www.carlsgolfland.com", "www.westcoastkids.ca",
      "www.babystore.ae", "casaleopet.com", "vekastore.com",
      "waggz.com", "swiftsly.com", "fathom.com.au", "assets.leevalley.com",
      "frugallivingpro.com", "atlantisdecora.com", "hardypaw.com",
      "sportano.hu", "www.bhphotovideo.com", "media-assets.grailed.com",
      "ceoreviewmagazine.com", "media.licdn.com", "thesmartinvestor.com",
      "d6qwfb5pdou4u.cloudfront.net", "www.travelgearcenter.com",
      "altabluffanimalhospital.com", "lookaside.fbsbx.com",
      "www.cvs.com", "www.hsdsonline.com", "editorialist.com",
      "assets.aritzia.com", "easybima.com", "fangwallet.com",
      "media.cybernews.com", "www.mickeyspetsupplies.com",
      "petsfit.com", "ntdint.ae", "carinsurepro.net", "pic2-c.avaluer.net",
      "www.homedepot.com", "www.fusionsol.com", "www.vsp.com",
      "0701.static.prezi.com", "indocenter.co.id", "www.medisupps.com",
      "tj-gin.oss-us-west-1.aliyuncs.com", "media.istockphoto.com",
      "www.chime.com", "viobank.com", "seniorbenefitclient.com",
    ];

    for (const r of (data.results ?? []).slice(0, 20)) {
      const url = r.image;
      if (!url || !url.startsWith("http")) continue;
      if (/\.(svg|gif|webp)(\?|$)/i.test(url)) continue;
      if (url.includes('"')) continue;
      if (r.width && r.width < 100) continue;
      try { if (BLOCKED_HOSTS.includes(new URL(url).hostname)) continue; } catch { continue; }
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

interface OfferEntry { id: string; name: string; category: string }

function parseEmptyOffers(content: string): OfferEntry[] {
  const offers: OfferEntry[] = [];
  const lines = content.split("\n");
  let id: string | null = null;
  let name: string | null = null;
  let category: string | null = null;

  for (const line of lines) {
    const idMatch = line.match(/"id":\s*"([^"]+)"/);
    if (idMatch) { id = idMatch[1]; name = null; category = null; }

    if (id && !name) {
      const nameMatch = line.match(/"en":\s*"([^"]+)"/);
      if (nameMatch) name = nameMatch[1];
    }
    if (id) {
      const catMatch = line.match(/"category":\s*"([^"]+)"/);
      if (catMatch) category = catMatch[1];
    }

    if (id && line.includes('"imageUrl": ""')) {
      offers.push({ id, name: name ?? id, category: category ?? "" });
      id = null; name = null; category = null;
    }
  }
  return offers;
}

function applyImageUrl(content: string, id: string, imageUrl: string): string {
  const before = `"id": "${id}",\n    "imageUrl": ""`;
  const after  = `"id": "${id}",\n    "imageUrl": "${imageUrl}"`;
  // Use a function replacement so $ in the URL is never treated as a special pattern
  return content.includes(before) ? content.replace(before, () => after) : content;
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

    // Category-aware query strategy
    const base = name.length > 5 ? name : id.replace(/-/g, " ");
    const queries = offers[i].category === "finance"
      ? [`${base} card`, `${base} logo`, `${base}`, `${base} app`]
      : [`${base} amazon`, `${base} walmart`, `${base} product`, `${base}`];
    let imageUrl: string | null = null;
    for (const q of queries) {
      imageUrl = await ddgImageSearch(q);
      if (imageUrl) break;
      await sleep(600);
    }

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
