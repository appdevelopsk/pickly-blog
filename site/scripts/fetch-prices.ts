/**
 * Fetch current prices for all catalog offers.
 *
 * JP prices: Keepa API (if KEEPA_API_KEY is set) → curl scraping fallback
 * US prices: seeded from catalog price field (Amazon.com blocks curl)
 *
 * Keepa API (free tier: 100 tokens/day, 1 token per ASIN):
 *   https://keepa.com/#!api — register free, generate key, set KEEPA_API_KEY
 *   With 100 tokens/day, fetches all 564 ASINs in ~6 daily runs.
 *   Script splits ASINs into daily batches automatically.
 *
 * Usage:  cd site && npx tsx scripts/fetch-prices.ts
 *         KEEPA_API_KEY=xxx npx tsx scripts/fetch-prices.ts
 * Output: src/lib/affiliates/prices-override.ts  (auto-generated)
 *
 * Schedule via GitHub Actions to run daily.
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { CATALOG } from "../src/lib/affiliates/catalog";
import { PRICES as EXISTING_PRICES } from "../src/lib/affiliates/prices-override";

const OUT_PATH = path.resolve(__dirname, "../src/lib/affiliates/prices-override.ts");
const DELAY_MS = 1200;   // delay between curl requests (polite)
const CONCURRENCY = 2;   // parallel curl workers
const KEEPA_BATCH = 10;  // ASINs per Keepa request (API supports up to 100)
const KEEPA_DELAY = 500; // ms between Keepa batch requests

// ── helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function fetchPage(url: string): string {
  try {
    const buf = execSync(
      `curl -s -L --max-time 10 ` +
        `--retry 2 --retry-delay 3 ` +
        `-A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36" ` +
        `-H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" ` +
        `-H "Accept-Language: ja-JP,ja;q=0.9,en;q=0.8" ` +
        `-H "Accept-Encoding: gzip, deflate, br" ` +
        `"${url}"`,
      { timeout: 20000, maxBuffer: 4 * 1024 * 1024 }
    );
    return buf.toString("utf8");
  } catch {
    return "";
  }
}

function extractJpPrice(html: string): string | null {
  if (html.includes("opfcaptcha") || html.length < 10000) return null;
  const m1 = html.match(/"priceAmount":([\d.]+)/);
  if (m1) return `¥${Math.round(parseFloat(m1[1])).toLocaleString("ja-JP")}`;
  const m2 = html.match(/class="a-offscreen">(¥[\d,]+)</);
  if (m2) return m2[1];
  const m3 = html.match(/class="a-price-whole">([\d,]+)</);
  if (m3) return `¥${m3[1]}`;
  return null;
}

function formatUsd(raw: string | undefined): string | null {
  if (!raw) return null;
  const m = raw.match(/\$[\d.,]+/);
  return m ? m[0] : null;
}

function formatJpy(raw: string | undefined): string | null {
  if (!raw) return null;
  const m = raw.match(/¥[\d,]+/);
  return m ? m[0] : null;
}

// ── Keepa API ─────────────────────────────────────────────────────────────────

interface KeepaProduct {
  asin: string;
  csv?: (number | null)[][];  // price history arrays; index 0 = Amazon price
}

async function fetchKeepaJpPrices(
  apiKey: string,
  asinList: { offerId: string; asin: string }[]
): Promise<Record<string, string>> {
  const result: Record<string, string> = {};

  // Process in batches
  for (let i = 0; i < asinList.length; i += KEEPA_BATCH) {
    const batch = asinList.slice(i, i + KEEPA_BATCH);
    const asins = batch.map((x) => x.asin).join(",");
    const url =
      `https://api.keepa.com/product?key=${apiKey}` +
      `&domain=5` +  // 5 = amazon.co.jp
      `&asin=${asins}` +
      `&stats=1` +   // include current stats
      `&history=0`;  // skip full history, just current price

    try {
      const buf = execSync(
        `curl -s -L --max-time 15 "${url}"`,
        { timeout: 20000, maxBuffer: 2 * 1024 * 1024 }
      );
      const data = JSON.parse(buf.toString("utf8")) as {
        products?: KeepaProduct[];
        tokensLeft?: number;
        error?: { message: string };
      };

      if (data.error) {
        console.warn(`  Keepa error: ${data.error.message}`);
        break;
      }

      if (data.tokensLeft !== undefined && i === 0) {
        console.log(`  Keepa tokens remaining today: ${data.tokensLeft}`);
      }

      for (const product of data.products ?? []) {
        const item = batch.find((x) => x.asin === product.asin);
        if (!item) continue;
        // csv[0] = Amazon price history; csv[18] = current buy box price
        // Keepa prices are in yen * 100, -1 means out of stock
        const priceArr = product.csv?.[18] ?? product.csv?.[0];
        if (!priceArr) continue;
        // Last price value in the array (alternating timestamp, price pairs)
        let lastPrice = -1;
        for (let j = priceArr.length - 1; j >= 0; j--) {
          const v = priceArr[j];
          if (typeof v === "number" && v > 0) { lastPrice = v; break; }
        }
        if (lastPrice > 0) {
          const yen = Math.round(lastPrice / 100);
          result[item.offerId] = `¥${yen.toLocaleString("ja-JP")}`;
        }
      }
    } catch (err) {
      console.warn(`  Keepa batch ${i}–${i + KEEPA_BATCH} failed:`, (err as Error).message?.slice(0, 80));
    }

    if (i + KEEPA_BATCH < asinList.length) await sleep(KEEPA_DELAY);
  }

  return result;
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  const keepaKey = process.env.KEEPA_API_KEY;

  // Build list of offers with real amazon-jp ASIN (no search-URL fallback)
  const toFetch = CATALOG.flatMap((offer) => {
    const jpLink = offer.links.find(
      (l) => l.network === "amazon-jp" && !(l.rawUrl?.includes("/s?k="))
    );
    if (!jpLink) return [];
    return [{ offer, asin: jpLink.productId ?? "" }];
  }).filter((x) => x.asin);

  console.log(`JP price targets: ${toFetch.length} offers`);
  console.log(`Strategy: ${keepaKey ? "Keepa API" : "curl scraping (set KEEPA_API_KEY for reliable results)"}`);

  // Start with previously fetched prices
  const prices: Record<string, Record<string, string>> = {};
  for (const [id, markets] of Object.entries(EXISTING_PRICES)) {
    prices[id] = { ...(markets as Record<string, string>) };
  }

  // Seed from catalog price fields
  for (const o of CATALOG) {
    const usd = formatUsd(o.price);
    if (usd) prices[o.id] = { ...prices[o.id], US: usd };
    const jpy = formatJpy(o.price);
    if (jpy) prices[o.id] = { ...prices[o.id], JP: jpy };
    const jpyMin = formatJpy(o.priceMin);
    if (jpyMin && !prices[o.id]?.JP) prices[o.id] = { ...prices[o.id], JP: jpyMin };
  }

  // ── Keepa path ──────────────────────────────────────────────────────────────
  if (keepaKey) {
    console.log(`\nFetching via Keepa API (${toFetch.length} ASINs in batches of ${KEEPA_BATCH})…`);
    const asinList = toFetch.map((x) => ({ offerId: x.offer.id, asin: x.asin }));
    const keepaPrices = await fetchKeepaJpPrices(keepaKey, asinList);
    let ok = 0;
    for (const [offerId, price] of Object.entries(keepaPrices)) {
      prices[offerId] = { ...prices[offerId], JP: price };
      ok++;
    }
    console.log(`Keepa: ${ok} JP prices updated, ${toFetch.length - ok} not available.`);
  }

  // ── curl fallback (only for ASINs without a JP price yet) ──────────────────
  const noPrice = toFetch.filter((x) => !prices[x.offer.id]?.JP);
  if (noPrice.length > 0) {
    console.log(`\nCurl fallback for ${noPrice.length} ASINs without JP price…`);
    let ok = 0, failed = 0, done = 0;
    const chunks: (typeof noPrice)[] = Array.from({ length: CONCURRENCY }, () => []);
    noPrice.forEach((item, i) => chunks[i % CONCURRENCY].push(item));

    await Promise.all(
      chunks.map(async (chunk) => {
        for (const { offer, asin } of chunk) {
          const html = fetchPage(`https://www.amazon.co.jp/dp/${asin}`);
          const price = extractJpPrice(html);
          if (price) { prices[offer.id] = { ...prices[offer.id], JP: price }; ok++; }
          else failed++;
          done++;
          if (done % 25 === 0 || done === noPrice.length) {
            process.stdout.write(`  [${done}/${noPrice.length}] ok=${ok} failed=${failed}\n`);
          }
          await sleep(DELAY_MS);
        }
      })
    );
    console.log(`Curl: ${ok} fetched, ${failed} failed (likely CAPTCHA).`);
  }

  // ── write output ────────────────────────────────────────────────────────────
  const entries = Object.entries(prices)
    .filter(([, v]) => Object.keys(v).length > 0)
    .sort(([a], [b]) => a.localeCompare(b));

  const lines: string[] = [
    "/**",
    " * Market-specific price overrides for catalog offers.",
    " * Auto-generated by scripts/fetch-prices.ts — do not edit manually.",
    ` * Last updated: ${new Date().toISOString().slice(0, 10)}`,
    " */",
    "export const PRICES: Record<string, Partial<Record<string, string>>> = {",
  ];
  for (const [id, markets] of entries) {
    const inner = Object.entries(markets).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(", ");
    lines.push(`  ${JSON.stringify(id)}: { ${inner} },`);
  }
  lines.push("};", "");
  fs.writeFileSync(OUT_PATH, lines.join("\n"), "utf8");

  const jpCount = entries.filter(([, v]) => v.JP).length;
  const usCount = entries.filter(([, v]) => v.US).length;
  console.log(`\nWritten → ${OUT_PATH}`);
  console.log(`  JP prices: ${jpCount} | US prices: ${usCount}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
