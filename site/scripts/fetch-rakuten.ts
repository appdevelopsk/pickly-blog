/**
 * 楽天商品データ補完スクリプト（2026-06-20）。
 *
 * カタログ各商品名で楽天市場を検索し、最安1件の {itemUrl, price, image} を
 * `src/lib/affiliates/rakuten-cache.json` にキャッシュ。サイトはこのJSONを読むだけ
 * （ビルド時API呼び出し無し）。アフィリリンクは itemUrl を自前 hgc で包む（呼出側）。
 *
 * 使い方（要 env: RAKUTEN_APP_ID / RAKUTEN_ACCESS_KEY / AFFILIATE_RAKUTEN_AFFILIATE_ID）:
 *   npx tsx scripts/fetch-rakuten.ts                 # 未取得を全件（レート約1/秒）
 *   npx tsx scripts/fetch-rakuten.ts --limit 100     # 未取得を100件だけ
 *   npx tsx scripts/fetch-rakuten.ts --category food # カテゴリ限定
 *   npx tsx scripts/fetch-rakuten.ts --refresh       # 取得済も再取得（価格更新）
 *   STALE_DAYS=30 で既存キャッシュの再取得閾値を変更
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { CATALOG } from "../src/lib/affiliates/catalog";
import { searchTopItem } from "../src/lib/rakuten/client";

const HERE = dirname(fileURLToPath(import.meta.url));
const CACHE_PATH = resolve(HERE, "../src/lib/affiliates/rakuten-cache.json");

type CacheEntry = {
  itemUrl: string | null; // null = 検索ヒット無し（再取得を抑制）
  price: number | null;
  image: string | null;
  shop?: string;
  name?: string; // マッチした楽天商品名（関連性ガード用）
  fetchedAt: string; // YYYY-MM-DD
};
type Cache = Record<string, CacheEntry>;

const args = process.argv.slice(2);
const limit = numFlag("--limit");
const category = strFlag("--category");
const refresh = args.includes("--refresh");
const STALE_DAYS = Number(process.env.STALE_DAYS ?? "60");
const today = new Date().toISOString().slice(0, 10);

function numFlag(f: string): number | null {
  const i = args.indexOf(f);
  return i >= 0 && args[i + 1] ? Number(args[i + 1]) : null;
}
function strFlag(f: string): string | null {
  const i = args.indexOf(f);
  return i >= 0 ? args[i + 1] ?? null : null;
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
function daysBetween(a: string, b: string): number {
  return Math.abs((+new Date(a) - +new Date(b)) / 86400000);
}

async function main() {
  const cache: Cache = existsSync(CACHE_PATH)
    ? JSON.parse(readFileSync(CACHE_PATH, "utf-8"))
    : {};

  let offers = CATALOG;
  if (category) offers = offers.filter((o) => o.category === category);

  // 未取得 or stale を対象に
  const todo = offers.filter((o) => {
    const c = cache[o.id];
    if (!c) return true;
    if (refresh) return true;
    return daysBetween(c.fetchedAt, today) >= STALE_DAYS;
  });
  const batch = limit ? todo.slice(0, limit) : todo;
  console.log(
    `対象 ${batch.length} 件（全${offers.length} / キャッシュ済${Object.keys(cache).length}）`,
  );

  let done = 0;
  let hit = 0;
  for (const offer of batch) {
    const keyword = offer.name.ja ?? offer.name.en ?? offer.id;
    try {
      let item = null;
      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          item = await searchTopItem(keyword);
          break;
        } catch (e) {
          if ((e as { rateLimited?: boolean }).rateLimited) {
            await sleep(2000 * (attempt + 1));
            continue;
          }
          throw e;
        }
      }
      cache[offer.id] = item
        ? { itemUrl: item.itemUrl, price: item.price, image: item.image, shop: item.shop, name: item.name, fetchedAt: today }
        : { itemUrl: null, price: null, image: null, fetchedAt: today };
      if (item) hit++;
    } catch (e) {
      console.warn(`  ! ${offer.id} (${keyword}): ${(e as Error).message}`);
    }
    done++;
    if (done % 25 === 0) {
      writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 0));
      console.log(`  ...${done}/${batch.length} (hit ${hit})`);
    }
    await sleep(1200); // レート制限（約1req/秒）に余裕
  }

  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 0));
  console.log(`完了: ${done}件処理 / ヒット${hit} / 総キャッシュ${Object.keys(cache).length}件 → ${CACHE_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
