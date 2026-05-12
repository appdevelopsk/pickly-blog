/**
 * A8.net 参加中プログラムのアフィリエイトリンクを取得する
 * Usage: npx tsx a8/fetch-affiliate-links.ts
 */
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

process.loadEnvFile(new URL("../.env", import.meta.url).pathname);
const A8_LOGIN_ID = process.env.A8_LOGIN!;
const A8_PASSWORD = process.env.A8_PASSWORD!;

const PROGRAMS = [
  { id: "xserver",             name: "エックスサーバー",         insId: "s00000001642001" },
  { id: "sakura-rentalserver", name: "さくらのレンタルサーバ",   insId: "s00000001717001" },
  { id: "mixhost",             name: "mixhost",                   insId: "s00000016565001" },
  { id: "nordvpn",             name: "NordVPN",                   insId: "s00000018459001" },
  { id: "surfshark",           name: "Surfshark",                 insId: "s00000021488002" },
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  // ログイン
  console.log("A8.net ログイン中...");
  await page.goto("https://www.a8.net/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // ログインフォームを探す
  const loginId = page.locator("input#asLoginId, input[name='loginId'], input[name='login_id']").first();
  const pass    = page.locator("input[name='passwd'], input[name='password'], input[type='password']").first();
  const btn     = page.locator("input[name='login_as_btn'], input[type='submit'], button[type='submit']").first();

  await loginId.fill(A8_LOGIN_ID);
  await pass.fill(A8_PASSWORD);
  await btn.click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);

  const afterUrl = page.url();
  console.log("ログイン後URL:", afterUrl);
  if (afterUrl.includes("login") || afterUrl.includes("a8.net/?")) {
    console.error("✗ ログイン失敗");
    await browser.close();
    process.exit(1);
  }
  console.log("✓ ログイン成功\n");

  const results: Record<string, string[]> = {};

  for (const prog of PROGRAMS) {
    process.stdout.write(`取得中: ${prog.name} (${prog.insId}) ... `);
    try {
      await page.goto(
        `https://pub.a8.net/a8v2/media/linkAction.do?insId=${prog.insId}`,
        { waitUntil: "networkidle" }
      );
      await page.waitForTimeout(2000);

      // <a href> から px.a8.net リンクを抽出
      const hrefLinks: string[] = await page.$$eval(
        "a",
        (els: HTMLAnchorElement[]) =>
          els.map((e) => e.href).filter((h) => h.includes("px.a8.net") || h.includes("a8mat"))
      );

      // input[type=text] / textarea から URL を抽出
      const inputLinks: string[] = await page.$$eval(
        "input[type='text'], textarea",
        (els: (HTMLInputElement | HTMLTextAreaElement)[]) =>
          els.flatMap((e) => {
            const v = (e as HTMLInputElement).value ?? "";
            return (v.match(/https?:\/\/px\.a8\.net\/[^\s"'<>]+/g) ?? []) as string[];
          })
      );

      const links = [...new Set([...hrefLinks, ...inputLinks])];
      results[prog.id] = links;

      if (links.length > 0) {
        console.log(`✓ ${links.length}件`);
        links.forEach((l) => console.log(`  ${l}`));
      } else {
        const text = await page.innerText("body").catch(() => "");
        if (text.includes("参加していません") || text.includes("提携していません")) {
          console.log("⚠ 未参加");
        } else if (text.includes("審査中") || text.includes("申請中")) {
          console.log("⏳ 審査中");
        } else {
          console.log("? リンク未発見");
          writeFileSync(`/tmp/a8-${prog.id}.html`, await page.content());
          await page.screenshot({ path: `/tmp/a8-${prog.id}.png` });
          console.log(`  デバッグ: /tmp/a8-${prog.id}.png`);
        }
      }
    } catch (err) {
      console.log(`✗ エラー: ${err}`);
      results[prog.id] = [];
    }
    await page.waitForTimeout(1500);
  }

  writeFileSync("/tmp/a8-affiliate-links.json", JSON.stringify(results, null, 2));
  console.log("\n→ 結果: /tmp/a8-affiliate-links.json");
  console.log(JSON.stringify(results, null, 2));

  await browser.close();
}

main().catch(console.error);
