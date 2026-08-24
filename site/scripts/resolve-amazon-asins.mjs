/**
 * 「Amazon検索URL」を実在する商品ページ(/dp/ASIN)に置き換えるための ASIN 解決器。
 *
 * 背景 (2026-08-14):
 *   amazon-us リンクを持たないオファーは pickLink の localAmazonFallback により
 *   `amazon.com/s?k=<商品名>` の**検索結果**へ送られる。検索結果は競合商品が並ぶので
 *   せっかくのクリックが目的の商品に届かない。実在の /dp/ に差し替えたい。
 *
 * なぜ DuckDuckGo の画像検索なのか:
 *   - Amazon を直接叩かない（US アカウントは警告を受けているので絶対に叩かない）
 *   - DDG の html/lite エンドポイントは 202 で弾かれる。画像 API (i.js) だけが通る。
 *     画像結果には掲載元ページ URL が入っており、そこから /dp/ASIN が取れる。
 *     これは fetch-product-images.ts で実績のある経路。
 *
 * 取り違え防止:
 *   商品名のトークンが URL スラッグに MATCH_RATIO 以上含まれていない候補は捨てる。
 *   1件も残らなければ「解決できなかった」として CSV に出さない（検索URLのまま）。
 *
 * 実行:  node scripts/resolve-amazon-asins.mjs         # 全件（途中再開可）
 *        LIMIT=30 node scripts/resolve-amazon-asins.mjs # 動作確認
 * 出力:  scripts/logs/asin-cache.json  … 解決結果のキャッシュ(再実行で再取得しない)
 *        scripts/logs/catalog-asins.csv … catalog-update.ts に食わせる CSV
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CACHE_PATH = path.join(HERE, `logs/asin-cache${(process.env.MARKET ?? "us").toLowerCase() === "jp" ? "-jp" : ""}.json`);
const CSV_PATH = path.join(HERE, `logs/catalog-asins${(process.env.MARKET ?? "us").toLowerCase() === "jp" ? "-jp" : ""}.csv`);
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const DELAY_MS = 2500;
const MATCH_RATIO = 0.6;
const LIMIT = Number(process.env.LIMIT ?? 0);
// MARKET=us(既定) / jp。JP の Amazon アソシエイトは実際に稼働しているので JP も埋める価値がある。
const MARKET = (process.env.MARKET ?? "us").toLowerCase();
const DOMAIN = MARKET === "jp" ? "amazon.co.jp" : "amazon.com";
const NETWORK = MARKET === "jp" ? "amazon-jp" : "amazon-us";
const MARKET_CODE = MARKET === "jp" ? "JP" : "US";

const STOP = new Set(["the", "and", "for", "with", "pro", "plus", "max", "new", "set", "kit", "pack", "size", "inch", "series"]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function tokens(name) {
  // 日本語名は a-z0-9 だけに落とすと全部消えるので、CJK/かな/カナの塊も語として拾う。
  // (2026-08-24: JP を英語名で検索していたため命中率が 26% に落ちていた)
  const lower = name.toLowerCase();
  const latin = lower.replace(/[^a-z0-9 ]+/g, " ").split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP.has(w));
  const cjk = lower.match(/[\u3040-\u30ff\u4e00-\u9fff]{2,}/g) ?? [];
  return [...latin, ...cjk];
}

/** amazon-us リンクを持たない物理カテゴリのオファーを、カタログ本体から取り出す。 */
function targets() {
  const out = execFileSync("npx", ["tsx", "-e", `
    const { CATALOG } = require("./src/lib/affiliates/catalog");
    const PHYS = new Set(["tech","home","beauty","fashion","fitness","food","parenting","pets","travel"]);
    const rows = CATALOG
      .filter(o => PHYS.has(o.category))
      // amazon-us リンクが「無い」だけでなく、「有るが実ASINでない(検索URL止まり)」も対象。
      // 後者が 845 件あり、deep link 化の主戦場はこちら。
      .filter(o => !(o.links ?? []).some(l => l.network === "${NETWORK}" && /^[A-Z0-9]{10}$/.test(l.productId ?? "")))
      // 月額表記のものは物理商品ではない(VPN・レンタルサーバ等)。Amazon に送っても意味が無い。
      .filter(o => !/\\/\\s*(mo|month|月)/i.test((o.priceMin ?? "") + (o.price ?? "")))
      .map(o => ({ id: o.id, name: ${MARKET === "jp" ? '(o.name?.ja ?? o.name?.en)' : '(o.name?.en ?? o.name?.ja)'} ?? Object.values(o.name ?? {})[0] ?? "", category: o.category }))
      .filter(o => o.name);
    console.log(JSON.stringify(rows));
  `], { cwd: path.resolve(HERE, ".."), encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(out.trim().split("\n").pop());
}

async function ddgImageUrls(query) {
  const r1 = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`, { headers: { "User-Agent": UA } });
  const vqd = (await r1.text()).match(/vqd=["']([^"']+)["']/)?.[1];
  if (!vqd) return [];
  await sleep(600);
  const r2 = await fetch(
    `https://duckduckgo.com/i.js?q=${encodeURIComponent(query)}&o=json&vqd=${encodeURIComponent(vqd)}&f=,,,,,&p=1`,
    { headers: { "User-Agent": UA, Referer: "https://duckduckgo.com/", Accept: "application/json" } },
  );
  if (!r2.ok) return [];
  const data = await r2.json();
  return (data.results ?? []).map((x) => ({ url: x.url, title: x.title ?? "" })).filter((x) => x.url);
}

/** 候補から、商品名に十分一致する Amazon の ASIN を1つ選ぶ。 */
function pickAsin(hits, name) {
  const want = tokens(name);
  // 1語しかない名前(ブランド名だけ = NordVPN 等のサービス)は取り違えが起きるので解決しない。
  if (want.length < 2) return null;
  for (const h of hits) {
    const m = new RegExp(`^https?://(?:www\\.)?${DOMAIN.replace(/\./g, "\\.")}/([^?#]*/)?dp/([A-Z0-9]{10})`, "i").exec(h.url);
    if (!m) continue;
    // スラッグが無い URL (amazon.co.jp に多い) は画像結果のタイトルで照合する。
    const hay = ((m[1] ?? "") + " " + (h.title ?? "")).toLowerCase();
    const hit = want.filter((w) => hay.includes(w)).length;
    if (hit / want.length >= MATCH_RATIO) return { asin: m[2].toUpperCase(), url: h.url };
  }
  return null;
}

async function main() {
  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  const cache = fs.existsSync(CACHE_PATH) ? JSON.parse(fs.readFileSync(CACHE_PATH, "utf8")) : {};
  const all = targets();
  const RETRY = process.env.RETRY_MISSES === "1";
  // 実流入(GSCインプレッション)のある記事の offer を先に回すための優先リスト。
  // PRIORITY_IDS=path/to/ids.txt (1行1 offerId) を渡すと、その順で先頭に並ぶ。
  const prioFile = process.env.PRIORITY_IDS;
  if (prioFile && fs.existsSync(prioFile)) {
    const order = new Map(fs.readFileSync(prioFile, "utf8").split("\n").map(s => s.trim()).filter(Boolean).map((id, i) => [id, i]));
    all.sort((a, b) => (order.get(a.id) ?? 1e9) - (order.get(b.id) ?? 1e9));
  }
  const todo = all.filter((o) => (RETRY ? !cache[o.id] : !(o.id in cache)));
  console.log(`対象 ${all.length} 件 / 未解決 ${todo.length} 件`);
  const work = LIMIT ? todo.slice(0, LIMIT) : todo;

  let ok = 0, miss = 0, i = 0;
  for (const o of work) {
    i++;
    try {
      const hits = await ddgImageUrls(`${o.name} ${DOMAIN}`);
      const found = pickAsin(hits, o.name);
      cache[o.id] = found ? { asin: found.asin, name: o.name } : null;
      if (found) { ok++; } else { miss++; }
      if (i % 10 === 0 || i === work.length) {
        fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
        console.log(`${i}/${work.length}  解決 ${ok} / 不明 ${miss}  最新: ${o.id} → ${found?.asin ?? "—"}`);
      }
    } catch (e) {
      console.log(`! ${o.id}: ${e.message}`);
    }
    await sleep(DELAY_MS);
  }
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));

  const lines = ["offerId,network,productId,rawUrl,markets"];
  for (const [id, v] of Object.entries(cache)) {
    if (!v) continue;
    lines.push(`${id},${NETWORK},${v.asin},https://www.${DOMAIN}/dp/${v.asin},${MARKET_CODE}`);
  }
  fs.writeFileSync(CSV_PATH, lines.join("\n") + "\n");
  console.log(`\n解決 ${lines.length - 1} 件 → ${CSV_PATH}`);
}

main();
