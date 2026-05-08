/**
 * Pinterest Developer App を自動作成。
 * フォーム自動入力 → submit → App ID + Secret 抽出 → ~/.config/pickly/pinterest.env に追記
 */
import { launch, ensureLoggedIn } from "./_browser";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";

const CREDS_FILE = path.join(os.homedir(), ".config/pickly/pinterest.env");

async function main() {
  const { context, page } = await launch({ headless: false });
  await ensureLoggedIn(page);

  await page.goto("https://developers.pinterest.com/apps/connect/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  console.log("→ App 作成フォームに入力");

  // App icon 必須 - hidden file input にアップロード
  const fileInput = page.locator("input[type='file']").first();
  if ((await fileInput.count()) > 0) {
    console.log("  → App icon アップロード");
    await fileInput.setInputFiles("/tmp/pickly-logo.png").catch((e) => {
      console.log("    upload error:", e.message.split("\n")[0]);
    });
    await page.waitForTimeout(2000);
  } else {
    console.log("  ⚠ file input 見つからず");
  }

  // 基本情報
  await page.fill("#name", "Pickly Pin Bot");
  await page.fill("#companyName", "Pickly");
  await page.fill("#mainUrl", "https://pickly.blog");
  await page.fill("#privacyPolicyUrl", "https://pickly.blog/en/privacy/");
  await page.fill(
    "#description",
    "Auto-pinning system for Pickly, a 17-language curated review and comparison site. Posts product comparison articles (gadgets, home goods, finance) to relevant Pinterest boards. Read access for analytics and write access for pin creation.",
  );

  // Radio: develop (developer purpose) — usually "yes I'm building an app"
  // Try common values
  const developRadios = await page.locator("input[type='radio'][id='develop']").all();
  console.log(`  develop radios: ${developRadios.length}`);
  if (developRadios.length > 0) {
    await developRadios[0].check().catch(() => {});
  }

  const accessRadios = await page.locator("input[type='radio'][id='access']").all();
  console.log(`  access radios: ${accessRadios.length}`);
  if (accessRadios.length > 0) {
    await accessRadios[0].check().catch(() => {});
  }

  // developerPurpose - 文章
  await page.fill("#developerPurpose", "Automated pinning of editorial review articles on pickly.blog to engage with Pinterest's curation community. Articles compare consumer products with verified data.").catch(() => {});

  // Use case: creation (pin作成 + 投稿)
  await page.locator("#use_case_categories_creation").check().catch(() => {});
  await page.locator("#use_case_categories_reporting").check().catch(() => {});

  // Audience: pinner (記事のクリエイター/シェアラーとして)
  await page.locator("#audience_categories_pinner").check().catch(() => {});
  await page.locator("#audience_categories_creator").check().catch(() => {});

  // 全部の同意 checkbox があれば チェック
  const consentBoxes = await page.locator("input[type='checkbox'][id*='consent'], input[type='checkbox'][id*='agree'], input[type='checkbox'][id*='terms']").all();
  for (const c of consentBoxes) {
    await c.check().catch(() => {});
  }

  console.log("→ 入力完了。スクリーンショットで確認 (/tmp/pinterest-create-app.png)");
  await page.screenshot({ path: "/tmp/pinterest-create-app.png", fullPage: true });

  // 必須radio/checkboxのうち未入力のもの一覧
  const unchecked = await page.evaluate(() => {
    const radioGroups = new Map<string, boolean>();
    document.querySelectorAll("input[type='radio']").forEach((el) => {
      const e = el as HTMLInputElement;
      if (!radioGroups.has(e.name)) radioGroups.set(e.name, false);
      if (e.checked) radioGroups.set(e.name, true);
    });
    const ungrouped = [...radioGroups.entries()].filter(([_, c]) => !c).map(([n]) => n);

    const required = Array.from(document.querySelectorAll("input[required], textarea[required], select[required]"))
      .filter((el) => !(el as HTMLInputElement).value)
      .map((el) => (el as HTMLInputElement).id || (el as HTMLInputElement).name);
    return { uncheckedRadioGroups: ungrouped, missingRequired: required };
  });
  console.log(`  未チェック radio group: ${unchecked.uncheckedRadioGroups.join(", ") || "(none)"}`);
  console.log(`  未入力 required: ${unchecked.missingRequired.join(", ") || "(none)"}`);

  // reCAPTCHA がある場合、人間が解くまで待機
  console.log("");
  console.log("===========================================================");
  console.log("⚠ reCAPTCHA を ブラウザで手動で解いてください");
  console.log("  (画面下部の「私はロボットではありません」チェックボックス)");
  console.log("");
  console.log("解いたら Submit ボタンを押してください。");
  console.log("URL 変化を自動検知して 抽出します(最大 5 分待機)");
  console.log("===========================================================");

  for (let i = 0; i < 300; i++) {
    await page.waitForTimeout(1000);
    const url = page.url();
    if (!url.includes("/apps/connect/")) {
      console.log(`✓ App 作成完了 (経過 ${i + 1} 秒)`);
      console.log(`  新URL: ${url}`);
      break;
    }
    if ((i + 1) % 15 === 0) {
      console.log(`  待機中... ${i + 1}/300 秒`);
    }
  }
  await page.waitForTimeout(2000);
  console.log(`  submit 後 URL: ${page.url()}`);

  await page.screenshot({ path: "/tmp/pinterest-after-submit.png", fullPage: true });
  console.log("  /tmp/pinterest-after-submit.png に保存");

  // App ID + Secret 抽出
  const credentials = await page.evaluate(() => {
    const text = document.body.textContent ?? "";
    const idMatch = text.match(/app\s*id[:\s]+(\d+)/i) || text.match(/(\d{7,})/);
    const secretMatch = text.match(/secret[:\s]+([a-f0-9]{40,})/i) || text.match(/([a-f0-9]{40,})/);
    return {
      appId: idMatch?.[1],
      appSecret: secretMatch?.[1],
      bodyExcerpt: text.slice(0, 500).replace(/\s+/g, " "),
    };
  });
  console.log(`  抽出 App ID: ${credentials.appId ?? "(not found)"}`);
  console.log(`  抽出 App Secret: ${credentials.appSecret ? credentials.appSecret.slice(0, 10) + "..." : "(not found)"}`);

  if (credentials.appId && credentials.appSecret) {
    let existing = "";
    try { existing = await fs.readFile(CREDS_FILE, "utf8"); } catch {}
    const filtered = existing.split("\n").filter((l) => !l.startsWith("export PINTEREST_APP_")).join("\n").replace(/\n+$/, "");
    const newContent = `${filtered}\nexport PINTEREST_APP_ID="${credentials.appId}"\nexport PINTEREST_APP_SECRET="${credentials.appSecret}"\n`;
    await fs.writeFile(CREDS_FILE, newContent, { mode: 0o600 });
    console.log(`✓ ${CREDS_FILE} に App ID/Secret を保存`);
  } else {
    console.log(`(自動抽出失敗。スクリーンショット /tmp/pinterest-after-submit.png を確認して手動でコピー)`);
    console.log(`  body 抜粋: ${credentials.bodyExcerpt}`);
  }

  console.log("\n→ ブラウザを開いたまま、結果確認後 Ctrl+C で終了");
  await new Promise<void>((resolve) => context.on("close", () => resolve()));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
