/**
 * CJ W-8BEN 税務情報フォーム記入・提出
 * コード検証済みセッションで実行する
 */
import { chromium } from "playwright";
import { writeFileSync } from "fs";
import * as path from "path";
import * as os from "os";
import * as fsp from "fs/promises";

const USER_DATA_DIR = path.join(os.homedir(), ".cache/pickly-playwright/cj");

// W-8BEN フォームの記入内容
const TAX_INFO = {
  name: "Kenichiro Sakamoto",
  businessName: "Pickly",
  country: "Japan",
  address: "3-1-1 Honmachi",
  city: "Chuo-ku, Osaka",
  postalCode: "541-0053",
  foreignTin: "",  // マイナンバーは任意
};

async function main() {
  await fsp.mkdir(USER_DATA_DIR, { recursive: true });
  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: true, viewport: { width: 1280, height: 900 }, locale: "en-US",
  });
  const page = context.pages()[0] ?? await context.newPage();
  page.setDefaultTimeout(30000);

  await page.goto(
    "https://members.cj.com/member/app/publisher/account/settings/tax-information",
    { waitUntil: "domcontentloaded" }
  );
  try { await page.waitForFunction(() => document.body.innerText.length > 100, { timeout: 15000 }); } catch {}
  await page.waitForTimeout(3000);

  const body0 = await page.evaluate(() => document.body.innerText);
  console.log("Initial page:\n", body0.slice(0, 500));
  writeFileSync("/tmp/cj-tax-step0.html", await page.content());

  // 「編集」クリック
  await page.locator("text=編集").first().click({ force: true });
  await page.waitForTimeout(3000);

  const body1 = await page.evaluate(() => document.body.innerText);
  console.log("\nAfter 編集 click:\n", body1.slice(0, 800));
  writeFileSync("/tmp/cj-tax-step1.html", await page.content());

  // 確認コード画面か W-8BEN 画面かを判定
  if (body1.includes("確認が必要") || body1.includes("確認コード")) {
    console.log("\n⚠️  再度確認コードが必要です");
    // 全 input を表示
    const inputs = await page.evaluate(() =>
      Array.from(document.querySelectorAll("input")).map((e) => ({
        id: e.id, type: e.type, placeholder: e.placeholder,
        testid: e.getAttribute("data-testid"), enabled: !e.disabled,
      }))
    );
    console.log("Inputs:", JSON.stringify(inputs, null, 2));
    await context.close();
    return;
  }

  // W-8BEN フォームの入力フィールドを確認
  const inputs = await page.evaluate(() =>
    Array.from(document.querySelectorAll("input")).map((e) => ({
      id: e.id, type: e.type, placeholder: e.placeholder,
      testid: e.getAttribute("data-testid"),
      label: e.closest("div")?.querySelector("label, [class*='label']")?.textContent?.trim().slice(0, 40),
      enabled: !e.disabled, value: (e as HTMLInputElement).value,
    }))
  );
  console.log("\nW-8BEN inputs:", JSON.stringify(inputs, null, 2));

  // フォームの内容から入力を試みる
  // フィールドを label テキストで特定して入力
  for (const inp of inputs) {
    if (!inp.enabled) continue;
    if (inp.label?.toLowerCase().includes("name") || inp.label?.includes("名前")) {
      await page.fill(`#${inp.id}`, TAX_INFO.name);
      console.log("Filled name:", inp.id);
    } else if (inp.label?.toLowerCase().includes("business") || inp.label?.includes("事業")) {
      await page.fill(`#${inp.id}`, TAX_INFO.businessName);
      console.log("Filled business:", inp.id);
    } else if (inp.label?.toLowerCase().includes("address") || inp.label?.includes("住所")) {
      await page.fill(`#${inp.id}`, TAX_INFO.address);
      console.log("Filled address:", inp.id);
    }
  }

  await page.waitForTimeout(2000);
  const body2 = await page.evaluate(() => document.body.innerText);
  console.log("\nAfter fill:\n", body2.slice(0, 1000));
  writeFileSync("/tmp/cj-tax-step2.html", await page.content());

  await context.close();
}
main().catch(console.error);
