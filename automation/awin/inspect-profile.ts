/**
 * Awin merchant-profile ページ の Apply フォーム/ボタン構造を調査
 *
 * Usage: npm run awin:inspect-profile <merchant_id>
 *   default: 96499 (Ottocast)
 */
import { launch, loadCredentials, ensureLoggedIn, PUBLISHER_ID } from "./_browser";

async function main() {
  const merchantId = process.argv[2] || "96499";
  const url = `https://ui.awin.com/awin/affiliate/${PUBLISHER_ID}/merchant-profile/${merchantId}`;

  const creds = loadCredentials();
  const { context, page } = await launch({ headless: false });

  console.log("→ ログイン確認");
  await ensureLoggedIn(page, creds);
  console.log(`→ ${url}`);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(6000);

  console.log(`現在URL: ${page.url()}`);
  await page.screenshot({ path: `/tmp/awin-profile-${merchantId}.png`, fullPage: true });
  console.log(`✓ /tmp/awin-profile-${merchantId}.png`);

  const summary = await page.evaluate(() => {
    const out: any = {
      url: location.href,
      title: document.title,
      headings: [],
      buttons: [],
      forms: [],
      keyText: "",
    };
    document.querySelectorAll("h1, h2, h3").forEach((h) => {
      const t = (h.textContent || "").trim().slice(0, 100);
      if (t) out.headings.push(`${h.tagName}: ${t}`);
    });
    // Apply / Join 関連ボタン
    document.querySelectorAll("button, input[type='submit'], a.button, a[class*='btn']").forEach((b) => {
      const text = (b.textContent || (b as HTMLInputElement).value || "").trim().slice(0, 80);
      const id = b.id || "";
      const cls = (b as HTMLElement).className?.toString().slice(0, 80) || "";
      const onclick = b.getAttribute("onclick") || "";
      const href = (b as HTMLAnchorElement).getAttribute?.("href") || "";
      if (text || id) {
        out.buttons.push({ text, id, cls, onclick: onclick.slice(0, 80), href });
      }
    });
    // フォーム情報
    document.querySelectorAll("form").forEach((f) => {
      const action = f.getAttribute("action") || "";
      const method = f.getAttribute("method") || "";
      const inputs: any[] = [];
      f.querySelectorAll("input, textarea, select").forEach((i) => {
        inputs.push({
          tag: i.tagName,
          name: i.getAttribute("name") || "",
          type: i.getAttribute("type") || "",
          value: (i as HTMLInputElement).value?.slice(0, 30) || "",
        });
      });
      out.forms.push({ action, method, inputs: inputs.slice(0, 15) });
    });
    // 主要テキスト (Apply/Status/Commission 周辺)
    const main = document.querySelector("main, .main-content, .merchant-profile, body");
    if (main) {
      const text = (main as HTMLElement).innerText || "";
      // "Apply" や "Status" を含む段落を切り出し
      const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
      const interesting = lines.filter((l) =>
        /apply|status|commission|join|approval|requirements/i.test(l) && l.length < 200
      );
      out.keyText = interesting.slice(0, 20).join("\n");
    }
    return out;
  });

  console.log("\n=== Profile page structure ===");
  console.log(JSON.stringify(summary, null, 2));

  console.log("\n10秒後にブラウザを閉じます。");
  await page.waitForTimeout(10000);
  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
