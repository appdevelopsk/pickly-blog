/**
 * Amazon Associates US の W-8BEN tax interview を半自動化
 *
 * フロー:
 *   1. tax interview ページへ移動
 *   2. Individual / Non-US person を選択
 *   3. 名前・国・住所を env から自動入力
 *   4. Tax treaty (Japan) を claim
 *   5. 各ステップで「Save and Continue」を可能なら自動クリック、
 *      検証エラー or 不明な必須項目があれば人間に渡す
 *   6. **電子署名は人間が入力** (法的拘束力あるため自動化しない)
 *
 * Usage:
 *   npm run amazon-us:tax
 */
import { launch, loadCredentials } from "./_browser";
import type { Page } from "playwright";

const TIMEOUT_SEC = 1800; // 30分

async function safeFill(page: Page, selectors: string[], value?: string): Promise<boolean> {
  if (!value) return false;
  for (const sel of selectors) {
    const loc = page.locator(sel).first();
    try {
      if ((await loc.count()) > 0 && (await loc.isVisible())) {
        await loc.fill(value);
        return true;
      }
    } catch {}
  }
  return false;
}

async function safeSelect(page: Page, selectors: string[], value?: string): Promise<boolean> {
  if (!value) return false;
  for (const sel of selectors) {
    const loc = page.locator(sel).first();
    try {
      if ((await loc.count()) > 0 && (await loc.isVisible())) {
        await loc.selectOption({ label: value }).catch(() => loc.selectOption(value));
        return true;
      }
    } catch {}
  }
  return false;
}

async function safeClickByText(page: Page, texts: string[]): Promise<boolean> {
  for (const text of texts) {
    const candidates = [
      `button:has-text('${text}')`,
      `input[type='submit'][value='${text}']`,
      `a:has-text('${text}')`,
      `label:has-text('${text}') input[type='radio']`,
    ];
    for (const sel of candidates) {
      const loc = page.locator(sel).first();
      try {
        if ((await loc.count()) > 0 && (await loc.isVisible())) {
          await loc.click();
          return true;
        }
      } catch {}
    }
  }
  return false;
}

async function checkRadioByLabel(page: Page, label: string): Promise<boolean> {
  // Various Amazon radio patterns
  const sels = [
    `label:has-text('${label}')`,
    `text=${label}`,
    `input[type='radio'][value='${label}']`,
    `input[type='radio'][aria-label*='${label}']`,
  ];
  for (const sel of sels) {
    const loc = page.locator(sel).first();
    try {
      if ((await loc.count()) > 0) {
        await loc.click();
        return true;
      }
    } catch {}
  }
  return false;
}

async function main() {
  const creds = loadCredentials();
  const { context, page } = await launch({ headless: false });

  console.log("→ Tax Information ページへ");
  // 直接の URL を試す
  await page
    .goto("https://affiliate-program.amazon.com/tax/account-info", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    })
    .catch(() => {});
  await page.waitForTimeout(3000);

  if (page.url().includes("/home") || page.url().includes("/login")) {
    // フォールバック: home から Tax Info セクションを探す
    console.log("→ ホームからTax設定リンク経由");
    await page.goto("https://affiliate-program.amazon.com/home", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    for (const text of ["Taxes", "Tax Information", "Update Tax"]) {
      const link = page.locator(`a:has-text('${text}')`).first();
      if ((await link.count()) > 0 && (await link.isVisible().catch(() => false))) {
        await link.click().catch(() => {});
        await page.waitForTimeout(2000);
        break;
      }
    }
  }

  // 「Take interview」/「Begin」のような開始ボタン
  await safeClickByText(page, ["Take interview", "Begin", "Start tax interview", "Get Started"]);
  await page.waitForTimeout(2000);

  // ===== W-8BEN ステップごとに値を試行 =====
  console.log("→ Step: 個人 (Individual) / 非US person");
  await checkRadioByLabel(page, "Individual");
  await page.waitForTimeout(500);
  await checkRadioByLabel(page, "No"); // Are you a US person? -> No

  await safeClickByText(page, ["Save and Continue", "Continue", "Next"]);
  await page.waitForTimeout(2500);

  console.log("→ Step: 氏名・国籍・住所");
  // 氏名
  await safeFill(
    page,
    [
      "input[name='fullName']",
      "input[name='firstName']",
      "input[id*='firstName']",
      "input[aria-label*='First name']",
    ],
    "Kenichiro",
  );
  await safeFill(
    page,
    ["input[name='lastName']", "input[id*='lastName']", "input[aria-label*='Last name']"],
    "Sakamoto",
  );
  await safeFill(
    page,
    ["input[name='legalName']", "input[id*='legalName']"],
    "Kenichiro Sakamoto",
  );

  // 市民権の国
  await safeSelect(page, ["select[name='country']", "select[id*='country']", "select[aria-label*='Citizenship']"], "Japan");

  // 住所
  await safeFill(page, ["input[name='address1']", "input[name='addressLine1']"], "21-6 Showa-cho");
  await safeFill(page, ["input[name='address2']", "input[name='addressLine2']"], "Apt 303");
  await safeFill(page, ["input[name='city']", "input[id*='city']"], "Higashiosaka");
  await safeFill(page, ["input[name='state']", "input[name='province']", "input[id*='state']"], "Osaka");
  await safeFill(page, ["input[name='postalCode']", "input[name='zip']", "input[id*='postal']"], "579-8046");
  await safeSelect(page, ["select[name='country']", "select[id*='residenceCountry']"], "Japan");

  await safeClickByText(page, ["Save and Continue", "Continue", "Next"]);
  await page.waitForTimeout(2500);

  console.log("→ Step: TIN (US tax ID なし)");
  // I do not have a US TIN
  await checkRadioByLabel(page, "No, I do not have");
  await checkRadioByLabel(page, "I do not have a U.S.");
  await checkRadioByLabel(page, "I am not eligible");

  // Foreign TIN は持っていない場合スキップ
  await safeClickByText(page, ["Save and Continue", "Continue", "Next"]);
  await page.waitForTimeout(2500);

  console.log("→ Step: Tax Treaty Benefits (Japan / 0%)");
  // Yes, claim treaty benefits
  await checkRadioByLabel(page, "Yes");
  await safeSelect(page, ["select[name='treatyCountry']", "select[id*='treaty']"], "Japan");

  await safeClickByText(page, ["Save and Continue", "Continue", "Next"]);
  await page.waitForTimeout(2500);

  console.log("");
  console.log("======================================================");
  console.log("自動入力試行完了。残りは人間が確認 + 署名:");
  console.log("");
  console.log("  1. Article / paragraph: 多くの場合 Article 7 (Business Profits) で 0%");
  console.log("  2. Type of income: Royalty or Other");
  console.log("  3. Special rates: 0%");
  console.log("  4. Review summary: 全項目を確認");
  console.log("  5. Electronic signature: あなたの法定氏名を入力 (例: Kenichiro Sakamoto)");
  console.log("  6. Date: 自動 or 今日 (YYYY-MM-DD)");
  console.log("  7. ☑ 同意 / Submit");
  console.log("");
  console.log(`待機 ${TIMEOUT_SEC}秒 (Ctrl+C で終了)`);
  console.log("======================================================");

  for (let i = 0; i < TIMEOUT_SEC; i++) {
    await page.waitForTimeout(1000);
    let url = "";
    try {
      url = page.url();
    } catch {
      console.log("ブラウザが閉じられました");
      break;
    }
    if (url.includes("complete") || url.includes("success") || url.includes("submitted")) {
      console.log(`✓ Tax interview 完了画面到達 (${i + 1}秒)`);
      break;
    }
    if ((i + 1) % 60 === 0) {
      process.stdout.write(`  ${i + 1}/${TIMEOUT_SEC} (${url.slice(0, 80)})\n`);
    }
  }

  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
