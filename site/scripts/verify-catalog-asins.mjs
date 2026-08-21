/**
 * catalog.ts の amazon-us リンクの ASIN が実在するかを検査する。
 *
 * 背景 (2026-08-22):
 *   catalog.ts には US の ASIN を de/uk/ca/jp へ機械的にコピーした
 *   リンクが 2,172 行あり、ASIN は国をまたげないため除去した。
 *   残る amazon-us 自体も DDG 由来の廃番 ASIN が混ざっている
 *   (PV上位30件の実測で複数が 404)。ここを HTTP で洗い出す。
 *
 * Node の fetch は Amazon にブロックされるため curl を使う。
 *
 * 使い方:  node scripts/verify-catalog-asins.mjs
 *          LIMIT=50 DELAY_MS=2000 node scripts/verify-catalog-asins.mjs
 * 出力:    scripts/logs/catalog-asin-verify.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CATALOG = path.join(HERE, "../src/lib/affiliates/catalog.ts");
const OUT_PATH = path.join(HERE, "logs/catalog-asin-verify.json");
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const DELAY_MS = Number(process.env.DELAY_MS ?? 1500);
const LIMIT = Number(process.env.LIMIT ?? 0);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** offerId 付きで amazon-us の ASIN を集める。 */
function collect() {
  const lines = fs.readFileSync(CATALOG, "utf8").split("\n");
  const out = [];
  let cur = null;
  for (const l of lines) {
    const id = /^    id: "([^"]+)",\s*$/.exec(l);
    if (id) cur = id[1];
    const m = /network:\s*"amazon-us",\s*productId:\s*"([A-Z0-9]{10})"/.exec(l);
    if (m && cur) out.push({ id: cur, asin: m[1] });
  }
  return out;
}

/** 1件検査。null はブロック等で判定不能を意味し、呼び側で再試行する。 */
function probe(asin) {
  const out = execFileSync("curl", [
    "-sL", "--max-time", "30", "-A", UA,
    "-H", "Accept-Language: en-US,en;q=0.9",
    "-H", "Accept: text/html,application/xhtml+xml",
    "-w", "\n@@STATUS@@%{http_code}",
    `https://www.amazon.com/dp/${asin}`,
  ], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  const cut = out.lastIndexOf("\n@@STATUS@@");
  const body = cut >= 0 ? out.slice(0, cut) : out;
  const status = Number(cut >= 0 ? out.slice(cut + 11) : 0);
  // Amazon の正規404本文にも "To discuss automated access" が入るため、
  // bot 判定は 200 応答に限る (bot ページは常に 200 で返る)。
  if (status === 200 && /Robot Check|Enter the characters you see|Type the characters you see/i.test(body)) return null;
  const title = (body.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "").replace(/\s+/g, " ").trim();
  return { status, title: title.slice(0, 200) };
}

async function main() {
  const all = collect();
  const work = LIMIT ? all.slice(0, LIMIT) : all;
  const out = fs.existsSync(OUT_PATH) ? JSON.parse(fs.readFileSync(OUT_PATH, "utf8")) : {};
  let alive = 0, dead = 0, blocked = 0, i = 0;
  for (const { id, asin } of work) {
    i++;
    if (out[id]?.asin === asin) { out[id].status === 200 ? alive++ : dead++; continue; }
    let r = null;
    for (let a = 0; a < 3 && !r; a++) {
      try { r = probe(asin); } catch { r = null; }
      if (!r) await sleep(5000);
    }
    if (!r) { blocked++; console.log(`? ${id} ${asin} ブロック/取得不能`); continue; }
    out[id] = { asin, status: r.status, title: r.title };
    r.status === 200 ? alive++ : dead++;
    if (r.status !== 200) console.log(`DEAD ${id} ${asin} (${r.status})`);
    if (i % 25 === 0 || i === work.length) {
      fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
      console.log(`${i}/${work.length}  生存 ${alive} / 死亡 ${dead} / 不明 ${blocked}`);
    }
    await sleep(DELAY_MS);
  }
  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
  console.log(`\n完了: 生存 ${alive} / 死亡 ${dead} / 不明 ${blocked} → ${OUT_PATH}`);
}
main();
