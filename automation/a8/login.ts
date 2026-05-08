/**
 * A8.net 既存アカウントへログイン (headed)
 *
 * Usage:
 *   npm run a8:login
 */
import { launch, loadCredentials } from "./_browser";

const TIMEOUT_SEC = 300;

async function main() {
  const creds = loadCredentials();
  const { context, page } = await launch({ headless: false });

  console.log("→ A8.net ログインページへ");
  await page.goto("https://www.a8.net/asmember.html", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  await page.waitForTimeout(2000);

  if (creds.loginId) {
    for (const sel of ["input[name='login_id']", "input[name='loginId']", "input[name='id']", "#login_id"]) {
      const loc = page.locator(sel).first();
      if ((await loc.count()) > 0 && (await loc.isVisible().catch(() => false))) {
        await loc.fill(creds.loginId);
        console.log(`✓ login_id 自動入力 (${sel})`);
        break;
      }
    }
  }
  if (creds.password) {
    for (const sel of ["input[name='password']", "input[type='password']", "#password"]) {
      const loc = page.locator(sel).first();
      if ((await loc.count()) > 0 && (await loc.isVisible().catch(() => false))) {
        await loc.fill(creds.password);
        console.log(`✓ password 自動入力 (${sel})`);
        break;
      }
    }
  }

  console.log("");
  console.log("ブラウザでログインを完了してください (reCAPTCHA は人間が解く)");
  console.log(`待機中 ${TIMEOUT_SEC} 秒...`);

  let detected = false;
  for (let i = 0; i < TIMEOUT_SEC; i++) {
    await page.waitForTimeout(1000);
    let url = "";
    try {
      url = page.url();
    } catch {
      break;
    }
    if (url.includes("pub.a8.net") && !url.includes("/login")) {
      detected = true;
      console.log(`✓ ログイン完了検出 (経過 ${i + 1} 秒)`);
      break;
    }
  }

  if (detected) {
    await page.waitForTimeout(3000);
    console.log("✓ セッション保存完了");
  } else {
    console.log("✗ タイムアウト");
    process.exitCode = 1;
  }
  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
