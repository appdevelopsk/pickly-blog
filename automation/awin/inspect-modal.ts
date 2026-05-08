/**
 * Awin Join モーダルの全構造を取得
 *
 * - directory page を開く
 * - 1件 span#action{id} クリックでモーダル展開
 * - モーダル内のボタン全部、checkbox、スクロール状態、disabled状態を dump
 */
import { launch, loadCredentials, ensureLoggedIn, PUBLISHER_ID } from "./_browser";

async function main() {
  const url = `https://ui.awin.com/awin/affiliate/${PUBLISHER_ID}/merchant-directory/index/tab/notJoined/page/1`;
  const creds = loadCredentials();
  const { context, page } = await launch({ headless: false });

  await ensureLoggedIn(page, creds);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(5000);

  // 1番目の merchant の Join span をクリック
  const target = await page.evaluate(() => {
    const span = document.querySelector("span.partnership-button.join-button");
    return {
      id: span?.id || "",
      merchantId: span?.getAttribute("data-merchantid") || "",
      text: (span?.textContent || "").trim(),
    };
  });
  console.log(`→ クリック対象: ${JSON.stringify(target)}`);

  await page.locator(`#${target.id}`).first().click();
  await page.waitForTimeout(3500);

  await page.screenshot({ path: "/tmp/awin-modal-open.png", fullPage: true });

  // モーダル要素を探索 (Awinは色んなクラス使ってる可能性)
  const modalAnalysis = await page.evaluate(() => {
    const out: any = {
      modalContainers: [],
      allButtons: [],
      checkboxes: [],
      scrollables: [],
    };

    // 候補となるモーダル/ダイアログコンテナ
    const candidates = [
      ".modal", ".modal.in", ".modal.show", ".modal-dialog",
      "[role='dialog']", ".ui-dialog", ".popup", ".overlay",
      "#joinProgrammeModal", "[id*='odal']",
    ];
    for (const sel of candidates) {
      document.querySelectorAll(sel).forEach((el) => {
        const visible = (el as HTMLElement).offsetParent !== null;
        if (visible) {
          out.modalContainers.push({
            sel,
            id: el.id || "",
            cls: (el as HTMLElement).className?.toString().slice(0, 80),
            innerTextLen: (el as HTMLElement).innerText?.length || 0,
            innerHTMLPreview: (el as HTMLElement).innerHTML.slice(0, 250),
          });
        }
      });
    }

    // 全 visible button (モーダル外含む)
    document.querySelectorAll("button, input[type='submit'], input[type='button']").forEach((b) => {
      const visible = (b as HTMLElement).offsetParent !== null;
      if (!visible) return;
      const text = (b.textContent || (b as HTMLInputElement).value || "").trim().slice(0, 60);
      const id = b.id || "";
      const cls = (b as HTMLElement).className?.toString().slice(0, 80) || "";
      const disabled = (b as HTMLButtonElement).disabled;
      out.allButtons.push({ text, id, cls, disabled, tag: b.tagName });
    });

    // Checkbox
    document.querySelectorAll("input[type='checkbox']").forEach((c) => {
      const visible = (c as HTMLElement).offsetParent !== null;
      const name = c.getAttribute("name") || "";
      const id = c.id || "";
      const checked = (c as HTMLInputElement).checked;
      const labelText = c.closest("label")?.textContent?.trim().slice(0, 80) || "";
      out.checkboxes.push({ visible, name, id, checked, labelText });
    });

    // スクロール可能な要素
    document.querySelectorAll("*").forEach((el) => {
      const e = el as HTMLElement;
      const sh = e.scrollHeight, ch = e.clientHeight;
      if (sh > ch + 50 && ch > 100 && ch < 800) {
        out.scrollables.push({
          tag: e.tagName,
          id: e.id || "",
          cls: e.className?.toString().slice(0, 60),
          scrollHeight: sh,
          clientHeight: ch,
          scrollTop: e.scrollTop,
        });
      }
    });
    out.scrollables = out.scrollables.slice(0, 10);

    return out;
  });

  console.log("\n=== モーダル構造分析 ===");
  console.log(JSON.stringify(modalAnalysis, null, 2));

  console.log("\n12秒後にブラウザを閉じます — 手動でモーダル状態確認可");
  await page.waitForTimeout(12000);
  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
