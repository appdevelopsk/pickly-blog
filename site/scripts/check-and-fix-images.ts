/**
 * Check all imageUrls in catalog-additions.ts and catalog-additions-basketball.ts,
 * reset broken ones to "", then re-run fetch-product-images to fill them.
 *
 * Usage:
 *   cd site && npx tsx scripts/check-and-fix-images.ts
 *   cd site && npx tsx scripts/check-and-fix-images.ts --dry-run   # just report
 */
import fs from "node:fs";
import path from "node:path";

const DRY_RUN = process.argv.includes("--dry-run");
const CONCURRENCY = 20;
const TIMEOUT_MS = 8000;
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const CATALOG_FILES = [
  path.resolve(__dirname, "../src/lib/affiliates/catalog-additions.ts"),
  path.resolve(__dirname, "../src/lib/affiliates/catalog-additions-basketball.ts"),
];

// Domains known to block hotlinking — skip HEAD check and treat as broken immediately
const BLOCKED_DOMAINS = new Set([
  "i5.walmartimages.com", "www.walmart.com",
  "pisces.bbystatic.com", "www.bestbuy.com",
  "www.kroger.com",
  "i.ytimg.com", "img.youtube.com",
  "media.karousell.com",
  "www.refinery29.com",
  "goodbuygear.com",
  "www.bhphotovideo.com",
  "media.licdn.com",
  "lookaside.fbsbx.com",
  "media.istockphoto.com",
  "editorialist.com",
  "0701.static.prezi.com",
  "www.cvs.com",
  "www.homedepot.com", "images.thdstatic.com",
  "jeritek.com",
  "www.shop-orthopedics.com",
  "zenaptichealth.com",
  "ceoreviewmagazine.com",
  "thesmartinvestor.com",
  "fangwallet.com",
  "carinsurepro.net",
  "seniorbenefitclient.com",
  "easybima.com",
  "www.medisupps.com",
  "www.vsp.com",
  "viobank.com",
  "www.chime.com",
]);

interface BrokenEntry { file: string; id: string; url: string; reason: string }

function extractEntries(content: string): Array<{ id: string; url: string; pos: number }> {
  const entries: Array<{ id: string; url: string; pos: number }> = [];
  // Match both "id": "..." and id: "..." styles
  const idRe = /(?:"id"|id):\s*["']([^"']+)["']/g;
  // Match both "imageUrl": "..." and imageUrl: "..." styles
  const imgRe = /(?:"imageUrl"|imageUrl):\s*["']([^"']+)["']/g;

  let idMatch: RegExpExecArray | null;
  while ((idMatch = idRe.exec(content)) !== null) {
    const id = idMatch[1];
    const idEnd = idMatch.index + idMatch[0].length;
    // Look for imageUrl within the next 800 chars (same object)
    imgRe.lastIndex = idEnd;
    const imgMatch = imgRe.exec(content);
    if (imgMatch && imgMatch.index - idEnd < 800 && imgMatch[1]) {
      entries.push({ id, url: imgMatch[1], pos: imgMatch.index });
    }
    idRe.lastIndex = idEnd;
  }
  return entries;
}

async function isImageOk(url: string): Promise<{ ok: boolean; reason: string }> {
  let hostname: string;
  try { hostname = new URL(url).hostname; } catch { return { ok: false, reason: "invalid URL" }; }

  if (BLOCKED_DOMAINS.has(hostname)) {
    return { ok: false, reason: `blocked domain (${hostname})` };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: { "User-Agent": UA, "Referer": "https://www.google.com/" },
    });
    clearTimeout(timer);
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.startsWith("image/") || ct.includes("svg")) {
      return { ok: false, reason: `bad content-type: ${ct.slice(0, 40)}` };
    }
    return { ok: true, reason: "" };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, reason: msg.slice(0, 60) };
  }
}

async function checkBatch(
  entries: Array<{ id: string; url: string }>,
  fileLabel: string,
): Promise<BrokenEntry[]> {
  const broken: BrokenEntry[] = [];
  let done = 0;

  // Process in batches of CONCURRENCY
  for (let i = 0; i < entries.length; i += CONCURRENCY) {
    const batch = entries.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(async (e) => {
        const result = await isImageOk(e.url);
        done++;
        if (done % 50 === 0 || done === entries.length) {
          process.stdout.write(`\r  [${done}/${entries.length}] checked...`);
        }
        return { ...e, ...result };
      })
    );
    for (const r of results) {
      if (!r.ok) broken.push({ file: fileLabel, id: r.id, url: r.url, reason: r.reason });
    }
  }
  process.stdout.write("\n");
  return broken;
}

function resetBrokenUrls(content: string, brokenIds: Set<string>): string {
  let result = content;
  for (const id of brokenIds) {
    // Try quoted format
    result = result.replace(
      new RegExp(`("id":\\s*"${id.replace(/[-]/g, "\\-")}",\\s*\\n\\s*"imageUrl":\\s*)"[^"]*"`),
      `$1""`
    );
    // Try unquoted format
    result = result.replace(
      new RegExp(`(\\bid:\\s*"${id.replace(/[-]/g, "\\-")}",\\s*\\n\\s*imageUrl:\\s*)"[^"]*"`),
      `$1""`
    );
  }
  return result;
}

async function main() {
  let totalBroken = 0;

  for (const filePath of CATALOG_FILES) {
    if (!fs.existsSync(filePath)) continue;
    const fileName = path.basename(filePath);
    const content = fs.readFileSync(filePath, "utf-8");
    const entries = extractEntries(content);

    console.log(`\n${fileName}: checking ${entries.length} imageUrls...`);
    const broken = await checkBatch(entries, fileName);
    totalBroken += broken.length;

    console.log(`  ✓ OK: ${entries.length - broken.length}  ✗ broken: ${broken.length}`);
    if (broken.length > 0) {
      console.log("  Broken entries:");
      for (const b of broken.slice(0, 20)) {
        console.log(`    ${b.id}: ${b.reason}`);
      }
      if (broken.length > 20) console.log(`    ... and ${broken.length - 20} more`);
    }

    if (!DRY_RUN && broken.length > 0) {
      const brokenIds = new Set(broken.map((b) => b.id));
      const fixed = resetBrokenUrls(content, brokenIds);
      fs.writeFileSync(filePath, fixed, "utf-8");
      console.log(`  → Reset ${broken.length} broken URLs to "" in ${fileName}`);
    }
  }

  if (DRY_RUN) {
    console.log(`\nDRY RUN: ${totalBroken} broken imageUrls found. Run without --dry-run to fix.`);
  } else if (totalBroken > 0) {
    console.log(`\n✓ Reset ${totalBroken} broken URLs. Now run:`);
    console.log("  npx tsx scripts/fetch-product-images.ts");
  } else {
    console.log("\n✓ All imageUrls are valid.");
  }
}

main().catch(console.error);
