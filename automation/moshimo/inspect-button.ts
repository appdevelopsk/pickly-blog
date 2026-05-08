import { launch, ensureLoggedIn } from "./_browser";

async function main() {
  const { context, page } = await launch({ headless: false });
  await ensureLoggedIn(page);
  await page.goto("https://af.moshimo.com/af/shop/promotion/detail?promotion_id=170", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);

  // Inspect #apply-submit
  const info = await page.evaluate(() => {
    const btn = document.querySelector("#apply-submit") as HTMLElement | null;
    if (!btn) return { exists: false };
    const styles = window.getComputedStyle(btn);
    return {
      exists: true,
      id: btn.id,
      tag: btn.tagName,
      type: btn.getAttribute("type"),
      onclick: btn.getAttribute("onclick"),
      form: btn.getAttribute("form"),
      class: btn.className,
      display: styles.display,
      visibility: styles.visibility,
      opacity: styles.opacity,
      parentForm: btn.closest("form")?.outerHTML?.slice(0, 500),
      nextSiblingHTML: btn.nextElementSibling?.outerHTML?.slice(0, 200),
      outerHTML: btn.outerHTML.slice(0, 500),
    };
  });
  console.log(JSON.stringify(info, null, 2));

  // Find apply-related links/buttons in page
  const applyEls = await page.evaluate(() => {
    const results: { text: string; tag: string; outer: string; visible: boolean }[] = [];
    document.querySelectorAll("a, button, input").forEach((el) => {
      const text = (el.textContent ?? "") + " " + ((el as HTMLInputElement).value ?? "");
      if (/提携申請|申請する/.test(text)) {
        const styles = window.getComputedStyle(el);
        results.push({
          text: text.trim().slice(0, 50),
          tag: el.tagName,
          outer: el.outerHTML.slice(0, 300),
          visible: styles.display !== "none" && styles.visibility !== "hidden",
        });
      }
    });
    return results;
  });
  console.log("\n=== apply 関連要素 ===");
  for (const e of applyEls) console.log(`[${e.visible ? "VIS" : "HIDDEN"}] ${e.tag} "${e.text}"\n  ${e.outer}\n`);

  await context.close();
}
main();
