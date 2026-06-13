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
const CATALOG_BASKETBALL_PATH = path.resolve(__dirname, "../src/lib/affiliates/catalog-additions-basketball.ts");
const CATALOG_MAIN_PATH = path.resolve(__dirname, "../src/lib/affiliates/catalog.ts");
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
      // Brand CDNs that block hotlinking (detected via Referer 403/406)
      "lsco.scene7.com", "target.scene7.com", "academy.scene7.com",
      "dks.scene7.com", "athleta.scene7.com", "hrbent.scene7.com",
      "lakelandcamel.scene7.com", "s7d1.scene7.com", "totousa.scene7.com",
      "akamai-scene7.frontgate.com",
      "www.ugg.com", "ugg.com",
      "www.stevemadden.com",
      "images.songmics.com",
      "img.cupshe.com",
      "hips.hearstapps.com",
      "assets.thenorthface.eu", "assets.hermes.com",
      "bananarepublic.gap.com", "athleta.gap.com",
      "slimages.macysassets.com",
      "assets.wsimgs.com", "assets.wfcdn.com", "assets.weimgs.com",
      // Shopee CDNs (Southeast Asia, block external referers)
      "down-my.img.susercontent.com", "down-id.img.susercontent.com",
      "down-ph.img.susercontent.com", "down-th.img.susercontent.com",
      "down-sg.img.susercontent.com", "down-vn.img.susercontent.com",
      // Pinterest CDN (no direct hotlinking allowed)
      "i.pinimg.com",
      // Other brand/editorial sites known to block
      "www.nordstrom.com", "assets.nordstromrack.com",
      "images.containerstore.com",
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
      // Test with a realistic browser Referer so hotlink-blocking CDNs reject early
      headers: { "User-Agent": UA, "Referer": "https://pickly.blog/" },
    });
    const ct = res.headers.get("content-type") ?? "";
    return res.ok && ct.startsWith("image/") && !ct.includes("svg");
  } catch { return false; }
}

// ── Catalog parsing ───────────────────────────────────────────────────────────

interface OfferEntry { id: string; name: string; category: string }

function parseEmptyOffers(content: string): OfferEntry[] {
  const offers: OfferEntry[] = [];

  // ── Pass 1: single-line entries  { id: "...", ..., imageUrl: "", ... }
  const singleLineRe = /\{[^{}]*\bid:\s*"([^"]+)"[^{}]*\bcategory:\s*"([^"]+)"[^{}]*imageUrl:\s*""[^{}]*\}/g;
  let m: RegExpExecArray | null;
  const seenSingle = new Set<string>();
  while ((m = singleLineRe.exec(content)) !== null) {
    const id = m[1];
    const category = m[2];
    const nameM = m[0].match(/"en":\s*"([^"]+)"/);
    const name = nameM ? nameM[1] : id;
    offers.push({ id, name, category });
    seenSingle.add(id);
  }

  // ── Pass 2: multi-line entries (line-by-line state machine)
  const lines = content.split("\n");
  let id: string | null = null;
  let name: string | null = null;
  let category: string | null = null;

  for (const line of lines) {
    const idMatch = line.match(/(?:"id"|id):\s*"([^"]+)"/);
    if (idMatch) { id = idMatch[1]; name = null; category = null; }

    if (id && !name) {
      const nameMatch = line.match(/"en":\s*"([^"]+)"/);
      if (nameMatch) name = nameMatch[1];
    }
    if (id) {
      const catMatch = line.match(/(?:"category"|category):\s*"([^"]+)"/);
      if (catMatch) category = catMatch[1];
    }

    if (id && !seenSingle.has(id) && /(?:"imageUrl"|imageUrl):\s*""/.test(line)) {
      offers.push({ id, name: name ?? id, category: category ?? "" });
      id = null; name = null; category = null;
    }
  }
  return offers;
}

function applyImageUrl(content: string, id: string, imageUrl: string): string {
  const esc = imageUrl.replace(/\$/g, "$$$$");
  // 1. Quoted multi-line: "id": "...",\n    "imageUrl": ""
  const b1 = `"id": "${id}",\n    "imageUrl": ""`;
  if (content.includes(b1)) return content.replace(b1, `"id": "${id}",\n    "imageUrl": "${esc}"`);
  // 2. Unquoted multi-line: id: "...",\n    imageUrl: ""
  const b2 = `id: "${id}",\n    imageUrl: ""`;
  if (content.includes(b2)) return content.replace(b2, `id: "${id}",\n    imageUrl: "${esc}",`);
  // 3. Single-line: id: "...", ..., imageUrl: "", ...
  const singleLine = content.replace(
    new RegExp(`(\\bid:\\s*"${id.replace(/[-]/g, "\\-")}",(?:[^{}]*?))imageUrl:\\s*""`),
    `$1imageUrl: "${esc}"`
  );
  if (singleLine !== content) return singleLine;
  // 4. Position-independent fallback: imageUrl may sit anywhere in the entry
  //    (e.g. after name/description objects with nested braces). Anchor on the
  //    id, then replace the FIRST empty imageUrl that follows it.
  const idIdx = content.search(new RegExp(`(?:"id"|id):\\s*"${id.replace(/[-]/g, "\\-")}"`));
  if (idIdx >= 0) {
    const emptyRe = /(?:"imageUrl"|imageUrl):\s*""/;
    const after = content.slice(idIdx);
    const rel = after.search(emptyRe);
    if (rel >= 0) {
      const abs = idIdx + rel;
      const matched = content.slice(abs).match(emptyRe)![0];
      const quoted = matched.includes('"imageUrl"');
      const repl = quoted ? `"imageUrl": "${esc}"` : `imageUrl: "${esc}"`;
      return content.slice(0, abs) + repl + content.slice(abs + matched.length);
    }
  }
  return content;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function processFile(filePath: string, limit: number): Promise<{ success: number; failed: number }> {
  const original = fs.readFileSync(filePath, "utf-8");
  const offers = parseEmptyOffers(original);
  const total = Math.min(offers.length, limit);

  console.log(`\n${path.basename(filePath)}: ${offers.length} empty imageUrls`);
  if (total === 0) return { success: 0, failed: 0 };
  console.log(`Processing this run: ${total}`);
  if (!DRY_RUN) console.log(`Writing to: ${filePath}\n`);

  let catalog = original;
  let success = 0;
  let failed = 0;

  for (let i = 0; i < total; i++) {
    const { id, name } = offers[i];
    process.stdout.write(`[${i + 1}/${total}] ${id.slice(0, 45).padEnd(45)} `);

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
            fs.writeFileSync(filePath, catalog, "utf-8");
            console.log(`    → saved checkpoint (${success} filled)\n`);
          }
        } else {
          success++;
        }
      }
    }

    if (i < total - 1) await sleep(DDG_DELAY_MS);
  }

  if (!DRY_RUN && catalog !== original) fs.writeFileSync(filePath, catalog, "utf-8");
  return { success, failed };
}

async function main() {
  console.log(`\nPickly — fetch-product-images`);
  if (DRY_RUN) console.log("⚠  DRY RUN — catalog will not be modified");

  // Auto-discover every catalog data file: the main catalog, the additions,
  // basketball, and any catalog-batch*.ts split files added by batch-gen.
  const affDir = path.resolve(__dirname, "../src/lib/affiliates");
  const batchFiles = fs.readdirSync(affDir)
    .filter((n) => /^catalog-batch.*\.ts$/.test(n))
    .map((n) => path.join(affDir, n));
  const files = [CATALOG_MAIN_PATH, CATALOG_PATH, CATALOG_BASKETBALL_PATH, ...batchFiles];
  let totalSuccess = 0;
  let totalFailed = 0;

  for (const f of files) {
    if (!fs.existsSync(f)) continue;
    const { success, failed } = await processFile(f, LIMIT);
    totalSuccess += success;
    totalFailed += failed;
  }

  console.log(`\n─────────────────────────────────────────`);
  console.log(`✓ Success : ${totalSuccess}`);
  console.log(`✗ Failed  : ${totalFailed}`);
  console.log(`  Total   : ${totalSuccess + totalFailed}`);
  if (!DRY_RUN && totalSuccess > 0) {
    console.log(`\nNext: git add site/src/lib/affiliates/catalog-additions*.ts && git commit && git push`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
