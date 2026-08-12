/**
 * YouTube 取得の優先リスト(youtube-priority-ids.txt)を「実流入順」で作り直す（2026-08-12）。
 *
 * なぜ作り直したか:
 *   旧リストは「掲載記事数の多い商品順」だったが、実測すると 3,903 スロットに対し
 *   ユニーク 3,851 商品 ＝ ほぼ全商品が1記事にしか出ない。並びが実質ランダムで、
 *   上位300件を取っても全体の 9% しか覆えない＝「上位に絞る」戦略が成立しなかった。
 *   YouTube API は 100検索/日しかないので、順番の良し悪しがそのまま成果を決める。
 *
 * 新しい順番:
 *   GA4 の直近90日 screenPageViews を記事スラッグ単位で集計し、閲覧の多い記事の
 *   offerIds から先に並べる（記事内の並び順も保つ＝上に出る商品ほど見られる）。
 *   pickly の実流入は Bing 経由なので、Google 依存の GSC ではなく GA4 を使う。
 *   GA4 に出てこない記事の商品は末尾に回す（取得は無駄にならず、後回しになるだけ）。
 *
 * 使い方:
 *   npx tsx scripts/build-youtube-priority.ts        （--days 90 / --dry）
 *   --dry は書き出さず先頭だけ表示。
 *
 * 認証: ~/Dropbox/pickly/.secrets/ga4-service-account.json（GA4_SA_PATH で上書き可）。
 *   gcloud の ADC は analytics スコープを持たず 403 になるので使わない。
 *   サービスアカウント鍵は失効しないので、日次ジョブから静かに落ちない。
 */
import { google } from "googleapis";
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, "youtube-priority-ids.txt");
const args = process.argv.slice(2);
const DAYS = Number(args[args.indexOf("--days") + 1]) || 90;
const DRY = args.includes("--dry");
const PROPERTY = process.env.GA4_PROPERTY_ID ?? "537610479";
const SA_PATH =
  process.env.GA4_SA_PATH ??
  "/Users/ken/Dropbox/pickly/.secrets/ga4-service-account.json";

/** 記事スラッグ → offerIds（meta.ts の記載順を保つ）。 */
function articleOffers(): Map<string, string[]> {
  const files = execSync("find src/articles -name meta.ts", {
    cwd: resolve(HERE, ".."),
    encoding: "utf-8",
  })
    .split("\n")
    .filter(Boolean);
  const map = new Map<string, string[]>();
  for (const f of files) {
    const src = readFileSync(resolve(HERE, "..", f), "utf-8");
    const m = src.match(/offerIds\s*:\s*\[([^\]]*)\]/s);
    if (!m?.[1]) continue;
    const ids = (m[1].match(/["'][^"']+["']/g) ?? []).map((q) => q.slice(1, -1));
    map.set(basename(dirname(f)), ids);
  }
  return map;
}

/** GA4: 記事スラッグ → 直近DAYS日の閲覧数。 */
async function pageViews(): Promise<Map<string, number>> {
  const sa = JSON.parse(readFileSync(SA_PATH, "utf-8"));
  const auth = new google.auth.JWT({
    email: sa.client_email,
    key: sa.private_key,
    scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
  });
  const data = google.analyticsdata({ version: "v1beta", auth });
  const views = new Map<string, number>();
  const res = await data.properties.runReport({
    property: `properties/${PROPERTY}`,
    requestBody: {
      dateRanges: [{ startDate: `${DAYS}daysAgo`, endDate: "today" }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      limit: "10000",
    },
  });
  for (const row of res.data.rows ?? []) {
    const path = row.dimensionValues?.[0]?.value ?? "";
    const n = Number(row.metricValues?.[0]?.value ?? 0);
    // /<locale>/<slug> も /<slug> も同じ記事として合算する（言語横断の人気度）。
    const slug = path.split("?")[0]!.replace(/\/$/, "").split("/").pop() ?? "";
    if (!slug) continue;
    views.set(slug, (views.get(slug) ?? 0) + n);
  }
  return views;
}

async function main() {
  const offers = articleOffers();
  const views = await pageViews();

  const ranked = [...offers.entries()].sort(
    (a, b) => (views.get(b[0]) ?? 0) - (views.get(a[0]) ?? 0),
  );

  const out: string[] = [];
  const seen = new Set<string>();
  // 記事の閲覧数降順 → 記事内の記載順（上に出る商品ほど見られる）。
  for (const [, ids] of ranked)
    for (const id of ids) if (!seen.has(id)) (seen.add(id), out.push(id));
  // 旧リストにしか無い商品（記事から外れた等）は末尾に温存。
  for (const id of readFileSync(OUT, "utf-8").split(/\r?\n/).filter(Boolean))
    if (!seen.has(id)) (seen.add(id), out.push(id));

  const withViews = ranked.filter(([s]) => views.get(s));
  const top300 = new Set(out.slice(0, 300));
  let covered = 0;
  let total = 0;
  for (const [slug, ids] of ranked) {
    const v = views.get(slug) ?? 0;
    total += v;
    if (ids.some((id) => top300.has(id))) covered += v;
  }
  console.log(
    `記事 ${offers.size} 本 / GA4に出た記事 ${withViews.length} 本 / 商品 ${out.length} 件`,
  );
  console.log(
    `上位300商品でカバーされる閲覧: ${covered}/${total} (${total ? ((100 * covered) / total).toFixed(1) : 0}%)`,
  );
  console.log("先頭10:", out.slice(0, 10).join(", "));
  if (DRY) return;
  writeFileSync(OUT, out.join("\n") + "\n");
  console.log(`書き出し: ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
