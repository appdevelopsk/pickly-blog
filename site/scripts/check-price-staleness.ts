/**
 * 価格データの鮮度ゲート。
 *
 * なぜ必要か: 2026-08-21 に Amazon 価格の取得が止まったが、日次の
 * 「価格履歴を1点追記」コミットだけは動き続けたため、**19日間誰も気づかなかった**。
 * コミットが積まれること自体は鮮度の証拠にならない。ここで実データの日付を見て、
 * 閾値を超えたら CI を赤くする（＝止まったら気づける）。
 *
 *   npx tsx scripts/check-price-staleness.ts
 *   MAX_AGE_DAYS=10 npx tsx scripts/check-price-staleness.ts
 *   WARN_ONLY=1 ...   閾値超過でも exit 0（移行期間中はこちら）
 *
 * 判定対象:
 *   1. rakuten-cache.json / yahoo-cache.json の fetchedAt の最頻値
 *   2. price-history.json の最終日付
 *   3. PRICE_ASOF の最新日付（PA-API が実際に価格を取れているか）
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PRICE_ASOF } from "../src/lib/affiliates/prices-override";

const HERE = dirname(fileURLToPath(import.meta.url));
const RK = resolve(HERE, "../src/lib/affiliates/rakuten-cache.json");
const YH = resolve(HERE, "../src/lib/affiliates/yahoo-cache.json");
const HIST = resolve(HERE, "../src/lib/affiliates/price-history.json");

/** 楽天/Yahoo は週2回リフレッシュなので 10 日、PA-API は日次なので別枠で見る。 */
const MAX_AGE_DAYS = Number(process.env.MAX_AGE_DAYS ?? "10");
const WARN_ONLY = !!process.env.WARN_ONLY;

function daysAgo(iso: string): number {
  const then = Date.parse(`${iso}T00:00:00Z`);
  if (Number.isNaN(then)) return Number.POSITIVE_INFINITY;
  return Math.floor((Date.now() - then) / 86_400_000);
}

function readJson<T>(path: string, fallback: T): T {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return fallback;
  }
}

/** キャッシュ内で最も多い fetchedAt。1件だけ新しい外れ値に騙されないための最頻値。 */
function dominantFetchedAt(path: string): { date: string | null; count: number; total: number } {
  const cache = readJson<Record<string, { fetchedAt?: string }>>(path, {});
  const tally = new Map<string, number>();
  let total = 0;
  for (const entry of Object.values(cache)) {
    if (!entry?.fetchedAt) continue;
    total++;
    tally.set(entry.fetchedAt, (tally.get(entry.fetchedAt) ?? 0) + 1);
  }
  let date: string | null = null;
  let count = 0;
  for (const [d, c] of tally) {
    if (c > count) { date = d; count = c; }
  }
  return { date, count, total };
}

function latestHistoryDate(): string | null {
  const hist = readJson<Record<string, { d: string }[]>>(HIST, {});
  let latest: string | null = null;
  for (const series of Object.values(hist)) {
    const last = series[series.length - 1];
    if (last?.d && (!latest || last.d > latest)) latest = last.d;
  }
  return latest;
}

function latestAsOf(): { date: string | null; count: number } {
  let latest: string | null = null;
  let count = 0;
  for (const markets of Object.values(PRICE_ASOF)) {
    for (const d of Object.values(markets ?? {})) {
      if (!d) continue;
      count++;
      if (!latest || d > latest) latest = d;
    }
  }
  return { date: latest, count };
}

const problems: string[] = [];

function check(label: string, date: string | null, detail: string) {
  if (!date) {
    problems.push(`${label}: 日付なし (${detail})`);
    console.log(`  ✗ ${label}: 日付が取れません (${detail})`);
    return;
  }
  const age = daysAgo(date);
  const bad = age > MAX_AGE_DAYS;
  if (bad) problems.push(`${label}: ${date} (${age}日前, 閾値${MAX_AGE_DAYS}日)`);
  console.log(`  ${bad ? "✗" : "✓"} ${label}: ${date} (${age}日前) ${detail}`);
}

console.log(`価格データの鮮度チェック (閾値 ${MAX_AGE_DAYS} 日)`);

const rk = dominantFetchedAt(RK);
check("楽天キャッシュ", rk.date, `${rk.count}/${rk.total}件がこの日付`);

const yh = dominantFetchedAt(YH);
check("Yahooキャッシュ", yh.date, `${yh.count}/${yh.total}件がこの日付`);

check("価格履歴", latestHistoryDate(), "price-history.json の最終点");

// PA-API は資格情報が未登録なら 0 件で正常（移行期間）。0 件の時は落とさず警告に留める。
const asof = latestAsOf();
if (asof.count === 0) {
  console.log("  – Amazon(PA-API): 取得実績なし（PAAPI_* 未設定なら想定内。設定済みなら要調査）");
} else {
  check("Amazon(PA-API)", asof.date, `${asof.count}件に取得日あり`);
}

if (problems.length === 0) {
  console.log("\nOK: すべて閾値内です。");
  process.exit(0);
}

console.error(`\n古いデータが ${problems.length} 件あります:`);
for (const p of problems) console.error(`  - ${p}`);
console.error(
  "\n対処: npm run prices:refresh（楽天/Yahoo 全件・約3.5時間）または npm run prices:fetch（Amazon）。",
);
process.exit(WARN_ONLY ? 0 : 1);
