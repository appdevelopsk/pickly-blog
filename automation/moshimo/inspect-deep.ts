import { launch, ensureLoggedIn } from "./_browser";

async function main() {
  const { context, page } = await launch({ headless: false });
  await ensureLoggedIn(page);
  await page.goto("https://af.moshimo.com/af/shop/promotion/detail?promotion_id=170", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // すべての apply-submit を網羅
  const all = await page.evaluate(() => {
    const results: Array<{
      idx: number;
      idIfAny?: string;
      tag: string;
      text: string;
      visible: boolean;
      offsetParent: boolean;
      bounding: { x: number; y: number; w: number; h: number };
    }> = [];
    const candidates = document.querySelectorAll("button, a, input");
    let i = 0;
    candidates.forEach((el) => {
      const text = (el.textContent ?? "") + " " + ((el as HTMLInputElement).value ?? "");
      if (/提携申請する|提携申請/.test(text)) {
        const r = el.getBoundingClientRect();
        const styles = window.getComputedStyle(el);
        results.push({
          idx: i++,
          idIfAny: el.id || undefined,
          tag: el.tagName,
          text: text.trim().slice(0, 30),
          visible: styles.display !== "none" && styles.visibility !== "hidden" && styles.opacity !== "0",
          offsetParent: !!(el as HTMLElement).offsetParent,
          bounding: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        });
      }
    });
    return results;
  });

  console.log("=== 提携申請 候補 ===");
  for (const c of all) {
    console.log(`[${c.idx}] tag=${c.tag} id=${c.idIfAny ?? "-"} text="${c.text}" visible=${c.visible} offsetParent=${c.offsetParent} bb=${JSON.stringify(c.bounding)}`);
  }

  // クリック候補を試行 (offsetParent あり=可視と判定された要素)
  const clickable = await page.evaluate(() => {
    const candidates = Array.from(document.querySelectorAll("button, a, input")).filter((el) => {
      const text = (el.textContent ?? "") + " " + ((el as HTMLInputElement).value ?? "");
      return /提携申請する/.test(text) && !!(el as HTMLElement).offsetParent;
    });
    return candidates.length;
  });
  console.log(`\nofsetParent あり=${clickable}`);

  await context.close();
}
main();
