import { launch, ensureLoggedIn } from "./_browser";

async function main() {
  const { context, page } = await launch({ headless: true });
  await ensureLoggedIn(page);

  await page.goto("https://af.moshimo.com/af/shop/promotion/source/anywhere?promotion_id=1225&shop_site_id=671111", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // Read existing target_source
  const sourceText = await page.evaluate(() => {
    const ta = document.querySelector("textarea[name='target_source']") as HTMLTextAreaElement | null;
    return ta?.value ?? "";
  });
  console.log("Default target_source HTML:");
  console.log(sourceText);
  console.log("");

  // Extract URL
  const m = sourceText.match(/href=['"](\/\/af\.moshimo\.com\/af\/c\/click[^'"]+|https?:\/\/af\.moshimo\.com\/af\/c\/click[^'"]+)['"]/);
  if (m) {
    let url = m[1];
    if (url.startsWith("//")) url = "https:" + url;
    console.log("Extracted URL:", url);
    const u = new URL(url);
    console.log("a_id:", u.searchParams.get("a_id"));
    console.log("p_id:", u.searchParams.get("p_id"));
    console.log("pc_id:", u.searchParams.get("pc_id"));
    console.log("pl_id:", u.searchParams.get("pl_id"));
    console.log("target url:", u.searchParams.get("url"));
  }

  await context.close();
}
main();
