/**
 * Yahoo!ショッピング 商品データ補完（2026-06-22）。
 * カタログ各商品名で検索→関連商品の最上位 + 価格レンジ + レビュー を
 * `src/lib/affiliates/yahoo-cache.json` にキャッシュ。サイトはこれを読むだけ。
 *
 * 使い方（要 env YAHOO_APP_ID, 任意 AFFILIATE_VALUECOMMERCE_SID）:
 *   npx tsx scripts/fetch-yahoo.ts --limit 300
 *   npx tsx scripts/fetch-yahoo.ts --category tech
 *   ONLY_MATCHED=1 で 楽天マッチ済(実在確度高)を優先 / --refresh で再取得
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { CATALOG } from "../src/lib/affiliates/catalog";
import { searchItems, type YahooItem } from "../src/lib/yahoo/client";

const HERE = dirname(fileURLToPath(import.meta.url));
const CACHE_PATH = resolve(HERE, "../src/lib/affiliates/yahoo-cache.json");
const RK_PATH = resolve(HERE, "../src/lib/affiliates/rakuten-cache.json");

type Entry = {
  url: string | null;
  price: number | null;
  priceMin?: number | null;
  priceMax?: number | null;
  image: string | null;
  review?: number;
  reviewCount?: number;
  name?: string;
  fetchedAt: string;
};
type Cache = Record<string, Entry>;

const args = process.argv.slice(2);
const limit = numFlag("--limit");
const category = strFlag("--category");
const refresh = args.includes("--refresh");
const onlyMatched = process.env.ONLY_MATCHED === "1";
const STALE_DAYS = Number(process.env.STALE_DAYS ?? "60");
const today = new Date().toISOString().slice(0, 10);

function numFlag(f: string): number | null { const i = args.indexOf(f); return i >= 0 && args[i + 1] ? Number(args[i + 1]) : null; }
function strFlag(f: string): string | null { const i = args.indexOf(f); return i >= 0 ? args[i + 1] ?? null : null; }
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
function daysBetween(a: string, b: string): number { return Math.abs((+new Date(a) - +new Date(b)) / 86400000); }
function norm(s: string): string { return s.toLowerCase().replace(/[\s　・,，.。:：()（）[\]【】|/_–—-]+/g, ""); }
function brandTokens(en?: string, ja?: string): string[] {
  const t: string[] = [];
  const e = (en ?? "").trim().split(/\s+/)[0] ?? "";
  if (e.length >= 3) t.push(norm(e));
  if (ja) { const j = norm(ja); if (j.length >= 3) t.push(j.slice(0, 5)); }
  return t;
}
function pickWithRange(items: YahooItem[], tokens: string[]) {
  if (!items.length) return null;
  const relevant = tokens.length ? items.filter((it) => tokens.some((t) => norm(it.name).includes(t))) : items;
  const top = relevant[0] ?? items[0];
  const anchor = top.price > 0 ? top.price : relevant.find((i) => i.price > 0)?.price ?? 0;
  const band = anchor > 0 ? relevant.filter((i) => i.price >= anchor * 0.6 && i.price <= anchor * 1.8) : relevant.filter((i) => i.price > 0);
  const prices = (band.length ? band : [top]).map((i) => i.price).filter((p) => p > 0);
  return { top, priceMin: prices.length ? Math.min(...prices) : null, priceMax: prices.length ? Math.max(...prices) : null };
}

async function main() {
  const cache: Cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf-8")) : {};
  const rk: Record<string, { itemUrl?: string | null }> = existsSync(RK_PATH) ? JSON.parse(readFileSync(RK_PATH, "utf-8")) : {};

  let offers = CATALOG;
  if (category) offers = offers.filter((o) => o.category === category);
  if (onlyMatched) offers = offers.filter((o) => rk[o.id]?.itemUrl);

  const todo = offers.filter((o) => {
    const c = cache[o.id];
    if (!c) return true;
    if (refresh) return true;
    return daysBetween(c.fetchedAt, today) >= STALE_DAYS;
  });
  const batch = limit ? todo.slice(0, limit) : todo;
  console.log(`対象 ${batch.length} 件（全${offers.length} / キャッシュ済${Object.keys(cache).length}）`);

  let done = 0, hit = 0;
  for (const offer of batch) {
    const keyword = offer.name.ja ?? offer.name.en ?? offer.id;
    const tokens = brandTokens(offer.name.en, offer.name.ja);
    try {
      let items: YahooItem[] = [];
      for (let a = 0; a < 4; a++) {
        try { items = await searchItems(keyword, { hits: 30 }); break; }
        catch (e) { if ((e as { rateLimited?: boolean }).rateLimited) { await sleep(2000 * (a + 1)); continue; } throw e; }
      }
      const picked = pickWithRange(items, tokens);
      cache[offer.id] = picked
        ? { url: picked.top.url, price: picked.top.price, priceMin: picked.priceMin, priceMax: picked.priceMax, image: picked.top.image, review: picked.top.review, reviewCount: picked.top.reviewCount, name: picked.top.name, fetchedAt: today }
        : { url: null, price: null, priceMin: null, priceMax: null, image: null, fetchedAt: today };
      if (picked) hit++;
    } catch (e) {
      const msg = (e as Error).message;
      console.warn(`  ! ${offer.id} (${keyword}): ${msg}`);
      if (/400|bad_request|invalid/i.test(msg)) cache[offer.id] = { url: null, price: null, priceMin: null, priceMax: null, image: null, fetchedAt: today };
    }
    done++;
    if (done % 25 === 0) { writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 0)); console.log(`  ...${done}/${batch.length} (hit ${hit})`); }
    await sleep(300);
  }
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 0));
  console.log(`完了: ${done}件 / ヒット${hit} / 総${Object.keys(cache).length}件 → ${CACHE_PATH}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
