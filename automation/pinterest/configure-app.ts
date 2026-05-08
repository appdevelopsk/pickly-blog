/**
 * Pinterest App の Configure ページで:
 * 1. App secret 表示 (eye icon click)
 * 2. Redirect URI 追加 (http://localhost:8080/callback)
 * 3. Generate Access Token (Trial environment)
 *
 * Usage: npx tsx pinterest/configure-app.ts <app_id>
 */
import { launch, ensureLoggedIn } from "./_browser";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";

const CREDS_FILE = path.join(os.homedir(), ".config/pickly/pinterest.env");

async function main() {
  const appId = process.argv[2] ?? "1568630";

  const { context, page } = await launch({ headless: false });
  await ensureLoggedIn(page);

  await page.goto(`https://developers.pinterest.com/apps/${appId}/`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  console.log(`→ ${page.url()}`);

  // Step 1: App secret を eye icon クリックで表示
  console.log("→ App secret 表示");
  // eye icon の selector を探す
  const eyeIcon = page.locator("button[aria-label*='Show'], button[aria-label*='show'], button[aria-label*='表示'], button[aria-label*='reveal'], svg[aria-label*='show']").first();
  if ((await eyeIcon.count()) > 0) {
    await eyeIcon.click().catch(() => {});
    await page.waitForTimeout(1000);
  } else {
    // Fallback: input.value を直接読む(隠れていても DOM に値がある)
    console.log("  eye icon not found, reading from DOM directly");
  }

  // Extract App ID と App secret - 全要素のテキストから hex 文字列を探す
  const credentials = await page.evaluate(() => {
    const out: { foundAppId?: string; foundSecret?: string; allHex: string[] } = { allHex: [] };
    // すべてのテキストノードを走査
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      const text = (node.textContent ?? "").trim();
      // App ID: 7桁数字
      if (/^\d{7,8}$/.test(text)) {
        if (!out.foundAppId) out.foundAppId = text;
      }
      // Secret: 40文字以上の hex
      if (/^[a-f0-9]{40,}$/i.test(text)) {
        out.allHex.push(text);
        if (!out.foundSecret) out.foundSecret = text;
      }
      node = walker.nextNode();
    }
    return out;
  });

  console.log(`  App ID: ${credentials.foundAppId ?? "(not found)"}`);
  console.log(`  App Secret: ${credentials.foundSecret ? credentials.foundSecret.slice(0, 20) + "..." : "(not found)"}`);
  console.log(`  hex候補数: ${credentials.allHex.length}`);

  const appSecretInput = credentials.foundSecret ? { value: credentials.foundSecret } : null;

  // Step 2: Redirect URI 追加
  console.log("\n→ Redirect URI 追加");
  const redirectInput = page.locator("input[placeholder*='redirect'], input[placeholder*='URI'], input[name*='redirect']").first();
  if ((await redirectInput.count()) > 0) {
    const currentValue = await redirectInput.inputValue();
    if (!currentValue.includes("localhost:8080")) {
      await redirectInput.fill("http://localhost:8080/callback");
      // Add ボタン or Enter
      await page.keyboard.press("Enter");
      await page.waitForTimeout(2000);
      console.log("  ✓ Redirect URI 追加 (http://localhost:8080/callback)");
    } else {
      console.log(`  既に設定済: ${currentValue}`);
    }
  } else {
    console.log("  ⚠ redirect URI 入力欄未発見");
  }

  await page.screenshot({ path: "/tmp/pinterest-configure.png", fullPage: true });
  console.log("→ /tmp/pinterest-configure.png");

  // Step 3: Save secret to env file
  if (appSecretInput?.value) {
    let existing = "";
    try { existing = await fs.readFile(CREDS_FILE, "utf8"); } catch {}
    const filtered = existing.split("\n").filter((l) => !l.startsWith("export PINTEREST_APP_")).join("\n").replace(/\n+$/, "");
    const newContent = `${filtered}\nexport PINTEREST_APP_ID="${appId}"\nexport PINTEREST_APP_SECRET="${appSecretInput.value}"\n`;
    await fs.writeFile(CREDS_FILE, newContent, { mode: 0o600 });
    console.log(`\n✓ ${CREDS_FILE} に App ID + Secret 保存`);
  }

  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
