import { launch, ensureLoggedIn } from "./_browser";

async function main() {
  const { context, page } = await launch({ headless: true });
  await ensureLoggedIn(page);

  for (const kw of ["ConoHa WING", "ロリポップ", "Lolipop", "さくら", "HostGator"]) {
    const searchUrl = `https://af.moshimo.com/af/shop/promotion/search?words=${encodeURIComponent(kw)}`;
    await page.goto(searchUrl, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);

    const items = await page.evaluate(() => {
      const results: { name: string; url: string }[] = [];
      document.querySelectorAll("a[href*='/promotion/detail']").forEach(a => {
        const el = a as HTMLAnchorElement;
        if (el.textContent?.trim() === "プロモーション詳細") {
          const row = el.closest("tr");
          const name = row?.querySelector("td")?.textContent?.trim().slice(0, 80) ?? "";
          results.push({ name, url: el.href });
        }
      });
      return results;
    });

    console.log(`\n=== ${kw} ===`);
    if (items.length === 0) { console.log("  なし"); continue; }
    for (const it of items.slice(0, 3)) {
      console.log(`  ${it.name}`);
      console.log(`    ${it.url}`);
    }
  }

  await context.close();
}
main().catch(console.error);
