/**
 * さくらのレンタルサーバ A8リンク取得チェック
 */
import { chromium } from "playwright";

process.loadEnvFile(new URL(".env", import.meta.url).pathname);
const A8_LOGIN = process.env.A8_LOGIN!;
const A8_PASSWORD = process.env.A8_PASSWORD!;
const SAKURA_INS_ID = "s00000001717001";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  // ログイン
  await page.goto("http://www.a8.net/", { waitUntil: "networkidle" });
  await page.fill("#asLoginId", A8_LOGIN);
  await page.fill('input[name="passwd"]', A8_PASSWORD);
  await page.click('input[name="login_as_btn"]');
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);
  console.log("ログイン後URL:", page.url());

  // さくらのリンクページへ
  await page.goto(`https://pub.a8.net/a8v2/media/linkAction.do?insId=${SAKURA_INS_ID}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  const url = page.url();
  const bodyText = await page.innerText("body").catch(() => "");
  console.log("URL:", url);
  console.log("ページ(500):", bodyText.slice(0, 500));

  const codeValues: string[] = await page.$$eval(
    "input[name='code'], textarea[name='code']",
    (els: (HTMLInputElement | HTMLTextAreaElement)[]) => els.map(e => e.value)
  );
  const trackingUrls = codeValues
    .map(v => { const m = v.match(/https?:\/\/px\.a8\.net\/svt\/ejp\?a8mat=[^\s"'<>]+/); return m ? m[0] : null; })
    .filter((u): u is string => u !== null);

  if (trackingUrls.length > 0) {
    console.log("✅ 承認済み! URL:", trackingUrls[0]);
  } else {
    console.log("⏳ まだ承認待ちまたはエラー");
  }

  await browser.close();
}

main().catch(console.error);
