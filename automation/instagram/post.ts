/**
 * Instagram Business poster — pins.yaml → Instagram photo post via Graph API.
 *
 * Facebookページに紐づいたInstagramビジネスアカウントが必要。
 * OG画像を投稿し、キャプションにタイトル+ハッシュタグを付与。
 * リンクはキャプションに記載するが、クリック不可（プロフィールのリンクは別途設定）。
 *
 * Setup:
 *   1. Facebookページ → 設定 → Instagramアカウントを連携
 *   2. https://developers.facebook.com → アプリ → Instagram Graph API
 *   3. instagram_basic, instagram_content_publish 権限
 *   4. ~/.config/pickly/instagram.env に追記:
 *        INSTAGRAM_BUSINESS_ACCOUNT_ID=...   # IG Business Account ID (数字)
 *        INSTAGRAM_ACCESS_TOKEN=...           # Facebook User/Page long-lived token
 *
 * Rate limits: 25投稿/日、50コンテナ/日
 *
 * Usage:
 *   npm run instagram:post
 *   npm run instagram:post -- --limit 5 --locale en
 *   npm run instagram:post -- --dry-run
 *
 * State: ~/.config/pickly/instagram-posted.json
 */
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { fileURLToPath } from "node:url";
import * as yaml from "js-yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PINS_PATH = path.resolve(__dirname, "../../pinterest/pins.yaml");
const STATE_PATH = path.join(os.homedir(), ".config/pickly/instagram-posted.json");
const CREDS_FILE = path.join(os.homedir(), ".config/pickly/instagram.env");
const SLEEP_MS = 30_000; // IG rate limits are strict
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
    igAccountId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID ?? env.INSTAGRAM_BUSINESS_ACCOUNT_ID ?? "",
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN         ?? env.INSTAGRAM_ACCESS_TOKEN         ?? "",
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

// ── Instagram Graph API ──────────────────────────────────────────────────────

async function createMediaContainer(
  igAccountId: string, token: string,
  imageUrl: string, caption: string
): Promise<string> {
  const url = `${FB_API}/${igAccountId}/media`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_url: imageUrl, caption, access_token: token }),
  });
  const data = await res.json() as Record<string, unknown>;
  if (!res.ok) throw new Error(`container: ${JSON.stringify(data).slice(0, 200)}`);
  return data.id as string;
}

async function publishMedia(
  igAccountId: string, token: string, creationId: string
): Promise<string> {
  const url = `${FB_API}/${igAccountId}/media_publish`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creation_id: creationId, access_token: token }),
  });
  const data = await res.json() as Record<string, unknown>;
  if (!res.ok) throw new Error(`publish: ${JSON.stringify(data).slice(0, 200)}`);
  return data.id as string;
}

// ── Caption composer ─────────────────────────────────────────────────────────

function composeCaption(pin: { title: string; description: string; link: string; hashtags?: string[] }): string {
  const tags = (pin.hashtags ?? []).slice(0, 10).join(" ");
  // IGキャプションは2200字まで、リンクはクリック不可
  const desc = pin.description.slice(0, 1500);
  return `${pin.title}\n\n${desc}\n\n🔗 ${pin.link}\n\n${tags}`.trim();
}

// ── Main ─────────────────────────────────────────────────────────────────────

interface Pin {
  pin_id: string; article_slug?: string; locale: string; variant: string;
  title: string; description: string; link: string; hashtags?: string[];
}

async function main() {
  const args = process.argv.slice(2);
  const get = (f: string) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : undefined; };
  const limit = parseInt(get("--limit") ?? "5", 10);
  const localeFilter = get("--locale") ?? "en";
  const dryRun = args.includes("--dry-run");

  const creds = loadCreds();
  if (!dryRun && (!creds.igAccountId || !creds.accessToken)) {
    console.error(`✗ 認証情報が見つかりません。${CREDS_FILE} を作成してください。`);
    console.error("  必要: INSTAGRAM_BUSINESS_ACCOUNT_ID, INSTAGRAM_ACCESS_TOKEN");
    process.exit(1);
  }

  const raw = fs.readFileSync(PINS_PATH, "utf8");
  const { pins: allPins } = yaml.load(raw) as { pins: Pin[] };
  const posted = loadPosted();

  let pins = allPins.filter((p) => !posted.has(p.pin_id));
  if (localeFilter) pins = pins.filter((p) => p.locale === localeFilter);
  const targets = pins.slice(0, limit);
  console.log(`→ Instagram 投稿対象: ${targets.length} 件 (locale=${localeFilter}, 残り${pins.length}件)`);

  let ok = 0, fail = 0;

  for (const pin of targets) {
    const slug = pin.article_slug ?? ((pin.link ?? "").match(/\/([^/]+)\/?$/) ?? [])[1] ?? pin.pin_id;
    const imageUrl = `${SITE_URL}/og/${slug}-${pin.locale}.png`;
    const articleUrl = pin.link.startsWith("http") ? pin.link : `${SITE_URL}${pin.link}`;
    const caption = composeCaption({ ...pin, link: articleUrl });

    if (dryRun) {
      console.log(`\n[${pin.pin_id}]\nimage: ${imageUrl}\n${caption.slice(0, 150)}...`);
      continue;
    }

    try {
      // Step 1: メディアコンテナ作成
      const containerId = await createMediaContainer(creds.igAccountId, creds.accessToken, imageUrl, caption);
      console.log(`  container: ${containerId}`);

      // Step 2: 公開
      const mediaId = await publishMedia(creds.igAccountId, creds.accessToken, containerId);
      markPosted(pin.pin_id);
      console.log(`✓ ${pin.pin_id} → ${mediaId}`);
      ok++;
    } catch (err) {
      console.error(`✗ ${pin.pin_id}:`, (err as Error).message?.slice(0, 150));
      fail++;
    }

    if (targets.indexOf(pin) < targets.length - 1) {
      console.log(`  ⏱ ${SLEEP_MS / 1000}s 待機...`);
      await new Promise((r) => setTimeout(r, SLEEP_MS));
    }
  }

  console.log(`\n完了: ✓${ok} ✗${fail} | 累計: ${loadPosted().size}件`);
}

main().catch((e) => { console.error(e); process.exit(1); });
