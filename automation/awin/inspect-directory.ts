/**
 * Awin merchant-directory (Join Programs) ページの構造を調査
 *
 * 目的:
 *   - merchant カードのHTML構造を把握
 *   - Apply / Join ボタンのセレクタ特定
 *   - 検索バー / sector フィルターの仕組み
 *   - ページネーション形式
 *
 * Usage: npm run awin:inspect-dir
 */
import { launch, loadCredentials, ensureLoggedIn, PUBLISHER_ID } from "./_browser";

const URL = `https://ui.awin.com/awin/affiliate/${PUBLISHER_ID}/merchant-directory/index/tab/notJoined/page/1`;

async function main() {
  const creds = loadCredentials();
  const { context, page } = await launch({ headless: false });

  console.log("→ ログイン確認");
  await ensureLoggedIn(page, creds);
  console.log("✓ ログイン済");

  console.log(`→ ${URL}`);
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(8000);

  console.log(`現在URL: ${page.url()}`);
  await page.screenshot({ path: "/tmp/awin-directory.png", fullPage: true });
  console.log("✓ /tmp/awin-directory.png");

  // ページ構造調査
  const summary = await page.evaluate(() => {
    const out: any = {
      headings: [],
      buttons: [],
      inputs: [],
      selects: [],
      forms: [],
      merchantRows: [],
      pagination: [],
    };

    document.querySelectorAll("h1, h2, h3, h4").forEach((h) => {
      const t = (h.textContent || "").trim().slice(0, 80);
      if (t) out.headings.push(`${h.tagName}: ${t}`);
    });

    document.querySelectorAll("button").forEach((b) => {
      const t = (b.textContent || "").trim().slice(0, 60);
      const className = (b as HTMLElement).className?.toString().slice(0, 60) || "";
      const id = b.id || "";
      const dataTest = b.getAttribute("data-testid") || b.getAttribute("data-test") || "";
      if (t || dataTest) {
        out.buttons.push({ text: t, className, id, dataTest });
      }
    });

    document.querySelectorAll("input").forEach((i) => {
      const ph = i.getAttribute("placeholder") || "";
      const name = i.getAttribute("name") || "";
      const type = i.getAttribute("type") || "";
      if (ph || name) out.inputs.push({ placeholder: ph, name, type });
    });

    document.querySelectorAll("select").forEach((s) => {
      const name = s.getAttribute("name") || "";
      const opts: string[] = [];
      s.querySelectorAll("option").forEach((o) => {
        const t = (o.textContent || "").trim().slice(0, 40);
        if (t) opts.push(t);
      });
      out.selects.push({ name, options: opts.slice(0, 20) });
    });

    document.querySelectorAll("form").forEach((f) => {
      const action = f.getAttribute("action") || "";
      const method = f.getAttribute("method") || "";
      out.forms.push({ action, method });
    });

    // merchant row 候補: tr / li / div with class "merchant" or "advertiser" or programme
    const rowCandidates: Element[] = [];
    document.querySelectorAll("tr").forEach((tr) => {
      if (tr.querySelectorAll("td").length >= 2) rowCandidates.push(tr);
    });
    document.querySelectorAll("[class*='merchant'], [class*='advertiser'], [class*='programme']").forEach((el) => {
      rowCandidates.push(el);
    });

    rowCandidates.slice(0, 5).forEach((row) => {
      const text = (row.textContent || "").trim().slice(0, 200);
      const buttons: string[] = [];
      row.querySelectorAll("button, a").forEach((btn) => {
        const t = (btn.textContent || "").trim().slice(0, 30);
        if (t) buttons.push(t);
      });
      const links: Array<{ text: string; href: string }> = [];
      row.querySelectorAll("a[href]").forEach((a) => {
        const t = (a.textContent || "").trim().slice(0, 30);
        const h = (a as HTMLAnchorElement).getAttribute("href") || "";
        if (t && h.includes("merchant-profile")) links.push({ text: t, href: h });
      });
      out.merchantRows.push({
        tag: row.tagName,
        className: (row as HTMLElement).className?.toString().slice(0, 80),
        text: text.slice(0, 150),
        buttons: [...new Set(buttons)].slice(0, 5),
        merchantLinks: links,
      });
    });

    // ページネーションリンク
    document.querySelectorAll("a[href*='/page/']").forEach((a) => {
      const t = (a.textContent || "").trim().slice(0, 10);
      const h = (a as HTMLAnchorElement).getAttribute("href") || "";
      if (t) out.pagination.push({ text: t, href: h });
    });
    out.pagination = out.pagination.slice(0, 10);

    return out;
  });

  console.log("\n=== Directory page structure ===");
  console.log(JSON.stringify(summary, null, 2));

  console.log("\n10秒後にブラウザを閉じます。");
  await page.waitForTimeout(10000);
  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
