/**
 * A8.net 未参加プログラムの検索（申し込み候補を探す）
 */
import { chromium } from "playwright";

process.loadEnvFile(new URL(".env", import.meta.url).pathname);
const A8_LOGIN = process.env.A8_LOGIN!;
const A8_PASSWORD = process.env.A8_PASSWORD!;

// 検索キーワードと期待するプログラム名
const SEARCHES = [
  "ConoHa",
  "ロリポップ",
  "GMOペパボ",
  "カラフルボックス",
  "シン・レンタルサーバ",
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  await page.goto("http://www.a8.net/", { waitUntil: "networkidle" });
  await page.fill("#asLoginId", A8_LOGIN);
  await page.fill('input[name="passwd"]', A8_PASSWORD);
  await page.click('input[name="login_as_btn"]');
  await page.waitForLoadState("networkidle");

  for (const kw of SEARCHES) {
    // プログラム検索（未参加含む全て）
    await page.goto(
      `https://pub.a8.net/a8v2/media/asProgramSearch.do?searchWord=${encodeURIComponent(kw)}&searchCategory=0`,
      { waitUntil: "networkidle" }
    );
    await page.waitForTimeout(1500);

    const rows = await page.$$eval(
      "table tbody tr, .program-list li",
      (els: Element[]) => els.map(el => el.textContent?.trim().replace(/\s+/g, " ").slice(0, 100) ?? "").filter(t => t.length > 5)
    );

    const bodyText = await page.innerText("body").catch(() => "");
    // insIdを含む申し込みリンクを探す
    const insIds = await page.$$eval("a[href*='insId']", (links: HTMLAnchorElement[]) =>
      links.map(a => ({ text: a.textContent?.trim().slice(0, 40), href: a.href.match(/insId=([^&]+)/)?.[1] }))
        .filter(l => l.href)
    );

    console.log(`\n=== ${kw} ===`);
    console.log("  URL:", page.url());
    if (insIds.length > 0) {
      for (const l of insIds.slice(0, 3)) console.log(`  insId: ${l.href} → ${l.text}`);
    } else {
      console.log("  (プログラムなし or 検索方法が違う)");
      // テキストの一部を表示
      const relevant = bodyText.split("\n").filter(l => l.includes(kw.slice(0,3))).join(" ").slice(0, 200);
      if (relevant) console.log("  関連テキスト:", relevant);
    }
  }

  await browser.close();
}

main().catch(console.error);
