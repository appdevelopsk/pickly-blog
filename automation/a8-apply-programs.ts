/**
 * A8.net プログラム申し込みスクリプト
 * insIdが判明しているプログラムに直接申し込む
 * Usage: npx tsx a8-apply-programs.ts
 */
import { chromium, type Page } from "playwright";
import { writeFileSync } from "fs";

process.loadEnvFile(new URL(".env", import.meta.url).pathname);
const A8_LOGIN = process.env.A8_LOGIN!;
const A8_PASSWORD = process.env.A8_PASSWORD!;

const PROGRAMS = [
  { name: "エックスサーバー", insId: "s00000001642001" },
  { name: "さくらのレンタルサーバ", insId: "s00000001717001" },
  { name: "mixhost", insId: "s00000016565001" },
  { name: "NordVPN", insId: "s00000018459001" },
  { name: "Surfshark", insId: "s00000021488002" },
];

async function login(page: Page): Promise<void> {
  console.log("A8.net ログイン中...");
  await page.goto("http://www.a8.net/", { waitUntil: "networkidle" });
  await page.fill("#asLoginId", A8_LOGIN);
  await page.fill('input[name="passwd"]', A8_PASSWORD);
  await page.click('input[name="login_as_btn"]');
  await page.waitForLoadState("networkidle");
  console.log("ログイン後URL:", page.url());
}

async function applyToProgram(page: Page, program: { name: string; insId: string }): Promise<void> {
  console.log(`\n========== ${program.name} (${program.insId}) ==========`);

  // 詳細・申し込み確認ページへ直接アクセス
  const detailUrl = `https://pub.a8.net/a8v2/media/joinPrograms/detail.do?action=confirmSearch&insIds=${program.insId}&searchFlg=1&viewType=0`;
  console.log(`詳細ページ: ${detailUrl}`);
  await page.goto(detailUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  writeFileSync(`/tmp/a8-detail-${program.insId}.html`, await page.content());

  const pageText = await page.innerText("body").catch(() => "");
  console.log(`ページテキスト（最初800文字）:`, pageText.slice(0, 800));

  // ボタン・リンクを列挙
  const buttons = await page.$$eval(
    "a, input[type='submit'], input[type='button'], button",
    (els: Element[]) =>
      els.map((e) => ({
        tag: e.tagName,
        text: (e.textContent ?? (e as HTMLInputElement).value ?? "").trim().replace(/\s+/g, " "),
        href: (e as HTMLAnchorElement).href ?? "",
        value: (e as HTMLInputElement).value ?? "",
        name: (e as HTMLInputElement).name ?? "",
      }))
  );
  console.log("ボタン/リンク一覧:", JSON.stringify(buttons.filter(b => b.text.length > 0).slice(0, 30), null, 2));

  // 「提携申請をする」ボタン (id="save") を探してクリック
  // ※ onHideAndJoinSubmit がフォームアクションを /a8v2/media/joinAction/application.do に設定して submit する
  const applyBtn = await page.$("a#save");

  if (applyBtn) {
    const text = await applyBtn.textContent();
    console.log(`✅ 申し込みボタン発見: "${text?.trim()}"`);

    await applyBtn.click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    console.log("クリック後URL:", page.url());
    const afterText = await page.innerText("body").catch(() => "");
    console.log("クリック後テキスト（最初800文字）:", afterText.slice(0, 800));
    writeFileSync(`/tmp/a8-apply-step2-${program.insId}.html`, await page.content());

    // 確認画面（「提携申請を確定する」等のボタンがある場合）
    const confirmBtn = await page.$("a#save, input[value*='確定'], input[value*='申込'], input[value*='提携']");
    if (confirmBtn) {
      const confirmText = await confirmBtn.evaluate((e) =>
        (e as HTMLInputElement).value || e.textContent?.trim() || ""
      );
      console.log(`確認ボタン発見: "${confirmText}"`);
      await confirmBtn.click();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);
      console.log("最終URL:", page.url());
      const finalText = await page.innerText("body").catch(() => "");
      console.log("完了後テキスト（最初600文字）:", finalText.slice(0, 600));
      writeFileSync(`/tmp/a8-apply-final-${program.insId}.html`, await page.content());
    } else {
      console.log("確認ボタンなし → 申し込み完了または審査待ちの可能性");
    }
  } else {
    // 既に参加中かどうか確認
    if (pageText.includes("参加中") || pageText.includes("提携中") || pageText.includes("申込中")) {
      console.log("✅ 既に参加中/申込中");
    } else {
      console.log("⚠️ a#save ボタンが見つかりません。HTMLを確認: /tmp/a8-detail-" + program.insId + ".html");
    }
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  await login(page);

  for (const program of PROGRAMS) {
    try {
      await applyToProgram(page, program);
    } catch (err) {
      console.error(`${program.name} でエラー:`, err);
    }
    await page.waitForTimeout(3000);
  }

  await browser.close();
  console.log("\n完了");
}

main().catch(console.error);
