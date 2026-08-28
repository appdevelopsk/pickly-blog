/**
 * Yahoo!ショッピング 商品データ補完（2026-06-22）。
 * カタログ各商品名で検索→関連性ガード（楽天と共有）を通った1件 + 価格レンジ + レビュー を
 * `src/lib/affiliates/yahoo-cache.json` にキャッシュ。サイトはこれを読むだけ。
 *
 * ★env YAHOO_APP_ID と AFFILIATE_VALUECOMMERCE_SID は両方必須。SIDが無いと
 *   affiliate_type=vc が付かず生の store URL が返る＝無報酬リンクをキャッシュしてしまう。
 *   さらに VC未タグのURLはキャッシュに書かない(承認前の取得結果を本番に流さない)。
 *
 * 使い方（要 env YAHOO_APP_ID, AFFILIATE_VALUECOMMERCE_SID）:
 *   npx tsx scripts/fetch-yahoo.ts --limit 300
 *   npx tsx scripts/fetch-yahoo.ts --category tech
 *   ONLY_MATCHED=1 で 楽天マッチ済(実在確度高)を優先 / --refresh で再取得
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { CATALOG } from "../src/lib/affiliates/catalog";
import { searchItems, type YahooItem } from "../src/lib/yahoo/client";
// 関連性ガードとキーワード候補は楽天と共通。以前は各スクリプトにコピーがあり、
// 片方だけ直して測定が無効になる事故が起きたため共有モジュールに一本化した。
import { pickWithRange, guardsFor } from "../src/lib/affiliates/match-guard";
import { keywordCandidates } from "../src/lib/rakuten/keywords";
import { isTaggedVcUrl } from "../src/lib/affiliates/yahoo";

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

  let done = 0, hit = 0, untagged = 0;
  for (const offer of batch) {
    // 商品名を丸ごと投げると0件になりやすいので、具体的→一般的の候補列を順に試す。
    const candidates = keywordCandidates(offer.name.ja, offer.name.en);
    if (candidates.length === 0) candidates.push(offer.name.ja ?? offer.name.en ?? offer.id);
    const keyword = candidates[0]!;
    const { tokens, prodTokens, codes, cats } = guardsFor(offer.name.ja, offer.name.en);
    try {
      let picked: ReturnType<typeof pickWithRange<YahooItem>> = null;
      for (const cand of candidates) {
        let items: YahooItem[] = [];
        for (let a = 0; a < 4; a++) {
          try { items = await searchItems(cand, { hits: 30 }); break; }
          catch (e) { if ((e as { rateLimited?: boolean }).rateLimited) { await sleep(2000 * (a + 1)); continue; } throw e; }
        }
        picked = pickWithRange(items, tokens, prodTokens, codes, cats);
        if (picked) break;
        await sleep(300);
      }
      // ★VC未タグのURLはキャッシュしない。承認前/SID不備の取得結果を本番に流すと
      //   無報酬リンクを配信することになる(実際に本番2,920リンクが無タグだった)。
      if (picked && !isTaggedVcUrl(picked.top.url)) {
        console.warn(`  ! ${offer.id}: 無タグURLのためスキップ (${picked.top.url.slice(0, 60)})`);
        picked = null;
        untagged++;
      }
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
  console.log(`完了: ${done}件 / ヒット${hit} / 無タグ除外${untagged} / 総${Object.keys(cache).length}件 → ${CACHE_PATH}`);
  if (untagged > 0) console.warn(`※ ${untagged}件が無タグURLでした。VC管理画面で Yahoo!ショッピングとの提携が承認済みか確認してください。`);
}
main().catch((e) => { console.error(e); process.exit(1); });
