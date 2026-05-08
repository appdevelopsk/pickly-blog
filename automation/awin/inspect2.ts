/**
 * Awin の正しい advertiser/programme ページを発見
 *
 * 既ログイン状態前提で /awin/affiliate/2887303/ 配下を探索
 * Usage: npm run awin:inspect2
 */
import { launch } from "./_browser";

const AFFILIATE_ID = "2887303";

const TRY_PATHS = [
  `/awin/affiliate/${AFFILIATE_ID}`,
  `/awin/affiliate/${AFFILIATE_ID}/dashboard`,
  `/awin/affiliate/${AFFILIATE_ID}/advertisers`,
  `/awin/affiliate/${AFFILIATE_ID}/programmes`,
  `/awin/affiliate/${AFFILIATE_ID}/programs`,
  `/awin/affiliate/${AFFILIATE_ID}/join`,
  `/awin/affiliate/${AFFILIATE_ID}/join-programmes`,
  `/awin/affiliate/${AFFILIATE_ID}/find-advertisers`,
];

async function main() {
  const { context, page } = await launch({ headless: false });

  // まずユーザーダッシュボードに行ってナビゲーション構造を取る
  console.log("→ ユーザーダッシュボード");
  await page.goto("https://ui.awin.com/awin/affiliate/" + AFFILIATE_ID, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  await page.waitForTimeout(5000);

  console.log(`現在URL: ${page.url()}`);
  await page.screenshot({ path: "/tmp/awin-aff-home.png" });

  const navLinks = await page.evaluate(() => {
    const out: Array<{ text: string; href: string }> = [];
    document.querySelectorAll("a[href]").forEach((a) => {
      const text = (a.textContent || "").trim().slice(0, 50);
      const href = (a as HTMLAnchorElement).getAttribute("href") || "";
      if (text && href && (href.includes("affiliate") || href.includes("advertis") || href.includes("program") || href.includes("merchant") || href.includes("join"))) {
        out.push({ text, href });
      }
    });
    return out;
  });

  console.log("\n=== Affiliate関連ナビ ===");
  console.log(JSON.stringify(navLinks, null, 2));

  // 候補パスを順に試す
  console.log("\n=== 候補パスを順に試行 ===");
  const results: Array<{ path: string; url: string; title: string; hasJoinButton: boolean }> = [];
  for (const p of TRY_PATHS) {
    try {
      await page.goto("https://ui.awin.com" + p, {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });
      await page.waitForTimeout(2500);
      const url = page.url();
      const title = await page.title();
      const hasJoinButton = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("button, a")).some((el) => {
          const t = (el.textContent || "").toLowerCase();
          return t.includes("join program") || t.includes("apply") || t.includes("join now");
        });
      });
      console.log(`  ${p} → ${url} | "${title}" | join btn: ${hasJoinButton}`);
      results.push({ path: p, url, title, hasJoinButton });
    } catch (e: any) {
      console.log(`  ${p} → ERROR: ${e.message?.slice(0, 60)}`);
    }
  }

  // Join ボタンが見つかったページに戻ってスクリーンショット
  const winner = results.find((r) => r.hasJoinButton) || results.find((r) => !r.url.includes("error"));
  if (winner) {
    console.log(`\n→ 有効ページ: ${winner.path}`);
    await page.goto("https://ui.awin.com" + winner.path, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(4000);
    await page.screenshot({ path: "/tmp/awin-target.png", fullPage: true });
    console.log(`✓ /tmp/awin-target.png`);

    // 主要要素
    const summary = await page.evaluate(() => {
      const out: any = { headings: [], buttons: [], inputs: [], links: [] };
      document.querySelectorAll("h1, h2, h3").forEach((h) => {
        const t = (h.textContent || "").trim().slice(0, 80);
        if (t) out.headings.push(`${h.tagName}: ${t}`);
      });
      document.querySelectorAll("button").forEach((b) => {
        const t = (b.textContent || "").trim().slice(0, 60);
        if (t) out.buttons.push(t);
      });
      document.querySelectorAll("input").forEach((i) => {
        const ph = i.getAttribute("placeholder") || "";
        const name = i.getAttribute("name") || "";
        if (ph || name) out.inputs.push({ placeholder: ph, name, type: i.type });
      });
      document.querySelectorAll("nav a, [role='navigation'] a, aside a").forEach((a) => {
        const t = (a.textContent || "").trim().slice(0, 50);
        const href = (a as HTMLAnchorElement).getAttribute("href") || "";
        if (t && href) out.links.push({ text: t, href });
      });
      out.buttons = [...new Set(out.buttons)];
      return out;
    });
    console.log("\n=== Page summary ===");
    console.log(JSON.stringify(summary, null, 2));
  }

  console.log("\n8秒後にブラウザを閉じます。");
  await page.waitForTimeout(8000);
  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
