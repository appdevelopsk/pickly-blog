/**
 * asin-cache.json / catalog-asins.csv の ASIN が実在するかを HTTP で検査する。
 *
 * 背景 (2026-08-21):
 *   resolve-amazon-asins.mjs は DuckDuckGo 画像検索の結果 URL から /dp/ASIN を
 *   正規表現で拾うだけで、存在確認をしていない。DDG のインデックスは古く、
 *   廃番商品の ASIN をそのまま掴む。PV上位30件の実測で 17/30 が 404 だった。
 *
 * 使い方:
 *   node scripts/verify-asins.mjs            # cache 全件を検査
 *   LIMIT=50 node scripts/verify-asins.mjs
 * 出力:
 *   scripts/logs/asin-verify.json  … { [offerId]: { asin, status, title } }
 *   終了コードは常に 0（レポート用途。ゲートは別途 CSV を見る）
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MARKET = (process.env.MARKET ?? "us").toLowerCase();
const SUFFIX = MARKET === "jp" ? "-jp" : "";
const DOMAIN = MARKET === "jp" ? "amazon.co.jp" : "amazon.com";
const CACHE_PATH = path.join(HERE, `logs/asin-cache${SUFFIX}.json`);
const OUT_PATH = path.join(HERE, `logs/asin-verify${SUFFIX}.json`);
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const DELAY_MS = Number(process.env.DELAY_MS ?? 1500);
const LIMIT = Number(process.env.LIMIT ?? 0);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 1件検査。404=存在しない / 200=存在。ブロック時は null を返して呼び側で再試行。 */
async function probe(asin) {
  // Node の fetch は Amazon にブロックされる(全件 403/bot ページ)。curl は通るので curl を使う。
  const out = execFileSync("curl", [
    "-sL", "--max-time", "30", "-A", UA,
    "-H", "Accept-Language: en-US,en;q=0.9",
    "-H", "Accept: text/html,application/xhtml+xml",
    "-w", "\n@@STATUS@@%{http_code}",
    `https://www.${DOMAIN}/dp/${asin}`,
  ], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  const cut = out.lastIndexOf("\n@@STATUS@@");
  const body = cut >= 0 ? out.slice(0, cut) : out;
  const res = { status: Number(cut >= 0 ? out.slice(cut + 11) : 0) };
  const title = (body.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "").replace(/\s+/g, " ").trim();
  // bot 対策ページは 200 で返るので本文で判別する。
  // 注: api-services-support@amazon は正規の 404 ページにも出るので使わない。
  if (/Robot Check|Enter the characters you see|To discuss automated access/i.test(body)) return null;
  return { status: res.status, title: title.slice(0, 200) };
}

async function main() {
  const cache = JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
  const entries = Object.entries(cache).filter(([, v]) => v?.asin);
  const work = LIMIT ? entries.slice(0, LIMIT) : entries;
  const prev = fs.existsSync(OUT_PATH) ? JSON.parse(fs.readFileSync(OUT_PATH, "utf8")) : {};
  const out = { ...prev };

  let alive = 0, dead = 0, i = 0;
  for (const [id, v] of work) {
    i++;
    // 同じ ASIN を再検査しない（前回結果を流用）。
    if (out[id]?.asin === v.asin) { out[id].status === 200 ? alive++ : dead++; continue; }
    let r = null;
    for (let attempt = 0; attempt < 3 && !r; attempt++) {
      try { r = await probe(v.asin); } catch { r = null; }
      if (!r) await sleep(5000);
    }
    if (!r) { console.log(`? ${id} ${v.asin} ブロック/取得不能`); continue; }
    out[id] = { asin: v.asin, name: v.name, status: r.status, title: r.title };
    r.status === 200 ? alive++ : dead++;
    if (i % 10 === 0 || i === work.length) {
      fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
      console.log(`${i}/${work.length}  生存 ${alive} / 死亡 ${dead}`);
    }
    await sleep(DELAY_MS);
  }
  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
  console.log(`\n生存 ${alive} / 死亡 ${dead} → ${OUT_PATH}`);
}

main();
