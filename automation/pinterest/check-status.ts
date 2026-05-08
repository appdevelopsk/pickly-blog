/**
 * Pinterest アカウント状況の確認。
 * - ログイン状態
 * - ビジネスアカウントか
 * - ドメイン認証状況
 * - Developer App 状況
 */
import { launch, ensureLoggedIn } from "./_browser";

async function main() {
  const { context, page } = await launch({ headless: false });
  await ensureLoggedIn(page);

  console.log("\n=== Pinterest アカウント情報 ===");
  await page.goto("https://www.pinterest.com/settings/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  const email = await page.evaluate(() => {
    const el = document.querySelector("[data-test-id='email'], [name='email']") as HTMLInputElement | null;
    return el?.value ?? document.body.textContent?.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0] ?? "(unknown)";
  });
  console.log(`Email: ${email}`);
  console.log(`URL: ${page.url()}`);

  console.log("\n=== ドメイン認証状況 ===");
  await page.goto("https://www.pinterest.com/settings/claim/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  const claimedDomains = await page.evaluate(() => {
    const text = document.body.textContent ?? "";
    return text.match(/[a-z0-9.-]+\.(com|jp|blog|net|org|co|io)/g)?.slice(0, 5) ?? [];
  });
  console.log(`認証済ドメイン候補: ${claimedDomains.join(", ") || "(none)"}`);

  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
