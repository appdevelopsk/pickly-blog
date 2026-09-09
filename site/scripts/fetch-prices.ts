/**
 * Fetch current prices for all catalog offers.
 *
 * JP prices: Keepa API (if KEEPA_API_KEY is set) → curl scraping fallback
 * US prices: seeded from catalog price field (Amazon.com blocks curl)
 *
 * Keepa API (PAID ONLY — no free tier as of 2026-08; 1 token per ASIN):
 *   https://keepa.com/#!api — cheapest plan is Starter, 20 tokens/min for 49 EUR/month.
 *   KEEPA_API_KEY is currently NOT set in GitHub Secrets, so the daily workflow
 *   falls through to curl scraping below, which Amazon blocks with CAPTCHA.
 *   Net effect: this job has been a no-op. Either subscribe and register the
 *   secret, or drop the schedule in .github/workflows/fetch-prices.yml.
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
import { PRICES as EXISTING_PRICES, PRICE_ASOF as EXISTING_ASOF } from "../src/lib/affiliates/prices-override";
import {
  readPaapiCreds,
  fetchPaapiBatch,
  PAAPI_BATCH,
  PAAPI_DELAY_MS,
  type PaapiCreds,
  type PaapiMarket,
} from "./lib/paapi";

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

function formatUsd(raw: string | number | undefined): string | null {
  if (raw == null) return null;
  const m = String(raw).match(/\$[\d.,]+/);
  return m ? m[0] : null;
}

function formatJpy(raw: string | number | undefined): string | null {
  if (raw == null) return null;
  const m = String(raw).match(/¥[\d,]+/);
  return m ? m[0] : null;
}

// ── Keepa API ─────────────────────────────────────────────────────────────────

interface KeepaProduct {
  asin: string;
  csv?: (number | null)[][];  // price history arrays; index 0 = Amazon price
}

/**
 * PA-API で市場ぶんの価格をまとめて取る。
 * 資格情報エラー（売上要件未達を含む）は即中断する: 全 ASIN 分リトライしても同じ結果で、
 * スロットル制裁を受けるだけなので。
 */
async function fetchPaapiPrices(
  creds: PaapiCreds,
  market: PaapiMarket,
  asinList: { offerId: string; asin: string }[],
): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  const seen = new Set<string>();
  // 同じ ASIN が複数 offer にぶら下がることがあるので、リクエストは一意化する
  const uniq = asinList.filter((x) => !seen.has(x.asin) && seen.add(x.asin));
  let ok = 0;
  let fail = 0;

  for (let i = 0; i < uniq.length; i += PAAPI_BATCH) {
    const batch = uniq.slice(i, i + PAAPI_BATCH);
    const { prices, error } = await fetchPaapiBatch(creds, market, batch.map((x) => x.asin));

    if (error) {
      const fatal = /AccessDenied|InvalidSignature|UnrecognizedClient|InvalidPartnerTag|HTTP_401|HTTP_403/i.test(error.code);
      console.warn(`  PA-API ${market} error [${error.code}]: ${error.message.slice(0, 120)}`);
      if (fatal) {
        console.warn(
          `  → 資格情報か売上要件（直近30日に10件以上の適格売上）の問題です。${market} の取得を中断します。`,
        );
        break;
      }
      fail += batch.length;
    } else {
      // ASIN → offerId は 1:N。同じ ASIN を持つ全 offer に配る。
      for (const { offerId, asin } of asinList) {
        const price = prices[asin];
        if (price) { result[offerId] = price; ok++; }
      }
    }

    if (i + PAAPI_BATCH < uniq.length) await sleep(PAAPI_DELAY_MS);
    if ((i / PAAPI_BATCH) % 20 === 0) {
      process.stdout.write(`  [${Math.min(i + PAAPI_BATCH, uniq.length)}/${uniq.length}] ok=${ok} fail=${fail}\n`);
    }
  }
  return result;
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
  const paapiCreds = readPaapiCreds();

  // Build list of offers with real amazon-jp ASIN (no search-URL fallback)
  const toFetch = CATALOG.flatMap((offer) => {
    const jpLink = offer.links.find(
      (l) => l.network === "amazon-jp" && !(l.rawUrl?.includes("/s?k="))
    );
    if (!jpLink) return [];
    return [{ offer, asin: jpLink.productId ?? "" }];
  }).filter((x) => x.asin);

  console.log(`JP price targets: ${toFetch.length} offers`);
  // 取得の優先順位。PA-API が本命で、Keepa は取りこぼしの補完、curl は既定で無効。
  const strategy = [
    paapiCreds ? "PA-API" : null,
    keepaKey ? "Keepa(補完)" : null,
    process.env.ALLOW_SCRAPE ? "curl(非推奨)" : null,
  ].filter(Boolean);
  console.log(`Strategy: ${strategy.length ? strategy.join(" → ") : "なし（資格情報が未設定のため既存価格を維持）"}`);

  // Start with previously fetched prices
  const prices: Record<string, Record<string, string>> = {};
  for (const [id, markets] of Object.entries(EXISTING_PRICES)) {
    prices[id] = { ...(markets as Record<string, string>) };
  }

  // 取得日。前回値を引き継ぎ、今回実際に取れた市場だけ TODAY で上書きする。
  // 引き継がないと「価格は据え置きなのに as-of だけ今日に進む」偽装になる。
  const TODAY = new Date().toISOString().slice(0, 10);
  const asof: Record<string, Record<string, string>> = {};
  // PRICE_ASOF はこの移行で追加した export なので、まだ持たない世代の
  // prices-override.ts を読むと undefined になる。空として扱う。
  for (const [id, markets] of Object.entries(EXISTING_ASOF ?? {})) {
    asof[id] = { ...(markets as Record<string, string>) };
  }
  const stamp = (id: string, market: string) => {
    asof[id] = { ...asof[id], [market]: TODAY };
  };

  // Seed from catalog price fields.
  // ここは API 取得ではなくカタログのベタ書き値の写しなので、**as-of は打たない**。
  // 打つと「編集者が手で書いた古い数字」に今日の日付が付いてしまう。
  //
  // さらに重要: 取得日を持つ値（= API で実際に取れた値）は上書きしない。
  // 以前はここが無条件代入で、資格情報が無い実行でも API 取得済みの US 価格が
  // カタログのベタ書き値に巻き戻っていた（例: $1,899 → $1,099）。
  // 「ベタ書きは穴埋めだけ、実測値には触らない」を不変条件にする。
  const fetched = (id: string, market: string) => asof[id]?.[market] != null;
  const seed = (id: string, market: "JP" | "US", value: string) => {
    if (fetched(id, market)) return;
    prices[id] = { ...prices[id], [market]: value };
  };
  for (const o of CATALOG) {
    const usd = formatUsd(o.price);
    if (usd) seed(o.id, "US", usd);
    const jpy = formatJpy(o.price);
    if (jpy) seed(o.id, "JP", jpy);
    const jpyMin = formatJpy(o.priceMin);
    if (jpyMin && !prices[o.id]?.JP) seed(o.id, "JP", jpyMin);
  }

  // ── PA-API path（主経路） ────────────────────────────────────────────────────
  // 公式 API なので価格表示の規約要件を満たす。無料だが売上要件がある。
  if (paapiCreds) {
    console.log(`\nFetching via PA-API (JP: ${toFetch.length} ASINs, batches of ${PAAPI_BATCH})…`);
    const jp = await fetchPaapiPrices(paapiCreds, "JP", toFetch.map((x) => ({ offerId: x.offer.id, asin: x.asin })));
    for (const [offerId, price] of Object.entries(jp)) {
      prices[offerId] = { ...prices[offerId], JP: price };
      stamp(offerId, "JP");
    }
    console.log(`PA-API JP: ${Object.keys(jp).length} prices updated.`);

    // US は amazon-us リンクの ASIN を使う。従来は catalog の写しだけだった箇所。
    const usTargets = CATALOG.flatMap((offer) => {
      const l = offer.links.find((x) => x.network === "amazon-us" && !(x.rawUrl?.includes("/s?k=")));
      return l?.productId ? [{ offerId: offer.id, asin: l.productId }] : [];
    });
    if (usTargets.length) {
      console.log(`\nFetching via PA-API (US: ${usTargets.length} ASINs)…`);
      const us = await fetchPaapiPrices(paapiCreds, "US", usTargets);
      for (const [offerId, price] of Object.entries(us)) {
        prices[offerId] = { ...prices[offerId], US: price };
        stamp(offerId, "US");
      }
      console.log(`PA-API US: ${Object.keys(us).length} prices updated.`);
    }
  } else {
    console.log("\nPA-API 資格情報なし (PAAPI_ACCESS_KEY/PAAPI_SECRET_KEY/PAAPI_PARTNER_TAG) — スキップ。");
  }

  // ── Keepa path（従経路: PA-API で取れなかったぶんの穴埋め） ──────────────────
  if (keepaKey) {
    // PA-API が as-of を打てたものは新鮮なので再取得しない（トークン節約）。
    const remaining = toFetch.filter((x) => asof[x.offer.id]?.JP !== TODAY);
    console.log(`\nFetching via Keepa API (${remaining.length} ASINs in batches of ${KEEPA_BATCH})…`);
    const asinList = remaining.map((x) => ({ offerId: x.offer.id, asin: x.asin }));
    const keepaPrices = await fetchKeepaJpPrices(keepaKey, asinList);
    let ok = 0;
    for (const [offerId, price] of Object.entries(keepaPrices)) {
      prices[offerId] = { ...prices[offerId], JP: price };
      stamp(offerId, "JP");
      ok++;
    }
    console.log(`Keepa: ${ok} JP prices updated, ${asinList.length - ok} not available.`);
  }

  // ── curl fallback（既定で無効） ──────────────────────────────────────────────
  // Amazon の CAPTCHA でほぼ取れないうえ、スクレイピングは Amazon の利用規約に反する。
  // PA-API を主経路にした 2026-09-09 以降、明示的に ALLOW_SCRAPE=1 を渡した時だけ動く。
  const noPrice = process.env.ALLOW_SCRAPE
    ? toFetch.filter((x) => !prices[x.offer.id]?.JP)
    : [];
  if (!process.env.ALLOW_SCRAPE) {
    console.log("\ncurl スクレイピングは既定で無効です（ALLOW_SCRAPE=1 で有効化）。");
  }
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
          if (price) { prices[offer.id] = { ...prices[offer.id], JP: price }; stamp(offer.id, "JP"); ok++; }
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

  // ヘッダの日付は「スクリプトを流した日」ではなく「実際に価格を取れた最新日」。
  // 実行日を書くと、API が一件も動いていない空振りの実行でも
  // ファイルだけ新しく見える（今回の停止が19日間気づかれなかった構図そのもの）。
  const asofDates = Object.values(asof).flatMap((m) => Object.values(m));
  const lastFetched = asofDates.length ? asofDates.sort().at(-1)! : "取得実績なし";

  const lines: string[] = [
    "/**",
    " * Market-specific price overrides for catalog offers.",
    " * Auto-generated by scripts/fetch-prices.ts — do not edit manually.",
    ` * Last fetched: ${lastFetched}`,
    " */",
    "export const PRICES: Record<string, Partial<Record<string, string>>> = {",
  ];
  for (const [id, markets] of entries) {
    const inner = Object.entries(markets).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(", ");
    lines.push(`  ${JSON.stringify(id)}: { ${inner} },`);
  }
  lines.push("};", "");
  // 取得日（YYYY-MM-DD）。UI の「〜時点」表示と、鮮度ゲートの両方がこれを見る。
  // 市場ごとに更新タイミングが違う（JP は PA-API、US は catalog seed）ので市場別に持つ。
  lines.push(
    "/** 各価格の取得日（YYYY-MM-DD）。表示の「〜時点」と鮮度判定に使う。 */",
    "export const PRICE_ASOF: Record<string, Partial<Record<string, string>>> = {",
  );
  for (const [id] of entries) {
    const a = asof[id];
    if (!a || Object.keys(a).length === 0) continue;
    const inner = Object.entries(a).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(", ");
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
