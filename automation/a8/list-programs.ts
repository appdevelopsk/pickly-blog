/**
 * A8.net プログラム検索 (ログイン後実行)
 *
 * Usage:
 *   npm run a8:list-programs -- --keyword "VPN"
 *   npm run a8:list-programs -- --category 38   # IDで指定
 *
 * 結果を JSON で標準出力に流す。
 */
import { launch } from "./_browser";

interface Args {
  keyword?: string;
  category?: string;
}

function parseArgs(): Args {
  const out: Args = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--keyword") out.keyword = argv[++i];
    else if (a === "--category") out.category = argv[++i];
  }
  return out;
}

async function main() {
  const args = parseArgs();
  if (!args.keyword && !args.category) {
    console.error("Usage: npm run a8:list-programs -- --keyword <kw> | --category <id>");
    process.exit(2);
  }

  const { context, page } = await launch({ headless: true });

  // A8 ダッシュボード経由でプログラム検索
  const baseUrl = "https://pub.a8.net/a8v2/asPgmSearch.do";
  const url = args.keyword
    ? `${baseUrl}?keyWord=${encodeURIComponent(args.keyword)}`
    : `${baseUrl}?categoryId=${args.category}`;

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(2000);

  if (page.url().includes("/login")) {
    console.error("✗ 未ログイン。先に npm run a8:login を実行してください");
    await context.close();
    process.exit(1);
  }

  // プログラム一覧を抽出 (HTML構造はスクレイピング時に確認・調整)
  const programs = await page.$$eval("table.searchResult tr, .program_item, [data-program-id]", (rows) =>
    rows.map((r) => {
      const el = r as HTMLElement;
      return {
        id: el.dataset.programId ?? null,
        text: (el.innerText ?? "").trim().slice(0, 200),
        html: el.outerHTML.slice(0, 500),
      };
    }),
  );

  console.log(JSON.stringify({ count: programs.length, programs }, null, 2));
  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
