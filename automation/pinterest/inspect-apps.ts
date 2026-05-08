/**
 * Pinterest Developer apps ページの構造調査。
 * 既存 app があるかどうか、Create app フォームの入力フィールドを把握。
 */
import { launch, ensureLoggedIn } from "./_browser";

async function main() {
  const { context, page } = await launch({ headless: false });
  await ensureLoggedIn(page);

  await page.goto("https://developers.pinterest.com/apps/connect/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  console.log(`URL: ${page.url()}`);
  console.log(`Title: ${await page.title()}`);

  // 既存アプリ一覧
  const apps = await page.evaluate(() => {
    const results: { text: string; href?: string }[] = [];
    document.querySelectorAll("a, button, [role='button']").forEach((el) => {
      const e = el as HTMLElement;
      const text = (e.textContent ?? "").trim().slice(0, 80);
      if (!text || text.length < 3) return;
      const href = e.tagName === "A" ? (el as HTMLAnchorElement).href : undefined;
      if (/Pickly|create|app|new/i.test(text) && !!e.offsetParent) {
        results.push({ text, href });
      }
    });
    return results.slice(0, 20);
  });
  console.log("\n=== Pickly/create/app 関連 visible 要素 ===");
  for (const a of apps) console.log(`"${a.text}"${a.href ? ` → ${a.href}` : ""}`);

  // Form input fields
  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("input, textarea, select")).map((el) => {
      const e = el as HTMLInputElement;
      return {
        tag: e.tagName,
        type: e.type,
        name: e.name,
        id: e.id,
        placeholder: e.placeholder,
        ariaLabel: e.getAttribute("aria-label"),
        visible: !!(e as HTMLElement).offsetParent,
      };
    });
  });
  console.log(`\n=== Form fields (visible only) ===`);
  for (const i of inputs.filter((x) => x.visible).slice(0, 30)) {
    console.log(`${i.tag}[${i.type}] name=${i.name || "-"} id=${i.id || "-"} placeholder=${i.placeholder?.slice(0, 30) || "-"} aria=${i.ariaLabel?.slice(0, 30) || "-"}`);
  }

  await context.close();
}
main();
