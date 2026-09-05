/**
 * 価格スナップショット（2026-09-05）。
 *
 * rakuten-cache.json / yahoo-cache.json の「今日の値」を price-history.json に1点追記する。
 * **外部APIは一切叩かない**（キャッシュを読むだけ）。キャッシュの更新は
 * scripts/fetch-rakuten.ts / scripts/fetch-yahoo.ts の役目。
 *
 * スキーマ: { "<offer-id>": [ {"d":"YYYY-MM-DD","r":<楽天円>,"y":<Yahoo円>}, ... ] }
 *   - r / y は欠測なら省略（両方欠測の日はその商品の点自体を作らない）
 *   - 同一日は上書き（1日1点）
 *   - 直近 KEEP=14 点で切り捨て（3,933件 x 14点 で概ね 1〜2MB）
 *
 * 金額の決め方は generate-products-data.ts の rangePrice() と同じ規則に揃える:
 *   priceMin/priceMax が有効なレンジなら priceMin、それ以外は price ?? priceMin。
 *   ここがズレると「表示は据え置きなのに値下げバッジが出る」事故になる。
 *
 *   npx tsx scripts/snapshot-prices.ts
 *   DRY_RUN=1 で書き込まずに件数だけ出す
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const RK_PATH = resolve(HERE, "../src/lib/affiliates/rakuten-cache.json");
const YH_PATH = resolve(HERE, "../src/lib/affiliates/yahoo-cache.json");
const HISTORY_PATH = resolve(HERE, "../src/lib/affiliates/price-history.json");

const KEEP = 14;

type Point = { d: string; r?: number; y?: number };
type History = Record<string, Point[]>;

type CacheEntry = {
  price?: number | null;
  priceMin?: number | null;
  priceMax?: number | null;
};

/** generate-products-data.ts の rangePrice() と同じ金額規則 */
function amountOf(e: CacheEntry | undefined): number | null {
  if (!e) return null;
  const price = e.price ?? null;
  const min = e.priceMin ?? null;
  const max = e.priceMax ?? null;
  if (min != null && max != null && max > min && max <= min * 3) return min;
  const p = price ?? min;
  return typeof p === "number" && p > 0 ? p : null;
}

function readJson<T>(path: string, fallback: T): T {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function today(): string {
  // JST 基準の日付（CI は UTC で回るため +9h してから切る）
  const t = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return t.toISOString().slice(0, 10);
}

function main() {
  const rk = readJson<Record<string, CacheEntry>>(RK_PATH, {});
  const yh = readJson<Record<string, CacheEntry>>(YH_PATH, {});
  const history = readJson<History>(HISTORY_PATH, {});
  const d = today();

  const ids = new Set([...Object.keys(rk), ...Object.keys(yh)]);
  let withPoint = 0;
  let updated = 0;
  let appended = 0;

  for (const id of ids) {
    const r = amountOf(rk[id]);
    const y = amountOf(yh[id]);
    if (r == null && y == null) continue;
    withPoint++;

    const point: Point = { d };
    if (r != null) point.r = r;
    if (y != null) point.y = y;

    const series = history[id] ?? [];
    const last = series.length ? series[series.length - 1] : null;
    if (last && last.d === d) {
      series[series.length - 1] = point; // 同一日は上書き
      updated++;
    } else {
      series.push(point);
      appended++;
    }
    history[id] = series.length > KEEP ? series.slice(series.length - KEEP) : series;
  }

  const kept = Object.keys(history).length;
  console.log(
    `date=${d} cache=${ids.size} withPrice=${withPoint} appended=${appended} updated=${updated} products=${kept}`,
  );

  if (process.env.DRY_RUN) {
    console.log("DRY_RUN=1 のため書き込みませんでした。");
    return;
  }
  writeFileSync(HISTORY_PATH, JSON.stringify(history) + "\n");
  console.log(`wrote ${HISTORY_PATH}`);
}

main();
