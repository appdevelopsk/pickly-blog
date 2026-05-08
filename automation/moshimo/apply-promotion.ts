/**
 * もしも - 指定キーワードのプロモーションに提携申請する。
 *
 * Usage:
 *   npm run moshimo:apply-promotion -- Amazon
 *   npm run moshimo:apply-promotion -- 楽天市場
 *   npm run moshimo:apply-promotion -- "Yahoo!ショッピング"
 *
 * 動作:
 *   1. プロモーション検索ページへ移動 (/af/shop/promotion/search)
 *   2. キーワード入力 → 検索
 *   3. 最初のヒット案件詳細ページへ
 *   4. 既提携 / 申請中なら skip 、未申請なら「提携申請」ボタンクリック
 */
import { launch, ensureLoggedIn } from "./_browser";

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error("Usage:");
    console.error("  npm run moshimo:apply-promotion -- --id 170      # by promotion ID");
    console.error("  npm run moshimo:apply-promotion -- Amazon         # by keyword");
    process.exit(2);
  }

  const { context, page } = await launch({ headless: false });
  await ensureLoggedIn(page);

  let detailUrl: string;

  if (arg === "--id") {
    const id = process.argv[3];
    if (!id) { console.error("--id requires a promotion id"); process.exit(2); }
    console.log(`→ promotion_id=${id} へ直接 navigate`);
    detailUrl = `https://af.moshimo.com/af/shop/promotion/detail?promotion_id=${id}`;
  } else {
    const keyword = arg;
    console.log(`→ プロモーション検索: "${keyword}"`);
    const searchUrl = `https://af.moshimo.com/af/shop/promotion/search?words=${encodeURIComponent(keyword)}`;
    await page.goto(searchUrl, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    const detailLinks = page.locator("a[href*='/promotion/detail']");
    const count = await detailLinks.count();
    if (count === 0) {
      console.error(`✗ "${keyword}" の検索結果が空`);
      await context.close();
      process.exit(1);
    }
    // 「プロモーション詳細」テキストを持つリンクを優先選択
    let chosenIdx = -1;
    for (let i = 0; i < count; i++) {
      const text = (await detailLinks.nth(i).textContent())?.trim();
      if (text === "プロモーション詳細") { chosenIdx = i; break; }
    }
    if (chosenIdx < 0) chosenIdx = 0;
    const detailHref = await detailLinks.nth(chosenIdx).getAttribute("href");
    if (!detailHref) {
      console.error("✗ 詳細リンクの href が取れません");
      await context.close();
      process.exit(1);
    }
    detailUrl = detailHref.startsWith("http") ? detailHref : `https://af.moshimo.com${detailHref}`;
    console.log(`→ 検索ヒット: ${detailUrl}`);
  }

  await page.goto(detailUrl, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);
  console.log(`  プロモーション: ${(await page.title()).slice(0, 80)}`);

  // 提携申請ボタンの存在で判定 (「提携中」テキストはサイドバーにも出るので false positive)
  console.log("→ 提携申請ボタン探索");
  const applyBtn = page
    .locator("#content button:has-text('提携申請'), #content a:has-text('提携申請'), #content input[value*='提携申請'], main button:has-text('提携申請'), main a:has-text('提携申請')")
    .first();
  const altBtn = page
    .locator("#content button:has-text('申請する'), #content a:has-text('申請する'), main button:has-text('申請する'), main a:has-text('申請する')")
    .first();

  let chosen = null;
  if ((await applyBtn.count()) > 0) chosen = applyBtn;
  else if ((await altBtn.count()) > 0) chosen = altBtn;

  if (!chosen) {
    // 提携済 or 申請中 の判定
    const statusBadge = await page.locator("#content :is(.status, .label, .badge, .approval), main :is(.status, .label)").allTextContents();
    const hasStatus = statusBadge.some((s) => /提携済|申請中|提携中|承認済/.test(s));
    if (hasStatus) {
      console.log(`✓ 既に提携済 or 申請中 — skip (badge: ${statusBadge.join(", ").slice(0, 100)})`);
    } else {
      console.error("✗ 提携申請ボタンが見つかりません(画面構造が変わった可能性)");
      // demo: 全 button/a の内容を一部出力
      const allButtons = await page.locator("#content button, #content a, main button, main a").all();
      console.log(`  #content/main の clickable 要素 ${allButtons.length} 個:`);
      for (const b of allButtons.slice(0, 15)) {
        const t = (await b.textContent())?.trim().slice(0, 40);
        if (t) console.log(`    - ${t}`);
      }
    }
    await context.close();
    return;
  }

  // ブラウザの confirm/alert ダイアログを自動受諾
  page.on("dialog", async (dialog) => {
    console.log(`  → dialog detected: "${dialog.message()}", accept`);
    await dialog.accept();
  });

  // network レスポンスを監視
  const responses: string[] = [];
  page.on("response", (resp) => {
    const url = resp.url();
    if (url.includes("apply") || url.includes("promotion")) {
      responses.push(`${resp.status()} ${resp.request().method()} ${url.slice(0, 80)}`);
    }
  });

  console.log("→ 提携申請ボタンクリック (.js-affiliate_apply)");
  // 正しいセレクタは .js-affiliate_apply クラスのボタン (visible で実際にトリガーされる)
  // #apply-submit は別用途の hidden ボタン
  const applyButton = page.locator("button.js-affiliate_apply").first();
  if ((await applyButton.count()) === 0) {
    console.error("✗ button.js-affiliate_apply が見つかりません");
    await context.close();
    process.exit(1);
  }
  await applyButton.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await applyButton.click();
  await page.waitForTimeout(4000);
  console.log(`  関連 responses: ${responses.length}件`);
  for (const r of responses.slice(-5)) console.log(`    ${r}`);
  // ページ遷移 or AJAX 完了待ち
  await page.waitForTimeout(3000);

  // 確認モーダル/ページが出る場合: 「同意して申請」「規約に同意して申請」 等
  const confirmBtn = page.locator("button:has-text('同意'), button:has-text('規約に同意'), button:has-text('確定'), input[value*='同意'], input[value*='申請']").last();
  if ((await confirmBtn.count()) > 0) {
    const visible = await confirmBtn.isVisible().catch(() => false);
    if (visible) {
      console.log("→ 確認画面で確定ボタン");
      await confirmBtn.click({ force: true });
      await page.waitForTimeout(2000);
    }
  }
  // ページ遷移確認
  console.log(`  申請後URL: ${page.url()}`);
  // スクリーンショットで現状確認
  await page.screenshot({ path: "/tmp/moshimo-after-apply.png", fullPage: false });
  console.log("  /tmp/moshimo-after-apply.png に保存");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(1500);

  // メディア選択画面 (Pickly チェック)
  const picklyOption = page.locator("label:has-text('Pickly') input, input[value*='Pickly']").first();
  if ((await picklyOption.count()) > 0) {
    const checked = await picklyOption.isChecked().catch(() => false);
    if (!checked) {
      await picklyOption.check();
      console.log("→ メディアとして Pickly をチェック");
    }
  }

  // 最終確認: 申請後の状態をチェック
  await page.waitForTimeout(2000);
  console.log(`  最終URL: ${page.url()}`);
  // フルページスクリーンショット
  await page.screenshot({ path: "/tmp/moshimo-final.png", fullPage: true });
  console.log("  /tmp/moshimo-final.png にフルページ保存");

  console.log(`✓ 提携申請送信 (id=${arg === "--id" ? process.argv[3] : arg})`);
  await page.waitForTimeout(1500);
  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
