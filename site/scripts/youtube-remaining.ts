/**
 * 指定ロケールで「優先リスト(youtube-priority-ids.txt)のうち未取得の件数」を出す。
 * fetch-youtube-daily.sh が次に回す言語を選ぶために使う（標準出力は数字1行のみ）。
 *
 *   npx tsx scripts/youtube-remaining.ts de
 *
 * 優先リストの上限（既定1,000件）まで見る。全3,700商品×16言語は日次90件では
 * 現実的に終わらないため、掲載記事数の多い上位だけを対象にする。
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const TOP = Number(process.env.PRIORITY_TOP ?? 1000);
const lang = process.argv[2];
if (!lang) {
  console.error("usage: youtube-remaining.ts <locale>");
  process.exit(1);
}

const cachePath = resolve(
  HERE,
  lang === "ja"
    ? "../src/lib/affiliates/youtube-cache.json"
    : `../src/lib/affiliates/youtube-cache-${lang}.json`,
);
const cache: Record<string, unknown> = existsSync(cachePath)
  ? JSON.parse(readFileSync(cachePath, "utf-8"))
  : {};

const ids = readFileSync(resolve(HERE, "youtube-priority-ids.txt"), "utf-8")
  .split(/\r?\n/)
  .filter(Boolean)
  .slice(0, TOP);

console.log(ids.filter((id) => !(id in cache)).length);
