import { launch, ensureLoggedIn } from "./_browser";

async function main() {
  const { context, page } = await launch({ headless: true });
  await ensureLoggedIn(page);

  await page.goto("https://af.moshimo.com/af/shop/promotion/source/anywhere?promotion_id=1225&shop_site_id=671111", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // form analysis
  const forms = await page.evaluate(() => {
    return Array.from(document.forms).map((f) => ({
      action: f.action,
      method: f.method,
      formName: (f.elements.namedItem("form_name") as HTMLInputElement)?.value,
      fields: Array.from(f.elements).map((el) => {
        const e = el as HTMLInputElement;
        return { tag: e.tagName, type: e.type, name: e.name, id: e.id, value: (e.value || "").slice(0, 40) };
      }),
    }));
  });
  console.log("=== Forms ===");
  for (const f of forms) {
    console.log(`${f.method.toUpperCase()} ${f.action}`);
    console.log(`  form_name: ${f.formName}`);
    for (const fld of f.fields) {
      console.log(`  ${fld.tag}[${fld.type}/${fld.name || fld.id}] = ${fld.value}`);
    }
  }

  // Find any pre-existing affiliate URLs (template / sample)
  const existingUrls = await page.evaluate(() => {
    const urls: string[] = [];
    document.querySelectorAll("textarea, input").forEach((el) => {
      const v = (el as HTMLInputElement).value || "";
      if (v.includes("af.moshimo.com/af/c/click")) urls.push(v.slice(0, 200));
    });
    document.querySelectorAll("a").forEach((a) => {
      const h = (a as HTMLAnchorElement).href;
      if (h.includes("af.moshimo.com/af/c/click")) urls.push(h.slice(0, 200));
    });
    return urls;
  });
  console.log("\n=== 既存 click URLs ===");
  for (const u of existingUrls.slice(0, 5)) console.log(u);

  await context.close();
}
main();
