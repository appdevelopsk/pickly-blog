import { launch, ensureLoggedIn } from "./_browser";

async function main() {
  const { context, page } = await launch({ headless: true });
  await ensureLoggedIn(page);

  for (const kw of ["VPN", "ExpressVPN", "NordVPN", "ConoHa"]) {
    const searchUrl = `https://af.moshimo.com/af/shop/promotion/search?words=${encodeURIComponent(kw)}`;
    await page.goto(searchUrl, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);

    const items = await page.evaluate(() => {
      const results: { name: string; url: string }[] = [];
      document.querySelectorAll("a[href*='/promotion/detail']").forEach(a => {
        const el = a as HTMLAnchorElement;
        const row = el.closest("tr") ?? el.closest("li") ?? el.parentElement;
        const name = row?.textContent?.trim().replace(/\s+/g, " ").slice(0, 120) ?? el.textContent?.trim() ?? "";
        if (el.textContent?.trim() === "プロモーション詳細") {
          results.push({ name, url: el.href });
        }
      });
      return results;
    });

    console.log(`\n=== ${kw} ===`);
    if (items.length === 0) console.log("  結果なし");
    for (const it of items.slice(0, 5)) {
      console.log(`  ${it.name.slice(0, 100)}`);
      console.log(`    → ${it.url}`);
    }
  }

  await context.close();
}
main().catch(console.error);
