/**
 * /apps/ ページから App Secret 表示ページへの正しいパスを探索
 */
import { launch, ensureLoggedIn } from "./_browser";

async function main() {
  const { context, page } = await launch({ headless: false });
  await ensureLoggedIn(page);

  await page.goto("https://developers.pinterest.com/apps/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  // App card 内の全リンクを抽出
  const links = await page.evaluate(() => {
    const card = Array.from(document.querySelectorAll("[class*='app'], [class*='card'], li, article, div")).find(
      (el) => /Pickly Pin Bot/i.test(el.textContent ?? ""),
    );
    if (!card) return { error: "card not found", searchText: document.body.textContent?.slice(0, 500) ?? "" };
    const linkEls = Array.from(card.querySelectorAll("a"));
    return {
      cardHtml: card.outerHTML.slice(0, 3000),
      links: linkEls.map((a) => ({
        href: a.href,
        text: a.textContent?.trim().slice(0, 50),
        ariaLabel: a.getAttribute("aria-label"),
      })),
    };
  });

  console.log("=== Pickly Pin Bot card 内のリンク ===");
  if ("error" in links) {
    console.log("Error:", links.error);
    console.log("body excerpt:", (links as { searchText?: string }).searchText);
  } else {
    for (const l of links.links) {
      console.log(`  "${l.text}"${l.ariaLabel ? ` aria=${l.ariaLabel}` : ""} → ${l.href}`);
    }
    console.log("\n=== card HTML (excerpt) ===");
    console.log(links.cardHtml.slice(0, 1500));
  }

  // 全 nav/sidebar links
  const navLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("nav a, aside a, [role='navigation'] a"))
      .map((a) => ({ text: (a.textContent ?? "").trim().slice(0, 40), href: (a as HTMLAnchorElement).href }))
      .filter((l) => l.text);
  });
  console.log("\n=== nav links ===");
  for (const l of navLinks.slice(0, 15)) console.log(`  "${l.text}" → ${l.href}`);

  await context.close();
}
main();
