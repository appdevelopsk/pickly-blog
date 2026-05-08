/**
 * 提携中の Yahoo 詳細ページ → 「広告作成」「リンクコード」系のリンクを全部洗い出す
 */
import { launch, ensureLoggedIn } from "./_browser";

async function main() {
  const { context, page } = await launch({ headless: true });
  await ensureLoggedIn(page);

  await page.goto("https://af.moshimo.com/af/shop/promotion/detail?promotion_id=1225", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // 提携中の場合 page には「広告作成」「リンクコード」「サンプル」ボタンが現れるはず
  const links = await page.evaluate(() => {
    const results: { tag: string; class: string; text: string; href?: string; visible: boolean }[] = [];
    document.querySelectorAll("a, button").forEach((el) => {
      const e = el as HTMLElement;
      const text = (e.textContent ?? "").trim();
      if (!text || text.length > 60) return;
      // Filter links to interesting endpoints
      const href = (el.tagName === "A") ? (el as HTMLAnchorElement).href : "";
      if (
        /広告|リンク|サンプル|HTML|バナー|テキスト|商品|create|sample|generate/i.test(text) ||
        /(affiliate|generate|link|sample|create)/i.test(href)
      ) {
        results.push({
          tag: e.tagName,
          class: e.className.toString().slice(0, 40),
          text: text.slice(0, 50),
          href: href ? href.slice(0, 90) : undefined,
          visible: !!e.offsetParent,
        });
      }
    });
    return results;
  });

  console.log("=== Apply/Link 関連要素 ===");
  for (const l of links.slice(0, 40)) {
    console.log(`[${l.visible ? "VIS" : "hid"}] ${l.tag} class=${l.class} "${l.text}"${l.href ? ` → ${l.href}` : ""}`);
  }

  await context.close();
}
main();
