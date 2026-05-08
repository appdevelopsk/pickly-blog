import { launch, ensureLoggedIn } from "./_browser";

async function main() {
  const { context, page } = await launch({ headless: false });
  await ensureLoggedIn(page);

  await page.goto("https://af.moshimo.com/af/shop/promotion/detail?promotion_id=1225", { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);

  // Find all forms and their submit/click triggers
  const formInfo = await page.evaluate(() => {
    const forms = Array.from(document.forms).map((f, i) => ({
      idx: i,
      action: f.action,
      method: f.method,
      formNameInput: (f.elements.namedItem("form_name") as HTMLInputElement)?.value,
      hiddenFields: Array.from(f.elements)
        .filter((el) => (el as HTMLInputElement).type === "hidden")
        .map((el) => `${(el as HTMLInputElement).name}=${(el as HTMLInputElement).value}`)
        .slice(0, 10),
      fields: Array.from(f.elements).map((el) => {
        const e = el as HTMLInputElement;
        return `${e.tagName}[${e.type}/${e.name}]`;
      }).slice(0, 30),
    }));
    return forms;
  });
  console.log("=== ALL FORMS ===");
  for (const f of formInfo) {
    console.log(`Form ${f.idx}: ${f.method} ${f.action}`);
    console.log(`  form_name: ${f.formNameInput}`);
    console.log(`  hidden: ${f.hiddenFields.join(", ")}`);
    console.log(`  fields: ${f.fields.slice(0, 8).join(", ")}`);
  }

  // Find any element with id or class containing 'apply'
  const applyEls = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll("[id*='apply'], [class*='apply']"));
    return els.map((el) => {
      const e = el as HTMLElement;
      return {
        tag: e.tagName,
        id: e.id,
        class: e.className.toString(),
        text: (e.textContent ?? "").trim().slice(0, 60),
        offsetParent: !!e.offsetParent,
        attrs: e.getAttributeNames().map((n) => `${n}=${e.getAttribute(n)?.slice(0, 50)}`).join(" "),
      };
    });
  });
  console.log("\n=== apply ID/class elements ===");
  for (const e of applyEls.slice(0, 20)) {
    console.log(`${e.tag} id=${e.id} class=${e.class.slice(0, 40)} visible=${e.offsetParent} "${e.text}"`);
  }

  // Find the JS that handles application by intercepting fetch/XHR
  console.log("\n=== Intercepting clicks - try clicking apply-submit and see ===");
  const beforeCount = await page.evaluate(() => document.body.innerHTML.length);

  // Listen to all network
  const allReqs: { method: string; url: string; postData: string | null }[] = [];
  const reqListener = (req: import("playwright").Request) => {
    if (req.url().includes("moshimo.com") && (req.method() === "POST" || !req.url().includes("collect"))) {
      allReqs.push({ method: req.method(), url: req.url().slice(0, 100), postData: req.postData() });
    }
  };
  page.on("request", reqListener);

  // Try clicking apply-submit via various methods
  console.log("→ Attempt 1: force display + click");
  await page.evaluate(() => {
    let el: HTMLElement | null = document.getElementById("apply-submit");
    while (el && el !== document.body) {
      el.style.display = el.tagName === "BUTTON" ? "inline-block" : "block";
      el.style.visibility = "visible";
      el = el.parentElement;
    }
    document.getElementById("apply-submit")?.click();
  });
  await page.waitForTimeout(3000);
  console.log(`  POST/相関リクエスト: ${allReqs.length}件`);
  for (const r of allReqs) console.log(`    ${r.method} ${r.url}${r.postData ? ` body=${r.postData.slice(0, 80)}` : ""}`);

  await context.close();
}
main();
