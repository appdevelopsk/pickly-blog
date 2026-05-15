/**
 * Reddit link poster — pins.yaml → subreddit link posts.
 *
 * カテゴリ別にサブレディットへリンク投稿。
 * ⚠️ 各サブレディットのルールを必ず確認すること（affiliate link ban のサブレディット多数）
 *
 * Setup:
 *   1. https://www.reddit.com/prefs/apps → Create App (script type)
 *   2. ~/.config/pickly/reddit.env に追記:
 *        REDDIT_CLIENT_ID=...
 *        REDDIT_CLIENT_SECRET=...
 *        REDDIT_USERNAME=...
 *        REDDIT_PASSWORD=...
 *
 * Rate limits: 60 req/min、1アカウント1サブレディット10分に1投稿
 *
 * Usage:
 *   npm run reddit:post
 *   npm run reddit:post -- --limit 5 --category fitness
 *   npm run reddit:post -- --dry-run
 *
 * State: ~/.config/pickly/reddit-posted.json
 */
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { fileURLToPath } from "node:url";
import * as yaml from "js-yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PINS_PATH = path.resolve(__dirname, "../../pinterest/pins.yaml");
const STATE_PATH = path.join(os.homedir(), ".config/pickly/reddit-posted.json");
const CREDS_FILE = path.join(os.homedir(), ".config/pickly/reddit.env");
const SLEEP_MS = 10_000; // 10s between posts
const SITE_URL = "https://pickly.blog";

// カテゴリ → サブレディット マッピング
// ⚠️ 投稿前に各サブレディットのルールを確認してください
// スパム扱いされるリスクがあるため、ルールで許可されているものだけに絞ること
const SUBREDDIT_MAP: Record<string, string[]> = {
  fitness:   ["r/homegym", "r/fitness", "r/weightlifting", "r/bodyweightfitness"],
  food:      ["r/EatCheapAndHealthy", "r/Cooking", "r/Coffee", "r/tea"],
  tech:      ["r/gadgets", "r/hardware", "r/homeautomation"],
  beauty:    ["r/SkincareAddiction", "r/AsianBeauty", "r/femalefashionadvice"],
  home:      ["r/HomeImprovement", "r/malelivingspace", "r/organization"],
  travel:    ["r/travel", "r/solotravel", "r/backpacking"],
  finance:   ["r/personalfinance", "r/financialindependence"],
  parenting: ["r/Parenting", "r/NewParents", "r/beyondthebump"],
  pets:      ["r/dogs", "r/cats", "r/pets"],
  fashion:   ["r/femalefashionadvice", "r/malefashionadvice", "r/streetwear"],
};

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
    clientId:     process.env.REDDIT_CLIENT_ID     ?? env.REDDIT_CLIENT_ID     ?? "",
    clientSecret: process.env.REDDIT_CLIENT_SECRET ?? env.REDDIT_CLIENT_SECRET ?? "",
    username:     process.env.REDDIT_USERNAME       ?? env.REDDIT_USERNAME       ?? "",
    password:     process.env.REDDIT_PASSWORD       ?? env.REDDIT_PASSWORD       ?? "",
  };
}

// ── Reddit OAuth2 (password flow) ────────────────────────────────────────────

async function getAccessToken(creds: ReturnType<typeof loadCreds>): Promise<string> {
  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "pickly-bot/1.0 by " + creds.username,
    },
    body: new URLSearchParams({
      grant_type: "password",
      username: creds.username,
      password: creds.password,
    }),
  });
  const data = await res.json() as Record<string, unknown>;
  if (!res.ok || data.error) throw new Error(`Reddit auth failed: ${JSON.stringify(data)}`);
  return data.access_token as string;
}

async function submitLink(
  token: string, username: string,
  subreddit: string, title: string, url: string
): Promise<string> {
  const sr = subreddit.replace(/^r\//, "");
  const res = await fetch("https://oauth.reddit.com/api/submit", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "pickly-bot/1.0 by " + username,
    },
    body: new URLSearchParams({
      kind: "link",
      sr,
      title: title.slice(0, 300),
      url,
      resubmit: "false",
      nsfw: "false",
      spoiler: "false",
    }),
  });
  const data = await res.json() as Record<string, unknown>;
  const json = (data.json ?? {}) as Record<string, unknown>;
  const errors = (json.errors as unknown[][]) ?? [];
  if (errors.length > 0) throw new Error(`Reddit submit error: ${JSON.stringify(errors)}`);
  const postId = ((json.data as Record<string, unknown>)?.id as string) ?? "";
  return postId;
}

// ── State ─────────────────────────────────────────────────────────────────────

interface PostedEntry { subreddit: string; reddit_id: string; posted_at: string }

function loadPosted(): Map<string, PostedEntry[]> {
  try {
    const d = JSON.parse(fs.readFileSync(STATE_PATH, "utf8"));
    return new Map(Object.entries(d.posted ?? {}));
  } catch { return new Map(); }
}

function markPosted(pinId: string, subreddit: string, redditId: string) {
  const posted = loadPosted();
  const entries = posted.get(pinId) ?? [];
  entries.push({ subreddit, reddit_id: redditId, posted_at: new Date().toISOString() });
  posted.set(pinId, entries);
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  const obj: Record<string, PostedEntry[]> = {};
  for (const [k, v] of posted) obj[k] = v;
  fs.writeFileSync(STATE_PATH, JSON.stringify({ posted: obj }, null, 2));
}

function alreadyPostedToSubreddit(pinId: string, subreddit: string): boolean {
  const entries = loadPosted().get(pinId) ?? [];
  return entries.some((e) => e.subreddit === subreddit);
}

// ── Main ─────────────────────────────────────────────────────────────────────

interface Pin {
  pin_id: string; article_slug?: string; locale: string; variant: string;
  title: string; description: string; link: string; hashtags?: string[];
  board?: string;
}

interface PinsYaml { pins: Pin[] }

// サイト記事のカテゴリを pin_id から推定
function guessCategory(pin: Pin): string {
  const slug = pin.article_slug ?? pin.pin_id;
  for (const cat of Object.keys(SUBREDDIT_MAP)) {
    if (slug.includes(cat)) return cat;
  }
  // fitness関連キーワード
  const fitnessKeys = ["gym", "workout", "protein", "dumbbell", "barbell", "kettlebell", "squat", "bench", "pull-up", "resistance", "yoga", "running", "cycling", "spin-bike", "treadmill", "rowing"];
  if (fitnessKeys.some((k) => slug.includes(k))) return "fitness";
  const foodKeys = ["coffee", "tea", "matcha", "espresso", "fryer", "blender", "kettle", "food", "meal", "recipe", "chocolate", "yogurt", "protein-bar", "pancake"];
  if (foodKeys.some((k) => slug.includes(k))) return "food";
  const techKeys = ["laptop", "monitor", "keyboard", "mouse", "headphone", "speaker", "camera", "webcam", "charger", "tablet", "smart-watch", "robot-vacuum", "projector"];
  if (techKeys.some((k) => slug.includes(k))) return "tech";
  return "";
}

async function main() {
  const args = process.argv.slice(2);
  const get = (f: string) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : undefined; };
  const limit = parseInt(get("--limit") ?? "5", 10);
  const categoryFilter = get("--category");
  const dryRun = args.includes("--dry-run");

  const creds = loadCreds();
  if (!dryRun && (!creds.clientId || !creds.username)) {
    console.error(`✗ 認証情報が見つかりません。${CREDS_FILE} を作成してください。`);
    console.error("  必要: REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD");
    process.exit(1);
  }

  const raw = fs.readFileSync(PINS_PATH, "utf8");
  const { pins: allPins } = yaml.load(raw) as PinsYaml;

  // en のみ (Reddit は英語が基本)
  let pins = allPins.filter((p) => p.locale === "en");
  if (categoryFilter) pins = pins.filter((p) => guessCategory(p) === categoryFilter);

  // 各ピンを対象サブレディットと組み合わせ、未投稿のみ残す
  const targets: Array<{ pin: Pin; subreddit: string }> = [];
  for (const pin of pins) {
    const cat = guessCategory(pin);
    if (!cat) continue;
    const subs = SUBREDDIT_MAP[cat] ?? [];
    for (const sub of subs.slice(0, 1)) { // 1サブレディット/pin に制限(スパム防止)
      if (!alreadyPostedToSubreddit(pin.pin_id, sub)) {
        targets.push({ pin, subreddit: sub });
        break;
      }
    }
    if (targets.length >= limit) break;
  }

  console.log(`→ Reddit 投稿対象: ${targets.length} 件`);

  if (dryRun) {
    for (const { pin, subreddit } of targets) {
      const articleUrl = pin.link.startsWith("http") ? pin.link : `${SITE_URL}${pin.link}`;
      console.log(`\n[${pin.pin_id}] → ${subreddit}\n  title: ${pin.title.slice(0, 80)}\n  url: ${articleUrl}`);
    }
    return;
  }

  const token = await getAccessToken(creds);
  console.log("✓ Reddit 認証成功");

  let ok = 0, fail = 0;

  for (const { pin, subreddit } of targets) {
    const articleUrl = pin.link.startsWith("http") ? pin.link : `${SITE_URL}${pin.link}`;
    try {
      const redditId = await submitLink(token, creds.username, subreddit, pin.title, articleUrl);
      markPosted(pin.pin_id, subreddit, redditId);
      console.log(`✓ ${pin.pin_id} → ${subreddit} (${redditId})`);
      ok++;
    } catch (err) {
      console.error(`✗ ${pin.pin_id} → ${subreddit}:`, (err as Error).message?.slice(0, 150));
      fail++;
    }

    if (targets.indexOf({ pin, subreddit }) < targets.length - 1) {
      console.log(`  ⏱ ${SLEEP_MS / 1000}s 待機...`);
      await new Promise((r) => setTimeout(r, SLEEP_MS));
    }
  }

  console.log(`\n完了: ✓${ok} ✗${fail}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
