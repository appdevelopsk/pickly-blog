/**
 * Bulk Pinterest pin poster — reads pins.yaml and posts via Pinterest API v5.
 *
 * Pre-requisites:
 *   - Pinterest Standard access granted (Trial では拒否される)
 *   - PINTEREST_ACCESS_TOKEN set in env (~/.config/pickly/pinterest.env)
 *   - PINTEREST_DEFAULT_BOARD_ID set
 *   - NEXT_PUBLIC_SITE_URL set (https://pickly.blog)
 *
 * Usage:
 *   npm run pinterest:post-yaml                     # post next batch (default 5)
 *   npm run pinterest:post-yaml -- --limit 10       # custom batch size
 *   npm run pinterest:post-yaml -- --slug best-vpn-2026  # filter by article
 *   npm run pinterest:post-yaml -- --locale ja      # filter by locale
 *   npm run pinterest:post-yaml -- --variant top1   # filter by variant
 *   npm run pinterest:post-yaml -- --dry-run        # show what would post
 *   npm run pinterest:post-yaml -- --reset          # clear posted log
 *
 * State management:
 *   - Posted pins logged to ~/.config/pickly/pinterest-posted.json
 *   - Re-running skips pins already in log
 *
 * Rate limit:
 *   - 30s sleep between pins (Pinterest sensitive to burst)
 *   - Max 100 pins/day per Pinterest API guidelines
 */
import * as fs from "node:fs/promises";
import * as fsSync from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { fileURLToPath } from "node:url";
import * as yaml from "js-yaml";
import { PinterestClient } from "./client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PINS_PATH = path.resolve(__dirname, "pins.yaml");
const STATE_PATH = path.join(os.homedir(), ".config/pickly/pinterest-posted.json");
const SLEEP_MS = 30_000;

interface Pin {
  pin_id: string;
  article_slug?: string;
  locale: string;
  variant: string;
  title: string;
  description: string;
  link: string;
  image_alt?: string;
  hashtags?: string[];
  board?: string;
}

interface PinsYaml {
  site_url?: string;
  board_id?: string;
  account?: string;
  pins: Pin[];
}

interface State {
  posted: Record<string, { pinterest_id: string; posted_at: string }>;
}

const LOCALE_RE = /\/(en|ja|zh-CN|zh-TW|ko|es|pt-BR|fr|de|it|ru|ar|hi|id|th|vi|tr)\//;

function resolveLink(link: string, siteUrl: string): string {
  const abs = link.startsWith("http") ? link : `${siteUrl}${link}`;
  // /locale/slug → /locale/articles/slug/ に正規化
  if (!abs.includes("/articles/")) {
    return abs.replace(LOCALE_RE, (m, loc) => `/${loc}/articles/`).replace(/\/?$/, "/");
  }
  return abs;
}

function loadState(): State {
  if (!fsSync.existsSync(STATE_PATH)) return { posted: {} };
  try {
    return JSON.parse(fsSync.readFileSync(STATE_PATH, "utf8"));
  } catch {
    return { posted: {} };
  }
}

async function saveState(s: State) {
  await fs.mkdir(path.dirname(STATE_PATH), { recursive: true });
  await fs.writeFile(STATE_PATH, JSON.stringify(s, null, 2));
}

async function main() {
  const args = process.argv.slice(2);
  const get = (flag: string) => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const limit = parseInt(get("--limit") ?? "5", 10);
  const slugFilter = get("--slug");
  const localeFilter = get("--locale");
  const variantFilter = get("--variant");
  const dryRun = args.includes("--dry-run");
  const reset = args.includes("--reset");

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";
  const BOARD_ID = process.env.PINTEREST_DEFAULT_BOARD_ID;
  if (!BOARD_ID && !dryRun) {
    console.error("✗ PINTEREST_DEFAULT_BOARD_ID 未設定");
    process.exit(1);
  }

  if (reset) {
    await saveState({ posted: {} });
    console.log("✓ posted log cleared");
    return;
  }

  const raw = await fs.readFile(PINS_PATH, "utf8");
  const data = yaml.load(raw) as PinsYaml;
  const allPins = data.pins ?? [];
  console.log(`→ pins.yaml に ${allPins.length} pin`);

  // フィルタ (article_slugがない場合はlinkから抽出)
  const resolveSlug = (p: Pin) =>
    p.article_slug ?? ((p.link ?? "").match(/\/([^/]+)\/?$/) ?? [])[1] ?? "";
  let pins = allPins;
  if (slugFilter) pins = pins.filter((p) => resolveSlug(p) === slugFilter);
  if (localeFilter) pins = pins.filter((p) => p.locale === localeFilter);
  if (variantFilter) pins = pins.filter((p) => p.variant === variantFilter);

  // 既投稿除外
  const state = loadState();
  pins = pins.filter((p) => !state.posted[p.pin_id]);

  console.log(
    `→ filter後 ${pins.length} 件 (slug=${slugFilter ?? "*"}, locale=${localeFilter ?? "*"}, variant=${variantFilter ?? "*"})`,
  );

  // 上から limit 件
  const targets = pins.slice(0, limit);
  console.log(`→ 投稿候補 ${targets.length} 件 (limit=${limit})`);

  if (dryRun) {
    console.log("\n=== DRY RUN ===\n");
    for (const p of targets) {
      const slug = p.article_slug ?? ((p.link ?? "").match(/\/([^/]+)\/?$/) ?? [])[1] ?? p.pin_id;
      const link = resolveLink(p.link ?? "", SITE_URL);
      console.log(`[${p.pin_id}]`);
      console.log(`  title: ${p.title}`);
      console.log(`  link: ${link}`);
      console.log(`  image: ${SITE_URL}/og/${slug}-${p.locale}.png`);
      console.log(`  desc: ${p.description.slice(0, 100)}...`);
      console.log("");
    }
    return;
  }

  const client = new PinterestClient();
  let posted = 0;
  let failed = 0;

  for (const p of targets) {
    // article_slugがない場合はlinkから抽出
    const slug = p.article_slug ?? ((p.link ?? "").match(/\/([^/]+)\/?$/) ?? [])[1] ?? p.pin_id;
    const absoluteLink = resolveLink(p.link ?? "", SITE_URL);
    const imageUrl = `${SITE_URL}/og/${slug}-${p.locale}.png`;
    try {
      const r = await client.createPin({
        boardId: BOARD_ID!,
        title: p.title,
        description: p.description,
        link: absoluteLink,
        imageUrl,
        altText: p.image_alt,
      });
      console.log(`✓ ${p.pin_id} → ${r.id}`);
      state.posted[p.pin_id] = {
        pinterest_id: r.id,
        posted_at: new Date().toISOString(),
      };
      await saveState(state);
      posted++;
      if (posted < targets.length) {
        console.log(`  ⏱ ${SLEEP_MS / 1000}s sleep...`);
        await new Promise((res) => setTimeout(res, SLEEP_MS));
      }
    } catch (err) {
      const msg = (err as Error).message?.slice(0, 200);
      console.error(`✗ ${p.pin_id}: ${msg}`);
      failed++;
    }
  }

  console.log(`\n=== 完了 ===`);
  console.log(`  ✓ 投稿成功: ${posted}`);
  console.log(`  ✗ 失敗: ${failed}`);
  console.log(`  📋 累計投稿数: ${Object.keys(state.posted).length} / ${allPins.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
