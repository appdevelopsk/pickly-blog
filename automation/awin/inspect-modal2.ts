/**
 * Awin Join モーダルの checkbox / label / submit の click handler を詳細調査
 * - label の有無、ID、領域
 * - jQuery の有無、bound events
 * - Submit ボタンの click handler 詳細
 */
import { launch, loadCredentials, ensureLoggedIn, PUBLISHER_ID } from "./_browser";

async function main() {
  const url = `https://ui.awin.com/awin/affiliate/${PUBLISHER_ID}/merchant-directory/index/tab/notJoined/page/1`;
  const creds = loadCredentials();
  const { context, page } = await launch({ headless: false });

  await ensureLoggedIn(page, creds, url);
  await page.waitForTimeout(5000);

  // 1番目クリック
  await page.locator("span.partnership-button.join-button").first().click();
  await page.waitForTimeout(3500);

  const detail = await page.evaluate(() => {
    const out: any = {};

    // checkbox 周辺 HTML
    const cb = document.querySelector("#accepted") as HTMLInputElement | null;
    if (cb) {
      const parent = cb.parentElement;
      out.checkboxHtml = cb.outerHTML;
      out.checkboxParentHtml = parent?.outerHTML.slice(0, 500);
      out.checkboxStyle = window.getComputedStyle(cb).cssText.slice(0, 300);
      out.checkboxRect = cb.getBoundingClientRect();
    }

    // label
    const label = document.querySelector("label[for='accepted']");
    out.labelHtml = label?.outerHTML.slice(0, 300);
    out.labelText = (label?.textContent || "").trim().slice(0, 200);

    // jQuery バインド (jQuery._data があれば)
    // @ts-ignore
    const $ = (window as any).jQuery || (window as any).$;
    out.hasJQuery = !!$;
    if ($) {
      try {
        // @ts-ignore
        const evs = $._data ? $._data($("#accepted")[0], "events") : null;
        out.checkboxEvents = evs ? Object.keys(evs) : [];
        // @ts-ignore
        const sevs = $._data ? $._data($("#membershipModal button.modal_save")[0], "events") : null;
        out.submitEvents = sevs ? Object.keys(sevs) : [];
      } catch (e: any) {
        out.jqueryErr = e.message?.slice(0, 100);
      }
    }

    // モーダル全体の HTML 末尾 (button 周辺)
    const modal = document.querySelector("#membershipModal");
    if (modal) {
      const html = modal.innerHTML;
      // Submit ボタンの周辺だけ
      const idx = html.indexOf("modal_save");
      if (idx >= 0) {
        out.submitContext = html.slice(Math.max(0, idx - 300), idx + 500);
      }
      // checkbox 周辺
      const idx2 = html.indexOf('id="accepted"');
      if (idx2 >= 0) {
        out.checkboxContext = html.slice(Math.max(0, idx2 - 400), idx2 + 400);
      }
    }

    return out;
  });

  console.log("=== checkbox / submit 詳細 ===");
  console.log(JSON.stringify(detail, null, 2));

  console.log("\n12秒後に閉じます — 手動で実際にチェック動作確認するなら今");
  await page.waitForTimeout(12000);
  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
