/**
 * Syndicate articles to free, API-friendly social channels (Mastodon, Telegram).
 * Drips a few of the oldest not-yet-posted articles per run so the whole catalog
 * gets distributed over time without spamming. Idempotent via a committed log.
 *
 * Gated: a channel is used only if its secrets are set, so this is a no-op until
 * configured.
 *   Mastodon: MASTODON_INSTANCE (e.g. https://mastodon.social), MASTODON_TOKEN
 *   Telegram: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID (e.g. @pickly_channel)
 *   LIMIT (default 4), SOCIAL_STATE_PATH (default scripts/.social-posted.json)
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { listArticles } from "../src/lib/articles/registry";
import { loadArticleCardMeta } from "../src/lib/i18n/loader";
import { ogImageUrl } from "../src/lib/og";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";
const LIMIT = parseInt(process.env.LIMIT ?? "4", 10);
const STATE_PATH = process.env.SOCIAL_STATE_PATH
  ? path.resolve(process.env.SOCIAL_STATE_PATH)
  : path.resolve(__dirname, ".social-posted.json");

const MASTO_INSTANCE = (process.env.MASTODON_INSTANCE ?? "").replace(/\/$/, "");
const MASTO_TOKEN = process.env.MASTODON_TOKEN ?? "";
const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const TG_CHAT = process.env.TELEGRAM_CHAT_ID ?? "";

interface State { posted: Record<string, string> }
function load(): State {
  try { return JSON.parse(fs.readFileSync(STATE_PATH, "utf8")); } catch { return { posted: {} }; }
}
function save(s: State) { fs.writeFileSync(STATE_PATH, JSON.stringify(s, null, 2)); }

async function postMastodon(text: string): Promise<boolean> {
  const res = await fetch(`${MASTO_INSTANCE}/api/v1/statuses`, {
    method: "POST",
    headers: { Authorization: `Bearer ${MASTO_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ status: text, visibility: "public", language: "en" }),
  });
  if (!res.ok) { console.error("  mastodon", res.status, (await res.text()).slice(0, 120)); return false; }
  return true;
}
async function postTelegram(text: string, photo: string): Promise<boolean> {
  const res = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendPhoto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: TG_CHAT, photo, caption: text, parse_mode: "HTML" }),
  });
  if (!res.ok) { console.error("  telegram", res.status, (await res.text()).slice(0, 120)); return false; }
  return true;
}

async function main() {
  const masto = !!(MASTO_INSTANCE && MASTO_TOKEN);
  const tg = !!(TG_TOKEN && TG_CHAT);
  if (!masto && !tg) { console.log("No social channel configured (Mastodon/Telegram secrets unset) — skipping."); return; }

  const state = load();
  const queue = [...listArticles()]
    .sort((a, b) => (a.publishedAt < b.publishedAt ? -1 : 1)) // oldest first (steady backfill)
    .filter((a) => !state.posted[a.slug])
    .slice(0, LIMIT);

  console.log(`channels: ${[masto && "mastodon", tg && "telegram"].filter(Boolean).join(",")} | queue: ${queue.length}`);
  let done = 0;
  for (const a of queue) {
    const { title, description } = loadArticleCardMeta(a.slug, "en");
    const url = `${SITE_URL}/en/articles/${a.slug}/`;
    const img = ogImageUrl(a.slug, "en");
    const text = `${title}\n\n${(description || "").slice(0, 200)}\n${url}`;
    let ok = true;
    if (masto) ok = (await postMastodon(text)) && ok;
    if (tg) ok = (await postTelegram(`<b>${title}</b>\n${url}`, img)) && ok;
    if (ok) { state.posted[a.slug] = new Date().toISOString(); save(state); done++; console.log(`✓ ${a.slug}`); }
    await new Promise((r) => setTimeout(r, 3000));
  }
  console.log(`posted ${done}/${queue.length}; total ${Object.keys(state.posted).length}/${listArticles().length}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
