import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const EMAIL    = process.env.IMPACT_EMAIL!;
const PASSWORD = process.env.IMPACT_PASSWORD!;

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  await page.goto("https://app.impact.com/login", { waitUntil: "networkidle" });

  // JS レンダリング待ち
  await page.waitForSelector("input", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2000);

  const inputs = await page.$$eval("input, button", (els) =>
    (els as (HTMLInputElement | HTMLButtonElement)[]).map((e) => ({
      tag: e.tagName,
      type: (e as HTMLInputElement).type,
      name: (e as HTMLInputElement).name,
      id: e.id,
      placeholder: (e as HTMLInputElement).placeholder,
    }))
  );
  console.log("フォーム要素:", JSON.stringify(inputs, null, 2));
  writeFileSync("/tmp/impact-login-page.html", await page.content());

  // email 入力
  const emailSels = ["input[type='email']", "input[name='username']", "input[name='email']", "#username"];
  for (const sel of emailSels) {
    if (await page.locator(sel).count() > 0) {
      await page.fill(sel, EMAIL);
      console.log(`✓ email入力 (${sel})`);
      break;
    }
  }

  // password 入力
  const passSels = ["input[type='password']", "input[name='password']", "#password"];
  let hasPwd = false;
  for (const sel of passSels) {
    if (await page.locator(sel).count() > 0) {
      await page.fill(sel, PASSWORD);
      console.log(`✓ password入力 (${sel})`);
      hasPwd = true;
      break;
    }
  }

  if (!hasPwd) {
    // メール入力だけで次へ進む（2ステップ）
    console.log("→ password未発見、Enterで次へ");
    await page.keyboard.press("Enter");
    await page.waitForSelector("input[type='password']", { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);
    console.log("step2 URL:", page.url());
    if (await page.locator("input[type='password']").count() > 0) {
      await page.fill("input[type='password']", PASSWORD);
      console.log("✓ password入力 (step2)");
      hasPwd = true;
    }
  }

  if (hasPwd) {
    await page.keyboard.press("Enter");
    await page.waitForTimeout(6000);
    console.log("ログイン後URL:", page.url());
    await page.screenshot({ path: "/tmp/impact-after-login.png" });
    writeFileSync("/tmp/impact-after-login.html", await page.content());
    const bodyText = (await page.innerText("body").catch(() => "")).slice(0, 500);
    console.log("ページテキスト:", bodyText);
  }

  await browser.close();
}

main().catch(console.error);
