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
import { searchItems, type RakutenItem } from "../src/lib/rakuten/client";

const HERE = dirname(fileURLToPath(import.meta.url));
const CACHE_PATH = resolve(HERE, "../src/lib/affiliates/rakuten-cache.json");

type CacheEntry = {
  itemUrl: string | null; // null = 検索ヒット無し（再取得を抑制）
  price: number | null; // 関連性最上位の価格
  priceMin?: number | null; // 関連商品の最安（価格レンジ用）
  priceMax?: number | null; // 関連商品の最高
  image: string | null;
  shop?: string;
  name?: string; // マッチした楽天商品名（関連性ガード用）
  reviewAverage?: number; // 楽天レビュー平均(0-5)
  reviewCount?: number; // 楽天レビュー件数
  fetchedAt: string; // YYYY-MM-DD
};

function norm(s: string): string {
  return s.toLowerCase().replace(/[\s　・,，.。:：()（）[\]【】|/_–—-]+/g, "");
}
// 商品名の主要トークン（en先頭語 + ja先頭5字）。関連商品の絞り込みに使う。
function brandTokens(nameEn?: string, nameJa?: string): string[] {
  const t: string[] = [];
  const en = (nameEn ?? "").trim().split(/\s+/)[0] ?? "";
  if (en.length >= 3) t.push(norm(en));
  if (nameJa) {
    const j = norm(nameJa);
    if (j.length >= 3) t.push(j.slice(0, 5));
  }
  return t;
}
// 取得した候補から、関連商品(トークン一致)に絞って 最上位/最安/最高 を出す。
function pickWithRange(
  items: RakutenItem[],
  tokens: string[],
): { top: RakutenItem; priceMin: number | null; priceMax: number | null } | null {
  if (items.length === 0) return null;
  const relevant = tokens.length
    ? items.filter((it) => tokens.some((t) => norm(it.name).includes(t)))
    : items;
  const top = relevant[0] ?? items[0];
  // 外れ値除去: 最上位(代表)価格の 0.6〜1.8倍に収まる関連商品だけで価格レンジを作る。
  // （アクセサリ=極端に安い / 別モデル・バンドル=極端に高い を排除し、同一商品帯の幅にする）
  const anchor = top.price > 0 ? top.price : relevant.find((i) => i.price > 0)?.price ?? 0;
  const band =
    anchor > 0
      ? relevant.filter((i) => i.price >= anchor * 0.6 && i.price <= anchor * 1.8)
      : relevant.filter((i) => i.price > 0);
  const prices = (band.length ? band : [top]).map((i) => i.price).filter((p) => p > 0);
  return {
    top,
    priceMin: prices.length ? Math.min(...prices) : null,
    priceMax: prices.length ? Math.max(...prices) : null,
  };
}
type Cache = Record<string, CacheEntry>;

const args = process.argv.slice(2);
const limit = numFlag("--limit");
const category = strFlag("--category");
const refresh = args.includes("--refresh");
const rangesMode = args.includes("--ranges");
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

  // 対象選定。--ranges: 既存ヒット(itemUrl有)で priceMax 未取得のものだけ再取得して
  // 価格レンジを後付け。通常: 未取得 or stale。
  const todo = offers.filter((o) => {
    const c = cache[o.id];
    if (rangesMode) return !!c && !!c.itemUrl && (c.priceMax == null || c.reviewCount == null);
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
    const tokens = brandTokens(offer.name.en, offer.name.ja);
    try {
      let items: RakutenItem[] = [];
      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          items = await searchItems(keyword, { hits: 30 });
          break;
        } catch (e) {
          if ((e as { rateLimited?: boolean }).rateLimited) {
            await sleep(2000 * (attempt + 1));
            continue;
          }
          throw e;
        }
      }
      const picked = pickWithRange(items, tokens);
      cache[offer.id] = picked
        ? {
            itemUrl: picked.top.itemUrl,
            price: picked.top.price,
            priceMin: picked.priceMin,
            priceMax: picked.priceMax,
            image: picked.top.image,
            shop: picked.top.shop,
            name: picked.top.name,
            reviewAverage: picked.top.reviewAverage,
            reviewCount: picked.top.reviewCount,
            fetchedAt: today,
          }
        : { itemUrl: null, price: null, priceMin: null, priceMax: null, image: null, fetchedAt: today };
      if (picked) hit++;
    } catch (e) {
      const msg = (e as Error).message;
      console.warn(`  ! ${offer.id} (${keyword}): ${msg}`);
      // 恒久エラー(RWSが弾く無効キーワード等)は no-hit でキャッシュし、毎日の再試行を抑制。
      if (/keyword is not valid|wrong_parameter|RWS 400/.test(msg)) {
        cache[offer.id] = { itemUrl: null, price: null, priceMin: null, priceMax: null, image: null, fetchedAt: today };
      }
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
