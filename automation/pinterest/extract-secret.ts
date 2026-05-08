/**
 * 作成済み Pinterest App から App Secret を抽出。
 * Usage:
 *   npx tsx pinterest/extract-secret.ts <app_id>
 */
import { launch, ensureLoggedIn } from "./_browser";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";

const CREDS_FILE = path.join(os.homedir(), ".config/pickly/pinterest.env");

async function main() {
  const appId = process.argv[2];
  if (!appId) {
    console.error("Usage: npx tsx pinterest/extract-secret.ts <app_id>");
    process.exit(2);
  }

  const { context, page } = await launch({ headless: false });
  await ensureLoggedIn(page);

  // /apps/ 一覧から始める
  await page.goto("https://developers.pinterest.com/apps/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  console.log(`→ App ID ${appId} の詳細ページへ`);

  // App ID の card / link をクリック
  const appLink = page.locator(`a[href*='/apps/${appId}'], a[href*='${appId}']`).first();
  if ((await appLink.count()) > 0) {
    const href = await appLink.getAttribute("href");
    console.log(`  href: ${href}`);
    if (href) {
      const fullUrl = href.startsWith("http") ? href : `https://developers.pinterest.com${href}`;
      await page.goto(fullUrl, { waitUntil: "domcontentloaded" });
    }
  } else {
    // 直接URL: /apps/<id>/details/
    const candidates = [
      `https://developers.pinterest.com/apps/${appId}/`,
      `https://developers.pinterest.com/apps/${appId}/details/`,
    ];
    for (const u of candidates) {
      await page.goto(u, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(2000);
      console.log(`  Tried ${u} → ${page.url()}`);
      if (!page.url().includes("404") && !page.url().endsWith("/apps/")) break;
    }
  }
  await page.waitForTimeout(3000);

  console.log(`現在URL: ${page.url()}`);
  await page.screenshot({ path: "/tmp/pinterest-app-detail.png", fullPage: true });
  console.log("→ /tmp/pinterest-app-detail.png に保存");

  // App secret 抽出 - 複数パターン試行
  const result = await page.evaluate(() => {
    // textarea, input[readonly], code 要素から探す
    const candidates: string[] = [];
    document.querySelectorAll("input[readonly], input[type='password'], textarea, code, pre").forEach((el) => {
      const v = (el as HTMLInputElement).value || el.textContent || "";
      if (v && v.length >= 30 && /^[a-fA-F0-9]+$/.test(v.replace(/[\s-]/g, ""))) {
        candidates.push(v.trim());
      }
    });

    // ラベル「App secret」や「Secret」近くのテキストノード
    const labels = Array.from(document.querySelectorAll("label, dt, [class*='label']"));
    let secretFromLabel: string | null = null;
    for (const label of labels) {
      const text = (label.textContent ?? "").trim().toLowerCase();
      if (text.includes("secret") || text.includes("シークレット")) {
        const sibling = label.nextElementSibling;
        if (sibling) {
          const v = (sibling as HTMLInputElement).value || sibling.textContent || "";
          if (v.length >= 30) secretFromLabel = v.trim();
        }
      }
    }

    return {
      candidates: candidates.slice(0, 5),
      secretFromLabel,
      bodyText: (document.body.textContent ?? "").slice(0, 2000).replace(/\s+/g, " "),
    };
  });

  console.log(`\n=== 抽出候補 ===`);
  console.log(`Label-based: ${result.secretFromLabel ? result.secretFromLabel.slice(0, 30) + "..." : "(none)"}`);
  console.log(`Hex candidates (40+ chars):`);
  for (const c of result.candidates) console.log(`  ${c.slice(0, 40)}... (len=${c.length})`);

  const secret = result.secretFromLabel ?? result.candidates[0];
  if (secret) {
    let existing = "";
    try { existing = await fs.readFile(CREDS_FILE, "utf8"); } catch {}
    const filtered = existing.split("\n").filter((l) => !l.startsWith("export PINTEREST_APP_")).join("\n").replace(/\n+$/, "");
    const newContent = `${filtered}\nexport PINTEREST_APP_ID="${appId}"\nexport PINTEREST_APP_SECRET="${secret}"\n`;
    await fs.writeFile(CREDS_FILE, newContent, { mode: 0o600 });
    console.log(`\n✓ ${CREDS_FILE} に App ID と Secret 保存`);
  } else {
    console.log(`\n⚠ 自動抽出失敗。スクショ /tmp/pinterest-app-detail.png 確認して手動でコピー`);
    console.log(`  本文抜粋: ${result.bodyText.slice(0, 500)}`);
  }

  await page.waitForTimeout(2000);
  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
