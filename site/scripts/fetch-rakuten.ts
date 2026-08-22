/**
 * 楽天商品データ補完スクリプト（2026-06-20）。
 *
 * カタログ各商品名で楽天市場を検索し、関連性ガードを通った1件の {itemUrl, price, image} を
 * `src/lib/affiliates/rakuten-cache.json` にキャッシュ。サイトはこのJSONを読むだけ
 * （ビルド時API呼び出し無し）。アフィリリンクは itemUrl を自前 hgc で包む（呼出側）。
 *
 * 使い方（要 env: RAKUTEN_APP_ID / RAKUTEN_ACCESS_KEY。アフィリIDは
 *   AFFILIATE_RAKUTEN_AFFILIATE_ID / RAKUTEN_AFFILIATE_ID / NEXT_PUBLIC_RAKUTEN_AFFILIATE_ID のいずれか）:
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
import { keywordCandidates } from "../src/lib/rakuten/keywords";

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

// 関連性ガードは楽天/Yahoo 共通。以前は各スクリプトにコピーがあり、片方だけ
// 直して測定が無効になる事故が起きたため src/lib/affiliates/match-guard.ts に一本化した。
import { pickWithRange, guardsFor } from "../src/lib/affiliates/match-guard";

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
    const candidates = keywordCandidates(offer.name.ja, offer.name.en);
    if (candidates.length === 0) candidates.push(offer.id);
    const { tokens, prodTokens, codes, cats } = guardsFor(offer.name.ja, offer.name.en);
    let keyword = candidates[0];
    try {
      // 具体的な候補から順に試し、関連性ガードを通った時点で打ち切る。
      // 商品名を丸ごと投げると修飾語過多で0件になりやすいため（2026-08-20実測）。
      let picked: ReturnType<typeof pickWithRange> = null;
      for (const cand of candidates) {
        keyword = cand;
        let items: RakutenItem[] = [];
        for (let attempt = 0; attempt < 4; attempt++) {
          try {
            items = await searchItems(cand, { hits: 30 });
            break;
          } catch (e) {
            if ((e as { rateLimited?: boolean }).rateLimited) {
              await sleep(2000 * (attempt + 1));
              continue;
            }
            throw e;
          }
        }
        picked = pickWithRange(items, tokens, prodTokens, codes, cats);
        if (picked) break;
        await sleep(1200); // 候補間もレート制限を守る
      }
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
      // 以前は RWS 400 を恒久エラー扱いで no-hit キャッシュしていたが、実際の原因は
      // キーワード中の `%` `+` だった（2026-08-20 判明）。sanitizeKeyword() で除去済みの
      // 今は 400 は一時的な異常とみなし、キャッシュせず次回再試行させる。
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
