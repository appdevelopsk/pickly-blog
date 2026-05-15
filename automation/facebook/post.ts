/**
 * Facebook Page poster — pins.yaml → Page feed post with link preview.
 *
 * リンク投稿するとFacebookがOG画像を自動取得して表示する。
 * 画像アップロード不要で最も簡単なアプローチ。
 *
 * Setup:
 *   1. https://developers.facebook.com → アプリ作成
 *   2. Facebook Login → Pages API → pages_manage_posts 権限
 *   3. Page Access Token を取得（長期トークン推奨: 60日）
 *   4. ~/.config/pickly/facebook.env に追記:
 *        FACEBOOK_PAGE_ID=...
 *        FACEBOOK_PAGE_ACCESS_TOKEN=...
 *
 * Rate limits: 200 calls/hour/user, generous for Pages
 *
 * Usage:
 *   npm run facebook:post
 *   npm run facebook:post -- --limit 10 --locale ja
 *   npm run facebook:post -- --dry-run
 *
 * State: ~/.config/pickly/facebook-posted.json
 */
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { fileURLToPath } from "node:url";
import * as yaml from "js-yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PINS_PATH = path.resolve(__dirname, "../../pinterest/pins.yaml");
const STATE_PATH = path.join(os.homedir(), ".config/pickly/facebook-posted.json");
const CREDS_FILE = path.join(os.homedir(), ".config/pickly/facebook.env");
const SLEEP_MS = 5_000;
const SITE_URL = "https://pickly.blog";
const FB_API = "https://graph.facebook.com/v19.0";

// ── Credentials ──────────────────────────────────────────────────────────────

function loadCreds() {
  const env: Record<string, string> = {};
  if (fs.existsSync(CREDS_FILE)) {
    for (const line of fs.readFileSync(CREDS_FILE, "utf8").split("\n")) {
      const m = line.match(/^(?:export\s+)?(\w+)=["']?([^"'\n]+)["']?/);
      if (m) env[m[1]] = m[2];
    }
  }
  return {
    pageId:    process.env.FACEBOOK_PAGE_ID           ?? env.FACEBOOK_PAGE_ID           ?? "",
    pageToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN ?? env.FACEBOOK_PAGE_ACCESS_TOKEN ?? "",
  };
}

// ── State ─────────────────────────────────────────────────────────────────────

function loadPosted(): Set<string> {
  try { return new Set((JSON.parse(fs.readFileSync(STATE_PATH, "utf8")).posted ?? [])); }
  catch { return new Set(); }
}

function markPosted(id: string) {
  const posted = loadPosted();
  posted.add(id);
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify({ posted: [...posted] }, null, 2));
}

// ── Post ─────────────────────────────────────────────────────────────────────

async function postToPage(
  pageId: string, token: string,
  message: string, link: string
): Promise<string> {
  const url = `${FB_API}/${pageId}/feed`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, link, access_token: token }),
  });
  const data = await res.json() as Record<string, unknown>;
  if (!res.ok) throw new Error(JSON.stringify(data).slice(0, 200));
  return (data.id as string) ?? "";
}

// ── Main ─────────────────────────────────────────────────────────────────────

interface Pin {
  pin_id: string; article_slug?: string; locale: string; variant: string;
  title: string; description: string; link: string; hashtags?: string[];
}

// ロケール別投稿言語制御 — 全ロケール投稿が基本
const LOCALE_ORDER = ["en", "ja", "de", "fr", "es", "pt-BR", "it", "ko", "zh-CN"];

async function main() {
  const args = process.argv.slice(2);
  const get = (f: string) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : undefined; };
  const limit = parseInt(get("--limit") ?? "10", 10);
  const localeFilter = get("--locale");
  const dryRun = args.includes("--dry-run");

  const creds = loadCreds();
  if (!dryRun && (!creds.pageId || !creds.pageToken)) {
    console.error(`✗ 認証情報が見つかりません。${CREDS_FILE} を作成してください。`);
    console.error("  必要: FACEBOOK_PAGE_ID, FACEBOOK_PAGE_ACCESS_TOKEN");
    process.exit(1);
  }

  const raw = fs.readFileSync(PINS_PATH, "utf8");
  const { pins: allPins } = yaml.load(raw) as { pins: Pin[] };
  const posted = loadPosted();

  // ロケール順に並べて投稿 (多言語 Page の場合、混ぜて投稿するのが自然)
  let pins = allPins.filter((p) => !posted.has(p.pin_id));
  if (localeFilter) pins = pins.filter((p) => p.locale === localeFilter);
  else {
    // ロケール順にソートして均等に混ぜる
    pins = pins.sort((a, b) => {
      const ai = LOCALE_ORDER.indexOf(a.locale);
      const bi = LOCALE_ORDER.indexOf(b.locale);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
  }
  const targets = pins.slice(0, limit);
  console.log(`→ Facebook 投稿対象: ${targets.length} 件 (残り${pins.length}件)`);

  let ok = 0, fail = 0;

  for (const pin of targets) {
    const slug = pin.article_slug ?? ((pin.link ?? "").match(/\/([^/]+)\/?$/) ?? [])[1] ?? pin.pin_id;
    const articleUrl = pin.link.startsWith("http") ? pin.link : `${SITE_URL}${pin.link}`;
    const tags = (pin.hashtags ?? []).slice(0, 8).join(" ");
    const message = `${pin.title}\n\n${pin.description.slice(0, 400)}\n\n${tags}`.trim();

    if (dryRun) {
      console.log(`\n[${pin.pin_id}]\n${message.slice(0, 100)}...\nlink: ${articleUrl}`);
      continue;
    }

    try {
      const postId = await postToPage(creds.pageId, creds.pageToken, message, articleUrl);
      markPosted(pin.pin_id);
      console.log(`✓ ${pin.pin_id} → ${postId}`);
      ok++;
    } catch (err) {
      console.error(`✗ ${pin.pin_id}:`, (err as Error).message?.slice(0, 150));
      fail++;
    }

    if (targets.indexOf(pin) < targets.length - 1) {
      await new Promise((r) => setTimeout(r, SLEEP_MS));
    }
  }

  console.log(`\n完了: ✓${ok} ✗${fail} | 累計: ${loadPosted().size}件`);
}

main().catch((e) => { console.error(e); process.exit(1); });
