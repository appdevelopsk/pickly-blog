// out/ から RSC payload (各ページの index.txt) を削除する。
//
// output: "export" ではクライアント側ナビゲーションが payload を取りに行かないため
// これらは配信されないが、ページ数ぶん (現在 13,968 個) 生成される。
// Cloudflare Pages は 1 デプロイ 20,000 ファイルまでで、これを含むと超過して
// "Pages only supports up to 20,000 files" でデプロイが落ちる (2026-08-22)。
//
// out 直下の llms.txt / robots.txt / サーチコンソール所有権確認用の txt は残す。
import { readdirSync, statSync, unlinkSync } from "node:fs";
import { join } from "node:path";

const ROOT = "out";
let removed = 0;

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p);
    else if (entry === "index.txt") { unlinkSync(p); removed++; }
  }
}

walk(ROOT);

let total = 0;
(function count(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) count(p); else total++;
  }
})(ROOT);

console.log(`RSC payload を ${removed} 件削除 / 残り ${total} ファイル`);
if (total > 20000) {
  console.error(`✘ ${total} ファイルは Cloudflare Pages の上限 20,000 を超えています。デプロイは失敗します。`);
  process.exit(1);
}
