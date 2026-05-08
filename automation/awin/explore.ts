/**
 * Awin Publisher Dashboard 探索 (login済前提)
 *
 * セッション保持されているはずなので OIDC redirect 完了後に
 * 各タブの URL を順に試して advertiser directory を発見
 *
 * Usage: npm run awin:explore
 */
import { launch } from "./_browser";
import type { Page } from "playwright";

const PUBLISHER_ID = "2887303";
const BASE = "https://ui.awin.com";

async function waitForApp(page: Page, label: string) {
  // OIDC redirect が落ち着くのを待つ
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(1000);
    const url = page.url();
    if (!url.includes("oidc") && !url.includes("login") && !url.includes("id.awin.com")) {
      // body に十分なコンテンツが乗ったか
      const len = await page.evaluate(() => document.body.innerText.length).catch(() => 0);
      if (len > 100) {
        console.log(`  [${label}] settled (${i + 1}s, body=${len}chars): ${url}`);
        return;
      }
    }
  }
  console.log(`  [${label}] timeout — current: ${page.url()}`);
}

async function dumpPage(page: Page, label: string) {
  await waitForApp(page, label);
  await page.screenshot({ path: `/tmp/awin-${label}.png`, fullPage: false });

  const summary = await page.evaluate(() => {
    const out: any = { headings: [], buttons: [], inputs: [], links: [], navText: "" };
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
      if (ph || name) out.inputs.push({ placeholder: ph, name });
    });
    document.querySelectorAll("a[href]").forEach((a) => {
      const text = (a.textContent || "").trim().slice(0, 50);
      const href = (a as HTMLAnchorElement).getAttribute("href") || "";
      if (text && href.startsWith("/") && href.length > 5) out.links.push({ text, href });
    });
    const nav = document.querySelector("nav, aside, [role='navigation']");
    if (nav) out.navText = (nav.textContent || "").trim().slice(0, 600);

    out.buttons = [...new Set(out.buttons)].slice(0, 20);
    out.headings = [...new Set(out.headings)].slice(0, 10);
    return out;
  });

  console.log(`\n--- [${label}] ${page.url()} ---`);
  console.log(JSON.stringify(summary, null, 2));
}

async function main() {
  const { context, page } = await launch({ headless: false });

  // ステップ1: ホーム
  console.log("→ Publisher Home");
  await page.goto(`${BASE}/dashboard/awin/publisher/${PUBLISHER_ID}`, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  await dumpPage(page, "home");

  // ステップ2: 候補パスを順に試す (Awin publisher 系の典型)
  const PATHS = [
    `/publisher/${PUBLISHER_ID}/programmes`,
    `/publisher/${PUBLISHER_ID}/programmes/joined`,
    `/publisher/${PUBLISHER_ID}/programmes/find`,
    `/publisher/${PUBLISHER_ID}/programmes/explore`,
    `/publisher/${PUBLISHER_ID}/advertisers`,
    `/publisher/${PUBLISHER_ID}/find-advertisers`,
    `/publisher/${PUBLISHER_ID}/join-programme`,
  ];

  for (const p of PATHS) {
    const url = `${BASE}/dashboard/awin${p}`;
    console.log(`\n→ ${url}`);
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
      await dumpPage(page, p.replace(/\W+/g, "_").slice(1, 50));
    } catch (e: any) {
      console.log(`  ERROR: ${e.message?.slice(0, 80)}`);
    }
  }

  console.log("\n10秒後にブラウザを閉じます。");
  await page.waitForTimeout(10000);
  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
