/**
 * Awin Advertisers ページの構造を調査して JSON で出力
 *
 * - スクリーンショット → /tmp/awin-advertisers.png
 * - DOM要約 → 標準出力 (URL, 検索バー, フィルター, merchant カード, ボタン)
 *
 * Usage: npm run awin:inspect
 */
import { launch } from "./_browser";

async function main() {
  const { context, page } = await launch({ headless: false });

  console.log("→ Awin Advertisers ページへ");
  await page.goto("https://ui.awin.com/affiliate/advertisers", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  await page.waitForTimeout(5000); // React render 待ち

  const url = page.url();
  const title = await page.title();
  console.log(`URL: ${url}`);
  console.log(`Title: ${title}`);

  // ログイン画面に飛ばされた場合
  if (url.includes("login") || url.includes("signin")) {
    console.log("⚠ ログイン画面に飛ばされました。手動でログインしてください (60秒待機)");
    await page.waitForTimeout(60000);
  }

  await page.screenshot({ path: "/tmp/awin-advertisers.png", fullPage: false });
  console.log("✓ Screenshot: /tmp/awin-advertisers.png");

  // 主要要素を抽出
  const summary = await page.evaluate(() => {
    const results: any = {
      url: window.location.href,
      buttons: [],
      inputs: [],
      links: [],
      headings: [],
      possibleMerchantCards: [],
    };

    // 全button要素のテキスト + テストID
    document.querySelectorAll("button").forEach((b) => {
      const text = (b.textContent || "").trim().slice(0, 80);
      if (text) {
        results.buttons.push({
          text,
          testId: b.getAttribute("data-testid") || b.getAttribute("data-test-id") || "",
          className: b.className.slice(0, 60),
        });
      }
    });

    // 検索系の input
    document.querySelectorAll("input").forEach((i) => {
      const ph = i.getAttribute("placeholder") || "";
      const name = i.getAttribute("name") || "";
      const type = i.getAttribute("type") || "";
      if (ph || name) {
        results.inputs.push({
          placeholder: ph,
          name,
          type,
          testId: i.getAttribute("data-testid") || "",
        });
      }
    });

    // h1〜h3 見出し
    document.querySelectorAll("h1, h2, h3").forEach((h) => {
      const text = (h.textContent || "").trim().slice(0, 80);
      if (text) results.headings.push(`${h.tagName}: ${text}`);
    });

    // navigation の link
    document.querySelectorAll("nav a, [role='navigation'] a").forEach((a) => {
      const text = (a.textContent || "").trim().slice(0, 50);
      const href = a.getAttribute("href") || "";
      if (text && href) results.links.push({ text, href });
    });

    // merchant card らしきもの (画像 + テキスト + ボタンのある div)
    document.querySelectorAll("[class*='card'], [class*='Card'], [class*='advertiser'], [class*='Advertiser'], [class*='merchant']").forEach((el) => {
      const text = (el.textContent || "").trim().slice(0, 100);
      if (text) {
        results.possibleMerchantCards.push({
          tag: el.tagName,
          className: (el as HTMLElement).className.slice(0, 80),
          text: text.slice(0, 80),
        });
      }
    });
    results.possibleMerchantCards = results.possibleMerchantCards.slice(0, 10);

    return results;
  });

  console.log("\n=== 概要 ===");
  console.log(JSON.stringify(summary, null, 2));

  console.log("\n調査完了。10秒後にブラウザを閉じます。");
  await page.waitForTimeout(10000);
  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
