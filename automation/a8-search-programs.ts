/**
 * A8.net でキーワード検索してプログラムを探す
 */
import { chromium } from "playwright";

process.loadEnvFile(new URL(".env", import.meta.url).pathname);
const A8_LOGIN = process.env.A8_LOGIN!;
const A8_PASSWORD = process.env.A8_PASSWORD!;

const KEYWORDS = ["ConoHa", "ロリポップ", "Lolipop"];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  await page.goto("http://www.a8.net/", { waitUntil: "networkidle" });
  await page.fill("#asLoginId", A8_LOGIN);
  await page.fill('input[name="passwd"]', A8_PASSWORD);
  await page.click('input[name="login_as_btn"]');
  await page.waitForLoadState("networkidle");
  console.log("ログイン:", page.url());

  for (const kw of KEYWORDS) {
    await page.goto(
      `https://pub.a8.net/a8v2/media/partnerProgramListAction.do?act=search&searchWord=${encodeURIComponent(kw)}&viewPage=1`,
      { waitUntil: "networkidle" }
    );
    await page.waitForTimeout(2000);

    const rows = await page.$$eval("table tbody tr", (trs: HTMLTableRowElement[]) =>
      trs.map(tr => {
        const cells = tr.querySelectorAll("td");
        const link = tr.querySelector("a[href*='insId']") as HTMLAnchorElement | null;
        const insId = link?.href?.match(/insId=([^&]+)/)?.[1] ?? "";
        return {
          name: cells[0]?.textContent?.trim().slice(0, 50) ?? "",
          status: cells[1]?.textContent?.trim() ?? "",
          insId,
        };
      }).filter(r => r.name)
    );

    console.log(`\n=== ${kw} ===`);
    if (rows.length === 0) console.log("  なし");
    for (const r of rows.slice(0, 5)) {
      console.log(`  ${r.name} | ${r.status} | insId: ${r.insId}`);
    }
  }

  await browser.close();
}

main().catch(console.error);
