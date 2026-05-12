/**
 * A8.net から参加中プログラムのアフィリエイトリンクを取得する
 * Usage: npx tsx a8-get-links.ts
 */
import { chromium } from "playwright";
import { writeFileSync } from "fs";

process.loadEnvFile(new URL(".env", import.meta.url).pathname);
const A8_LOGIN = process.env.A8_LOGIN!;
const A8_PASSWORD = process.env.A8_PASSWORD!;

// 参加中プログラムのinsId一覧（プログラム一覧ページから確認済み）
const PROGRAMS: Record<string, string> = {
  "a8net":   "s00000000002006",
  "rakuten": "s00000011623001",
  "onamae":  "s00000000018015",  // お名前.com (GMOインターネット)
  "unknown1": "s00000005186001",
  "unknown2": "s00000005186002",
};

async function getAdLink(page: ReturnType<import("playwright").Browser["newPage"]> extends Promise<infer T> ? T : never, insId: string): Promise<void> {
  console.log(`\n広告リンクページ取得: insId=${insId}`);
  await page.goto(
    `https://pub.a8.net/a8v2/media/linkAction.do?insId=${insId}`,
    { waitUntil: "networkidle" }
  );
  await page.waitForTimeout(2000);

  writeFileSync(`/tmp/a8-link-${insId}.html`, await page.content());

  const pageText = await page.innerText("body").catch(() => "");
  console.log(`[${insId}] ページテキスト（最初800文字）:`, pageText.slice(0, 800));

  // px.a8.net リンクを抽出
  const links = await page.$$eval("a", (els: HTMLAnchorElement[]) =>
    els.map((e) => ({ text: e.textContent?.trim().replace(/\s+/g, " "), href: e.href }))
      .filter(l => l.href.includes("px.a8.net") || l.href.includes("a8mat"))
  );
  console.log(`[${insId}] A8追跡リンク:`, JSON.stringify(links, null, 2));

  // テキストエリアや input にもURLが入っていることがある
  const inputValues = await page.$$eval("input[type='text'], textarea", (els: (HTMLInputElement | HTMLTextAreaElement)[]) =>
    els.map(e => ({ name: e.name || e.id, value: e.value })).filter(v => v.value.includes("px.a8.net") || v.value.includes("a8mat"))
  );
  console.log(`[${insId}] フォームのA8リンク:`, JSON.stringify(inputValues, null, 2));
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  // ログイン
  console.log("A8.net ログイン中...");
  await page.goto("http://www.a8.net/", { waitUntil: "networkidle" });
  await page.fill("#asLoginId", A8_LOGIN);
  await page.fill('input[name="passwd"]', A8_PASSWORD);
  await page.click('input[name="login_as_btn"]');
  await page.waitForLoadState("networkidle");
  console.log("ログイン後URL:", page.url());

  // お名前.com の広告リンクを取得
  await getAdLink(page, PROGRAMS["onamae"]);

  // 他のプログラムも確認
  for (const [name, insId] of Object.entries(PROGRAMS)) {
    if (name !== "onamae") {
      await getAdLink(page, insId);
    }
  }

  await browser.close();
}

main().catch(console.error);
