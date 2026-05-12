/**
 * もしも - 誤申請したプロモーションを取り消す
 */
import { launch, ensureLoggedIn } from "./_browser";

async function main() {
  // 大豆テンペCHIPS promotion_id=7433
  const PROMO_ID = "7433";
  const { context, page } = await launch({ headless: false });
  await ensureLoggedIn(page);

  // プロモーション詳細ページへ
  await page.goto(
    `https://af.moshimo.com/af/shop/promotion/detail?promotion_id=${PROMO_ID}&shop_site_id=671111`,
    { waitUntil: "networkidle" }
  );
  await page.waitForTimeout(2000);
  
  const title = await page.title();
  console.log("プロモーション:", title);
  
  const bodyText = await page.innerText("body").catch(() => "");
  console.log("ページテキスト(600):", bodyText.slice(0, 600));
  
  // 申請取り消し/解約ボタンを探す
  const cancelBtn = page.locator(
    "button:has-text('解約'), button:has-text('申請取り消'), a:has-text('解約'), a:has-text('申請取り消'), input[value*='解約'], input[value*='申請取消']"
  ).first();
  
  if ((await cancelBtn.count()) > 0) {
    console.log("→ 取り消しボタン発見");
    await cancelBtn.click();
    await page.waitForTimeout(3000);
    const afterText = await page.innerText("body").catch(() => "");
    console.log("取り消し後:", afterText.slice(0, 300));
  } else {
    console.log("取り消しボタンなし。全ボタン:");
    const btns = await page.locator("button, a").all();
    for (const b of btns.slice(0, 20)) {
      const t = (await b.textContent())?.trim();
      if (t && t.length < 30) console.log("  -", t);
    }
  }
  
  await page.waitForTimeout(5000);
  await context.close();
}

main().catch(console.error);
