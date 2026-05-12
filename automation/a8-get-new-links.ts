/**
 * 提携完了プログラムのA8広告リンクを取得する
 * Usage: npx tsx a8-get-new-links.ts
 */
import { chromium, type Page } from "playwright";

process.loadEnvFile(new URL(".env", import.meta.url).pathname);
const A8_LOGIN = process.env.A8_LOGIN!;
const A8_PASSWORD = process.env.A8_PASSWORD!;

const PROGRAMS = [
  { name: "エックスサーバー", insId: "s00000001642001" },
  { name: "mixhost",          insId: "s00000016565001" },
  { name: "NordVPN",          insId: "s00000018459001" },
  { name: "Surfshark",        insId: "s00000021488002" },
];

async function getTextLink(page: Page, insId: string, name: string): Promise<string | null> {
  await page.goto(
    `https://pub.a8.net/a8v2/media/linkAction.do?insId=${insId}`,
    { waitUntil: "networkidle" }
  );
  await page.waitForTimeout(2000);

  // テキストタイプのリンクに絞り込む（テキスト広告タブをクリック）
  const textTab = await page.$("a:has-text('テキスト'), label:has-text('テキスト'), input[value='テキスト']");
  if (textTab) {
    await textTab.click();
    await page.waitForTimeout(1500);
  }

  // input[name="code"] の value から px.a8.net URL を抽出
  const codeValues: string[] = await page.$$eval(
    "input[name='code'], textarea[name='code']",
    (els: (HTMLInputElement | HTMLTextAreaElement)[]) => els.map((e) => e.value)
  );

  // px.a8.net の URL だけ抽出
  const trackingUrls = codeValues
    .map((v) => {
      const m = v.match(/https?:\/\/px\.a8\.net\/svt\/ejp\?a8mat=[^\s"'<>]+/);
      return m ? m[0] : null;
    })
    .filter(Boolean) as string[];

  console.log(`[${name}] 取得リンク数: ${trackingUrls.length}`);
  if (trackingUrls.length > 0) {
    // テキストリンク（シンプルなURL形式）を優先、なければ最初のものを使用
    const simpleUrl = trackingUrls.find((u) => !u.includes("redirect") && u.length < 80);
    const chosen = simpleUrl ?? trackingUrls[0];
    console.log(`[${name}] 採用URL: ${chosen}`);
    return chosen;
  }

  // フォールバック: href に px.a8.net を含むリンク
  const hrefs = await page.$$eval("a[href*='px.a8.net']", (els: HTMLAnchorElement[]) =>
    els.map((e) => e.href)
  );
  if (hrefs.length > 0) {
    console.log(`[${name}] href から取得: ${hrefs[0]}`);
    return hrefs[0];
  }

  console.log(`[${name}] ⚠️ リンク取得失敗`);
  return null;
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

  const results: Record<string, string> = {};

  for (const p of PROGRAMS) {
    try {
      const url = await getTextLink(page, p.insId, p.name);
      if (url) results[p.name] = url;
    } catch (err) {
      console.error(`${p.name} エラー:`, err);
    }
    await page.waitForTimeout(2000);
  }

  console.log("\n========== 結果まとめ ==========");
  for (const [name, url] of Object.entries(results)) {
    console.log(`${name}: ${url}`);
  }

  await browser.close();
}

main().catch(console.error);
