import { launch, ensureLoggedIn } from "./_browser";

async function main() {
  const { context, page } = await launch({ headless: false });
  await ensureLoggedIn(page);
  await page.goto("https://af.moshimo.com/af/shop/promotion/detail?promotion_id=170", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  const visibleButtons = await page.evaluate(() => {
    const results: { tag: string; id: string; class: string; text: string; href?: string }[] = [];
    document.querySelectorAll("button, a, input[type='button'], input[type='submit']").forEach((el) => {
      const e = el as HTMLElement;
      if (e.offsetParent === null) return;
      const r = e.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      results.push({
        tag: e.tagName,
        id: e.id || "-",
        class: e.className.toString().slice(0, 40),
        text: (e.textContent ?? "" + (el as HTMLInputElement).value ?? "").trim().slice(0, 40),
        href: el.tagName === "A" ? (el as HTMLAnchorElement).href.slice(0, 60) : undefined,
      });
    });
    return results;
  });

  console.log(`=== Visible (offsetParent あり、サイズあり) buttons/links: ${visibleButtons.length}件 ===`);
  for (const b of visibleButtons.slice(0, 60)) {
    console.log(`${b.tag} id=${b.id} class="${b.class}" "${b.text}"${b.href ? ` → ${b.href}` : ""}`);
  }

  await context.close();
}
main();
