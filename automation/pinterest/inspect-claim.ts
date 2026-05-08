/**
 * Pinterest ドメイン認証ページを開いて、フォーム/ボタン構造を抽出。
 */
import { launch, ensureLoggedIn } from "./_browser";

async function main() {
  const { context, page } = await launch({ headless: false });
  await ensureLoggedIn(page);

  console.log("→ ドメイン認証設定へ");
  // claim_website は廃止された UI か新しい UI かでパスが違う
  const candidatePaths = [
    "/settings/claim/",
    "/settings/claim",
    "/business/hub/",
    "/settings/",
  ];

  for (const p of candidatePaths) {
    const url = `https://www.pinterest.com${p}`;
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    console.log(`Trying ${p} → ${page.url()}`);
    if (!page.url().includes("/login") && !page.url().includes("404")) break;
  }

  await page.waitForTimeout(2000);

  // 認証関連の見出し/ボタン抽出
  const elements = await page.evaluate(() => {
    const results: { tag: string; text: string; ariaLabel: string | null; visible: boolean }[] = [];
    document.querySelectorAll("h1, h2, h3, button, a, [role='button']").forEach((el) => {
      const e = el as HTMLElement;
      const text = (e.textContent ?? "").trim().slice(0, 80);
      if (!text || text.length > 80) return;
      if (/claim|認証|認める|主張|サイト|website|domain/i.test(text)) {
        results.push({
          tag: e.tagName,
          text,
          ariaLabel: e.getAttribute("aria-label"),
          visible: !!e.offsetParent,
        });
      }
    });
    return results.slice(0, 20);
  });

  console.log("\n=== claim/website 関連要素 ===");
  for (const e of elements) {
    console.log(`[${e.visible ? "VIS" : "hid"}] ${e.tag} "${e.text}"${e.ariaLabel ? ` aria=${e.ariaLabel}` : ""}`);
  }

  await context.close();
}
main();
