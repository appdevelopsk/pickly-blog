/**
 * CJ — Surfshark (ID: 6282055) 申請
 * 前提: CJ アカウントのオンボーディング 9/9 完了 (税務情報 + 支払い情報 が必要)
 * Usage: npx tsx cj/apply-surfshark.ts
 */
import { chromium } from "playwright";
import { writeFileSync } from "fs";
import * as path from "path";
import * as os from "os";
import * as fsp from "fs/promises";

const USER_DATA_DIR = path.join(os.homedir(), ".cache/pickly-playwright/cj");

async function main() {
  await fsp.mkdir(USER_DATA_DIR, { recursive: true });
  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: true, viewport: { width: 1280, height: 900 }, locale: "en-US",
  });
  const page = context.pages()[0] ?? await context.newPage();
  page.setDefaultTimeout(30000);

  // ナビゲーション経由で広告主の検索ページへ
  await page.goto("https://members.cj.com/member/publisher/home.do", { waitUntil: "domcontentloaded" });
  try { await page.waitForFunction(() => document.body.innerText.length > 150, { timeout: 15000 }); } catch {}
  await page.waitForTimeout(2000);
  await page.locator("text=パートナー").first().click();
  await page.waitForTimeout(1200);
  await page.locator("text=広告主の検索").first().click();
  try { await page.waitForURL(/findAdvertisers/, { timeout: 10000 }); } catch {}
  await page.waitForTimeout(4000);

  // 国フィルターを JS で外す (JP チェックボックスを確認・解除、US を有効化)
  const countryResult = await page.evaluate(() => {
    // Japan checkbox をアンチェック(クリア)
    const jpCb = document.querySelector("#advCountry_JP") as HTMLInputElement;
    // US checkbox
    const usCb = document.querySelector("#advCountry_US") as HTMLInputElement;
    // 国フィルターのアコーディオンを開く
    const header = document.querySelector("#advertiser-country-filter-header") as HTMLElement;
    if (header) header.click();
    return {
      jpChecked: jpCb?.checked,
      usChecked: usCb?.checked,
      headerFound: !!header,
    };
  });
  console.log("Country state:", countryResult);
  await page.waitForTimeout(1000);

  // キーワード入力
  const kwInput = await page.$("#keyword-search-box");
  if (kwInput) {
    await kwInput.fill("Surfshark");
    console.log("Keyword filled: Surfshark");
  } else {
    console.log("Keyword input not found, trying force fill");
    await page.evaluate(() => {
      const el = document.querySelector("#keyword-search-box") as HTMLInputElement;
      if (el) el.value = "Surfshark";
    });
  }
  await page.waitForTimeout(500);

  // 国フィルターを「なし」にする（JP を外す）
  await page.evaluate(() => {
    const jpCb = document.querySelector("#advCountry_JP") as HTMLInputElement;
    if (jpCb?.checked) jpCb.click();
    // 全国を選択する別の方法: hidden input を直接クリア
    const hidden = document.querySelector("input[name='advertiserSearchBox']") as HTMLInputElement;
    if (hidden) hidden.value = "";
  });

  // 検索ボタンクリック
  const searchBtn = await page.$("#searchButton");
  if (searchBtn) {
    await searchBtn.click({ force: true });
    console.log("Search button clicked");
  } else {
    await page.evaluate(() => {
      const btn = document.querySelector("#searchButton") as HTMLElement;
      btn?.click();
    });
  }
  await page.waitForTimeout(6000);

  const url = page.url();
  const body = await page.evaluate(() => document.body.innerText);
  console.log("URL:", url);
  console.log("Text:\n", body.slice(0, 2500));
  writeFileSync("/tmp/cj-keyword-result.html", await page.content());

  if (body.toLowerCase().includes("surfshark")) {
    console.log("\n✅ Surfshark 発見!");
    const applyBtn = await page.$("a:has-text('プログラムに適用'), button:has-text('プログラムに適用'), a:has-text('Apply')");
    if (applyBtn) {
      await applyBtn.click({ force: true });
      await page.waitForTimeout(5000);
      const result = await page.evaluate(() => document.body.innerText.slice(0, 1000));
      console.log("申請結果:", result);
    }
  } else {
    const resultCount = body.match(/(\d+) 結果/)?.[1];
    console.log("Result count:", resultCount);
    console.log("Country filter after search:", body.match(/広告主の国: \S+/)?.[0] ?? "none");
  }

  await context.close();
}
main().catch(console.error);
