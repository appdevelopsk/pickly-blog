/**
 * 1件の merchant に Join を試行 (テスト用)
 *
 * 1. directory page を開く
 * 2. searchTerms で merchant 名を絞り込み (任意)
 * 3. 各行の Actions 列にある "Join" リンクの DOM 構造を dump
 * 4. 最初の Join をクリック → 何が起こるか観察 (modal? URL? AJAX?)
 *
 * Usage: npm run awin:apply-one [search_keyword]
 *   default: "Ottocast"
 */
import { launch, loadCredentials, ensureLoggedIn, PUBLISHER_ID } from "./_browser";

async function main() {
  const keyword = process.argv[2] || "Ottocast";
  const url = `https://ui.awin.com/awin/affiliate/${PUBLISHER_ID}/merchant-directory/index/tab/notJoined/page/1`;

  const creds = loadCredentials();
  const { context, page } = await launch({ headless: false });

  console.log("→ ログイン (target=directory)");
  await ensureLoggedIn(page, creds, url);
  await page.waitForTimeout(5000);

  // 検索スキップ — page 1 のまま全行を扱う
  console.log(`現在URL: ${page.url()}`);
  await page.screenshot({ path: "/tmp/awin-search-result.png", fullPage: false });

  // 全要素 (tag問わず) で「Join」「Apply」テキストを含むものを dump
  const joinLinks = await page.evaluate(() => {
    const out: Array<{ tag: string; text: string; href: string; cls: string; onclick: string; rowText: string; merchantId: string; outerHTML: string }> = [];
    // tr/td/a/button/span 全部で text が短い「Join」を含むもの
    const all = document.querySelectorAll("a, button, input[type='submit'], [onclick], span, td");
    all.forEach((el) => {
      const text = (el.textContent || (el as HTMLInputElement).value || "").trim();
      if (text && text.length < 20 && /^join$|^apply$|join now/i.test(text)) {
        const tr = el.closest("tr");
        const merchantLink = tr?.querySelector("a[href*='merchant-profile']") as HTMLAnchorElement | null;
        const merchantId = merchantLink?.getAttribute("href")?.match(/merchant-profile\/(\d+)/)?.[1] || "";
        const rowText = tr ? (tr.textContent || "").trim().replace(/\s+/g, " ").slice(0, 120) : "";

        out.push({
          tag: el.tagName,
          text: text.slice(0, 20),
          href: (el as HTMLAnchorElement).getAttribute?.("href") || "",
          cls: (el as HTMLElement).className?.toString().slice(0, 80),
          onclick: el.getAttribute("onclick")?.slice(0, 120) || "",
          rowText,
          merchantId,
          outerHTML: (el as HTMLElement).outerHTML.slice(0, 200),
        });
      }
    });

    // 各 tr の HTML も最初の1つだけ dump (構造把握用)
    const firstTr = document.querySelector("tr.light, tr.basic");
    if (firstTr) {
      out.unshift({
        tag: "_DEBUG_FIRST_ROW",
        text: "",
        href: "",
        cls: (firstTr as HTMLElement).className,
        onclick: "",
        rowText: "",
        merchantId: "",
        outerHTML: (firstTr as HTMLElement).outerHTML.slice(0, 1500),
      } as any);
    }
    return out;
  });

  console.log("\n--- 'Join' リンク候補 ---");
  console.log(JSON.stringify(joinLinks, null, 2));

  if (joinLinks.length === 0) {
    console.log("✗ Join リンク見つからず — 別tab か login切れか");
    await page.waitForTimeout(8000);
    await context.close();
    return;
  }

  // 最も具体性の高い候補 = span.partnership-button.join-button (id=action{id})
  const joinSpan = joinLinks.find((c) => c.cls?.includes("join-button") && c.merchantId);
  if (!joinSpan) {
    console.log("✗ join-button span が見つからない");
    await page.waitForTimeout(8000);
    await context.close();
    return;
  }

  console.log(`\n→ Join click target: span#action${joinSpan.merchantId} (merchant ${joinSpan.merchantId})`);

  page.on("dialog", async (d) => {
    console.log(`  [dialog: ${d.type()}] ${d.message()}`);
    await d.accept();
  });
  page.on("popup", async (p) => {
    console.log(`  [popup] ${p.url()}`);
  });
  page.on("framenavigated", (f) => {
    if (f === page.mainFrame()) console.log(`  [navigated] ${f.url()}`);
  });

  const beforeUrl = page.url();
  await page.locator(`span#action${joinSpan.merchantId}.join-button`).first().click().catch(async (e) => {
    console.log(`  primary click error: ${e.message?.slice(0, 80)}`);
    await page.locator("span.join-button").first().click().catch((e2) => {
      console.log(`  fallback click error: ${e2.message?.slice(0, 80)}`);
    });
  });

  // モーダル展開待ち (#membershipModal)
  console.log("→ モーダル展開待機");
  await page.locator("#membershipModal").waitFor({ state: "visible", timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1500);

  // T&Cを段階的スクロール → scroll event を発火 (Awin が listener 持つ可能性)
  console.log("→ T&C スクロール (段階的 + event dispatch)");
  await page.evaluate(async () => {
    const terms = document.querySelector(".termsContent.max-height-md") as HTMLElement | null;
    if (!terms) return;
    const max = terms.scrollHeight;
    // 50ステップで段階的スクロール → scroll event 発火
    for (let i = 0; i <= 50; i++) {
      terms.scrollTop = (max * i) / 50;
      terms.dispatchEvent(new Event("scroll", { bubbles: true }));
      await new Promise((r) => setTimeout(r, 30));
    }
    terms.scrollTop = max;
    terms.dispatchEvent(new Event("scroll", { bubbles: true }));
  });
  await page.waitForTimeout(800);

  // checkbox に native click → jQuery change handler が disabled クラスを外す
  console.log("→ T&C 同意 checkbox を native click");
  const checked = await page.evaluate(() => {
    const cb = document.querySelector("#accepted") as HTMLInputElement | null;
    if (!cb) return { ok: false, reason: "no #accepted" };
    cb.click();
    return { ok: true, checked: cb.checked };
  });
  console.log(`  ${JSON.stringify(checked)}`);
  await page.waitForTimeout(1500);

  // 緑の Join ボタンをクリック (button.modal_save)
  console.log("→ button.modal_save をクリック (申請確定)");
  const submitBtn = page.locator("#membershipModal button.modal_save, button.btn-small-green.modal_save").first();
  if ((await submitBtn.count()) === 0) {
    console.log("✗ button.modal_save 見つからず");
  } else {
    // disabled クラスチェック
    const stillDisabled = await submitBtn.evaluate((el) =>
      (el as HTMLElement).className?.includes("btn-small-green-disabled")
    );
    console.log(`  Submit button disabled? ${stillDisabled}`);
    await submitBtn.click({ force: true }).catch((e) => {
      console.log(`  modal click error: ${e.message?.slice(0, 80)}`);
    });
    await page.waitForTimeout(6000);
  }

  console.log(`\n--- click 後 ---`);
  console.log(`URL: ${page.url()} (was ${beforeUrl})`);
  await page.screenshot({ path: "/tmp/awin-after-join-click.png", fullPage: true });

  const afterState = await page.evaluate(() => {
    const out: any = {
      hasModal: false,
      modalText: "",
      headings: [],
      buttons: [],
      visibleText: "",
    };
    // モーダル検出
    const modal = document.querySelector(".modal:not([style*='display: none']), [role='dialog'], .ui-dialog");
    if (modal) {
      out.hasModal = true;
      out.modalText = (modal as HTMLElement).innerText?.slice(0, 800) || "";
    }
    document.querySelectorAll("h1, h2, h3").forEach((h) => {
      const t = (h.textContent || "").trim().slice(0, 80);
      if (t) out.headings.push(`${h.tagName}: ${t}`);
    });
    document.querySelectorAll("button:not([type='hidden']), input[type='submit']").forEach((b) => {
      const text = (b.textContent || (b as HTMLInputElement).value || "").trim().slice(0, 60);
      const visible = (b as HTMLElement).offsetParent !== null;
      if (text && visible) out.buttons.push(text);
    });
    out.buttons = [...new Set(out.buttons)].slice(0, 15);
    out.visibleText = document.body.innerText.slice(0, 1500);
    return out;
  });

  console.log(JSON.stringify(afterState, null, 2));

  console.log("\n12秒後にブラウザを閉じます (確認するなら手動でこの間に操作)");
  await page.waitForTimeout(12000);
  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
