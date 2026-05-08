/**
 * Awin merchant-profile から "Join Program" を踏んで申請フォーム構造を取得
 *
 * Usage: npm run awin:inspect-join <merchant_id>
 *   default: 96499 (Ottocast)
 */
import { launch, loadCredentials, ensureLoggedIn, PUBLISHER_ID } from "./_browser";

async function main() {
  const merchantId = process.argv[2] || "96499";
  const profileUrl = `https://ui.awin.com/awin/affiliate/${PUBLISHER_ID}/merchant-profile/${merchantId}`;

  const creds = loadCredentials();
  const { context, page } = await launch({ headless: false });

  console.log("→ ログイン");
  await ensureLoggedIn(page, creds);

  console.log(`→ ${profileUrl}`);
  await page.goto(profileUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(5000);

  // すべての a/button のうち "Join Program" を含むもの (左サイドナビ含む)
  console.log("\n--- 'Join Program' 候補 ---");
  const candidates = await page.evaluate(() => {
    const out: Array<{ tag: string; text: string; href: string; cls: string }> = [];
    document.querySelectorAll("a, button, li").forEach((el) => {
      const text = (el.textContent || "").trim();
      if (text && text.length < 80 && /join program/i.test(text)) {
        out.push({
          tag: el.tagName,
          text: text.slice(0, 60),
          href: (el as HTMLAnchorElement).getAttribute?.("href") || "",
          cls: (el as HTMLElement).className?.toString().slice(0, 60),
        });
      }
    });
    return out;
  });
  console.log(JSON.stringify(candidates, null, 2));

  // 最有力候補をクリック (a タグかつ href がある場合は href で navigate、無ければ click)
  const linkCand = candidates.find((c) => c.tag === "A" && c.href);
  if (linkCand) {
    console.log(`\n→ navigate: ${linkCand.href}`);
    await page.goto("https://ui.awin.com" + linkCand.href, { waitUntil: "domcontentloaded", timeout: 30000 });
  } else {
    console.log("\n→ click 'Join Program' element");
    await page.locator("a:has-text('Join Program'), button:has-text('Join Program')").first().click().catch(() => {});
  }
  await page.waitForTimeout(5500);

  console.log(`\n現在URL: ${page.url()}`);
  await page.screenshot({ path: `/tmp/awin-join-${merchantId}.png`, fullPage: true });

  // 申請フォーム / 確認画面の構造
  const summary = await page.evaluate(() => {
    const out: any = {
      url: location.href,
      title: document.title,
      headings: [],
      buttons: [],
      forms: [],
      visibleText: "",
    };
    document.querySelectorAll("h1, h2, h3").forEach((h) => {
      const t = (h.textContent || "").trim().slice(0, 100);
      if (t) out.headings.push(`${h.tagName}: ${t}`);
    });
    document.querySelectorAll("button:not([type='hidden']), input[type='submit'], a.btn, [role='button']").forEach((b) => {
      const text = (b.textContent || (b as HTMLInputElement).value || "").trim().slice(0, 80);
      const id = b.id || "";
      const cls = (b as HTMLElement).className?.toString().slice(0, 80) || "";
      const visible = (b as HTMLElement).offsetParent !== null;
      if (text || id) {
        out.buttons.push({ text, id, cls, visible });
      }
    });
    document.querySelectorAll("form").forEach((f) => {
      const inputs: any[] = [];
      f.querySelectorAll("input, textarea, select, [type='checkbox']").forEach((i) => {
        const visible = (i as HTMLElement).offsetParent !== null;
        inputs.push({
          tag: i.tagName,
          name: i.getAttribute("name") || "",
          type: i.getAttribute("type") || "",
          required: i.getAttribute("required") !== null,
          visible,
        });
      });
      out.forms.push({
        action: f.getAttribute("action") || "",
        method: f.getAttribute("method") || "",
        inputs: inputs.slice(0, 25),
      });
    });
    // メイン text (最初の3000字)
    const main = document.querySelector("main, .main-content, .content, body");
    out.visibleText = (main as HTMLElement)?.innerText.slice(0, 2500) || "";
    return out;
  });

  console.log("\n=== 申請フォーム/確認画面 ===");
  console.log(JSON.stringify(summary, null, 2));

  console.log("\n10秒後にブラウザを閉じます。");
  await page.waitForTimeout(10000);
  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
