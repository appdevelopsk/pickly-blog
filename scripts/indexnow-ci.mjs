#!/usr/bin/env node
/**
 * pickly 専用 IndexNow 差分送信器（CI用）。deploy.yml の Pages デプロイ直後に実行する。
 *
 * growth/indexnow.mjs（launchd 日次 9:30）から pickly を分離して CI へ一本化した版。
 * 分離した理由: デプロイ完走は 13:00 JST 頃で、launchd 9:30 だと当日の変更が
 * 翌日まで（約20時間）送信されなかった。二重送信を避けるため growth 側の SITES
 * からは pickly を外してある。
 *
 * 状態（url→lastmod 署名）は .indexnow-ci-state/pickly.json に置き、
 * GitHub Actions の actions/cache で run 間を持ち越す。
 *
 * growth 版との差分:
 *  - 状態なし（初回 / キャッシュ消失）は全件送信ではなく「スナップショット保存のみ」。
 *    全 URL は過去に launchd 側から送信済みで、キャッシュ消失のたびに
 *    約7,100 URL を再送すると BWT 推奨「Avoid IndexNow Batch Mode」に反するため。
 *  - 鍵はコードに直書きせず site/public/<64hex>.txt のファイル名から取得。
 *    鍵・keyLocation はログに出さない。
 *  - 子サイトマップは同一ホストのものだけ辿る。
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE_URL = "https://pickly.blog";
const HOST = new URL(SITE_URL).hostname;
const STATE_DIR = join(ROOT, ".indexnow-ci-state");
const STATE_FILE = join(STATE_DIR, "pickly.json");
const CHUNK = 10000; // IndexNow の1リクエスト上限

function loadKey() {
  const dir = join(ROOT, "site", "public");
  const file = readdirSync(dir).find((f) => /^[0-9a-f]{64}\.txt$/.test(f));
  if (!file) {
    console.error("✗ site/public に 64hex の IndexNow 鍵ファイルが見つからない");
    process.exit(1);
  }
  return file.replace(/\.txt$/, "");
}

const locsIn = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

const entriesIn = (xml) =>
  [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].flatMap((m) => {
    const loc = m[1].match(/<loc>([^<]+)<\/loc>/);
    if (!loc) return [];
    const lastmod = m[1].match(/<lastmod>([^<]+)<\/lastmod>/);
    return [{ loc: loc[1].trim(), lastmod: lastmod ? lastmod[1].trim() : "" }];
  });

async function fetchSitemapEntries() {
  const root = await fetch(`${SITE_URL}/sitemap.xml`).then((r) => r.text());
  if (!/<sitemapindex/i.test(root)) return entriesIn(root);
  const all = [];
  for (const child of locsIn(root)) {
    if (new URL(child).hostname !== HOST) {
      console.warn(`  ! 同一ホスト外の子サイトマップは辿らない: ${child}`);
      continue;
    }
    try {
      const xml = await fetch(child).then((r) => r.text());
      all.push(...entriesIn(xml));
    } catch (e) {
      console.warn(`  ! 子サイトマップ取得失敗: ${child} (${e.message})`);
    }
  }
  return all;
}

function loadState() {
  try {
    return JSON.parse(readFileSync(STATE_FILE, "utf8"));
  } catch {
    return null; // 初回 or キャッシュ消失 or 破損
  }
}

function saveState(entries) {
  mkdirSync(STATE_DIR, { recursive: true });
  const map = Object.fromEntries(entries.map((e) => [e.loc, e.lastmod]));
  writeFileSync(STATE_FILE, JSON.stringify(map));
}

async function main() {
  const key = loadKey();
  const keyUrl = `${SITE_URL}/${key}.txt`;

  // 鍵ファイルが本番で配信されているか（未配信だと IndexNow 側が弾く）
  try {
    const kr = await fetch(keyUrl);
    if (!kr.ok) {
      console.warn(`  ! 鍵ファイル未配信 (HTTP ${kr.status}) → 送信スキップ`);
      return;
    }
  } catch (e) {
    console.warn(`  ! 鍵ファイル確認失敗: ${e.message} → 送信スキップ`);
    return;
  }

  const entries = await fetchSitemapEntries();
  if (entries.length === 0) {
    console.warn("  ! sitemap から URL が0件 → 何もしない（状態も更新しない）");
    return;
  }
  console.log(`  sitemap から ${entries.length} URL を抽出`);

  const prev = loadState();
  if (!prev) {
    // 初回 / キャッシュ消失。全件再送はしない（既に全 URL 送信済みの前提。
    // ここで全送すると Actions のキャッシュ削除のたびに約7,100 URL を再送してしまう）。
    saveState(entries);
    console.log("  状態なし → スナップショットのみ保存、送信ゼロ（次回から差分送信）");
    return;
  }

  const changed = entries.filter((e) => !(e.loc in prev) || prev[e.loc] !== e.lastmod).map((e) => e.loc);
  console.log(`  差分: ${changed.length} URL（新規 or lastmod変化）`);
  if (changed.length === 0) {
    saveState(entries); // 削除URLの掃除
    console.log("  変化なし → 送信スキップ");
    return;
  }

  let okAll = true;
  for (let i = 0; i < changed.length; i += CHUNK) {
    const batch = changed.slice(i, i + CHUNK);
    const res = await fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: HOST, key, keyLocation: keyUrl, urlList: batch }),
    });
    if (res.status === 200 || res.status === 202) {
      console.log(`  ✓ ${batch.length} URL 送信 (HTTP ${res.status})`);
    } else {
      const text = await res.text().catch(() => "");
      console.error(`  ✗ HTTP ${res.status}: ${text}`);
      okAll = false;
    }
  }
  if (okAll) {
    saveState(entries); // 成功時のみ状態更新（失敗分は次回再送）
  } else {
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
