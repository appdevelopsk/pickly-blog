/**
 * 各 ASP signup スクリプト共通の helper
 */
import type { Page } from "playwright";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

export async function safeFill(page: Page, sels: string[], val?: string): Promise<boolean> {
  if (!val) return false;
  for (const s of sels) {
    const loc = page.locator(s).first();
    try {
      if ((await loc.count()) > 0 && (await loc.isVisible({ timeout: 1500 }).catch(() => false))) {
        await loc.fill(val);
        return true;
      }
    } catch {}
  }
  return false;
}

export async function safeSelect(page: Page, sels: string[], val?: string): Promise<boolean> {
  if (!val) return false;
  for (const s of sels) {
    const loc = page.locator(s).first();
    try {
      if ((await loc.count()) > 0) {
        const ok = await loc.selectOption({ label: val }).then(() => true).catch(() => false);
        if (ok) return true;
        const ok2 = await loc.selectOption(val).then(() => true).catch(() => false);
        if (ok2) return true;
      }
    } catch {}
  }
  return false;
}

export async function safeClick(page: Page, sels: string[]): Promise<boolean> {
  for (const s of sels) {
    const loc = page.locator(s).first();
    try {
      if ((await loc.count()) > 0 && (await loc.isVisible({ timeout: 1500 }).catch(() => false))) {
        await loc.click();
        return true;
      }
    } catch {}
  }
  return false;
}

/**
 * "Sign in/up with Google" を click → 共有profileなので auto-redirect で完了するはず
 */
export async function clickGoogleAuth(page: Page, email: string): Promise<boolean> {
  const sels = [
    "button:has-text('Sign up with Google')",
    "button:has-text('Continue with Google')",
    "button:has-text('Sign in with Google')",
    "a:has-text('Sign up with Google')",
    "a:has-text('Continue with Google')",
    "a:has-text('Sign in with Google')",
    "[data-provider='google']",
    "[class*='google']",
  ];
  for (const s of sels) {
    const loc = page.locator(s).first();
    try {
      if ((await loc.count()) > 0 && (await loc.isVisible({ timeout: 1500 }).catch(() => false))) {
        await loc.click();
        await page.waitForTimeout(4000);

        // Google account chooser
        const acc = page.locator(`div[data-email='${email}'], div:has-text('${email}'), li:has-text('${email}')`).first();
        if ((await acc.count()) > 0) {
          await acc.click().catch(() => {});
          await page.waitForTimeout(3000);
        }
        return true;
      }
    } catch {}
  }
  return false;
}

/**
 * email link 認証ページ・dashboard・thanks ページに到達するまで polling
 */
export async function waitForCompletion(page: Page, timeoutSec: number = 600): Promise<boolean> {
  const completionPatterns = ["dashboard", "thank", "confirm", "success", "welcome", "/affiliate/home", "/publisher/home", "/account"];
  for (let i = 0; i < timeoutSec; i++) {
    await page.waitForTimeout(1000);
    let url = "";
    try {
      url = page.url();
    } catch {
      console.log("ブラウザが閉じられました");
      return false;
    }
    if (completionPatterns.some((p) => url.includes(p))) {
      console.log(`✓ 完了画面検出 (${i + 1}秒): ${url}`);
      return true;
    }
    if ((i + 1) % 60 === 0) {
      process.stdout.write(`  待機 ${i + 1}/${timeoutSec}秒 (${url.slice(0, 60)})\n`);
    }
  }
  return false;
}

export function loadEnvFile(filename: string): Record<string, string> {
  const file = path.join(os.homedir(), ".config/pickly/" + filename);
  if (!fs.existsSync(file)) return {};
  const content = fs.readFileSync(file, "utf8");
  const out: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const m = line.match(/^([A-Z_]+)=["']?([^"'\n]+)["']?/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}
