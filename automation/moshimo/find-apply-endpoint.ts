import { launch, ensureLoggedIn } from "./_browser";

async function main() {
  const { context, page } = await launch({ headless: false });
  await ensureLoggedIn(page);

  // ネットワーク監視を全リクエストに
  const reqs: { method: string; url: string; postData?: string }[] = [];
  page.on("request", (req) => {
    const url = req.url();
    if (url.includes("moshimo.com") && !url.includes("/static/") && !url.includes(".png") && !url.includes(".css") && !url.includes(".woff") && !url.includes(".js") && !url.includes(".ico")) {
      reqs.push({
        method: req.method(),
        url: url,
        postData: req.postData() ?? undefined,
      });
    }
  });

  await page.goto("https://af.moshimo.com/af/shop/promotion/detail?promotion_id=1225", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  console.log("=== 全 navigation/POST requests ===");
  for (const r of reqs) {
    console.log(`${r.method} ${r.url}${r.postData ? `\n  body: ${r.postData}` : ""}`);
  }

  // Find inline scripts that mention apply-submit
  const scripts = await page.evaluate(() => {
    const matches: string[] = [];
    document.querySelectorAll("script").forEach((s) => {
      const text = s.textContent ?? "";
      if (text.includes("apply-submit") || text.includes("apply_submit") || text.includes("/apply")) {
        // Get relevant section
        const idx = text.indexOf("apply");
        if (idx >= 0) {
          matches.push(text.slice(Math.max(0, idx - 100), idx + 400));
        }
      }
    });
    return matches;
  });
  console.log("\n=== apply 関連 inline JS ===");
  for (const m of scripts.slice(0, 3)) {
    console.log("---");
    console.log(m);
  }

  await context.close();
}
main();
