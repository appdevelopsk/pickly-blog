/**
 * YouTube レビュー動画 補完スクリプト（2026-06-20）。
 *
 * カタログ各商品で「{商品名} レビュー」を検索し、関連性の高い動画を1本
 * `src/lib/affiliates/youtube-cache.json` にキャッシュ。サイトはこれを読んで埋め込み。
 *
 * クォータ: search=100units/1日10,000 ≒ 100検索/日。--limit で制御（既定90）。
 * 超過したら保存して停止（翌日 or 枠拡大後に再実行で続き）。idempotent。
 *
 * 使い方（要 env YOUTUBE_API_KEY）:
 *   npx tsx scripts/fetch-youtube.ts                # 未取得を最大90件
 *   npx tsx scripts/fetch-youtube.ts --limit 50
 *   npx tsx scripts/fetch-youtube.ts --category tech
 *   ONLY_MATCHED=1 で 楽天マッチ済(実在確度高)の商品を優先
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { CATALOG } from "../src/lib/affiliates/catalog";
import { searchReviewVideos } from "../src/lib/youtube/client";

const HERE = dirname(fileURLToPath(import.meta.url));
const CACHE_PATH = resolve(HERE, "../src/lib/affiliates/youtube-cache.json");
const RK_PATH = resolve(HERE, "../src/lib/affiliates/rakuten-cache.json");

type Entry = { videoId: string | null; title?: string; channel?: string; fetchedAt: string };
type Cache = Record<string, Entry>;

const args = process.argv.slice(2);
const limit = numFlag("--limit") ?? 90;
const category = strFlag("--category");
const onlyMatched = process.env.ONLY_MATCHED === "1";
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
function norm(s: string): string {
  return s.toLowerCase().replace(/[\s　・,，.。:：()（）[\]【】|/_–—-]+/g, "");
}
// 商品の識別トークン（en各語 + 型番らしき英数字 + ja先頭）。動画タイトルとの一致判定用。
function tokens(nameEn?: string, nameJa?: string): string[] {
  const t = new Set<string>();
  for (const w of (nameEn ?? "").split(/\s+/)) {
    const n = norm(w);
    if (n.length >= 3) t.add(n);
  }
  if (nameJa) {
    const j = norm(nameJa);
    if (j.length >= 3) t.add(j.slice(0, 6));
  }
  return [...t];
}

async function main() {
  const cache: Cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf-8")) : {};
  const rk: Record<string, { itemUrl?: string | null }> = existsSync(RK_PATH)
    ? JSON.parse(readFileSync(RK_PATH, "utf-8"))
    : {};

  let offers = CATALOG;
  if (category) offers = offers.filter((o) => o.category === category);
  // 楽天マッチ済(実在確度が高い)商品を優先すると無駄打ちが減る
  if (onlyMatched) offers = offers.filter((o) => rk[o.id]?.itemUrl);

  const todo = offers.filter((o) => !cache[o.id]).slice(0, limit);
  console.log(`対象 ${todo.length} 件（キャッシュ済${Object.keys(cache).length}）`);

  let done = 0;
  let hit = 0;
  for (const offer of todo) {
    const query = offer.name.ja ?? offer.name.en ?? offer.id;
    const tks = tokens(offer.name.en, offer.name.ja);
    const result = await searchReviewVideos(query, { locale: "ja", max: 5 });
    if ("quotaExceeded" in result) {
      console.log(`! クォータ超過で停止（${done}件処理済・翌日/枠拡大後に再実行で続き）`);
      break;
    }
    // 関連性ガード: 動画タイトルに商品トークンが含まれる最初の動画を採用
    const match = result.find((v) => {
      const tn = norm(v.title);
      return tks.some((t) => t.length >= 3 && tn.includes(t));
    });
    cache[offer.id] = match
      ? { videoId: match.videoId, title: match.title, channel: match.channel, fetchedAt: today }
      : { videoId: null, fetchedAt: today };
    if (match) hit++;
    done++;
    if (done % 20 === 0) {
      writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 0));
      console.log(`  ...${done}/${todo.length} (hit ${hit})`);
    }
    await sleep(150);
  }
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 0));
  console.log(`完了: ${done}件処理 / 動画ヒット${hit} / 総キャッシュ${Object.keys(cache).length}件 → ${CACHE_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
