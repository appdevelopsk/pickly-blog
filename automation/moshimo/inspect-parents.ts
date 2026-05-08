import { launch, ensureLoggedIn } from "./_browser";

async function main() {
  const { context, page } = await launch({ headless: false });
  await ensureLoggedIn(page);
  await page.goto("https://af.moshimo.com/af/shop/promotion/detail?promotion_id=1225", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  const info = await page.evaluate(() => {
    const btn = document.querySelector("#apply-submit") as HTMLElement | null;
    if (!btn) return { error: "no button" };
    const parents: { tag: string; id: string; class: string; display: string; visibility: string; height: number }[] = [];
    let el: HTMLElement | null = btn;
    while (el && el !== document.body && parents.length < 8) {
      const styles = window.getComputedStyle(el);
      parents.push({
        tag: el.tagName,
        id: el.id || "-",
        class: el.className.toString().slice(0, 50),
        display: styles.display,
        visibility: styles.visibility,
        height: el.getBoundingClientRect().height,
      });
      el = el.parentElement;
    }
    return { parents };
  });
  console.log(JSON.stringify(info, null, 2));
  await context.close();
}
main();
