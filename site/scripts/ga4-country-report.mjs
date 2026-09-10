// GA4 国別レポートを「人間」と「ボット疑い」に分けて出す (2026-09-09)。
//
// なぜ: GA4 の標準の国別レポートは 2026-08-12..09-08 で 2,398 ユーザー中およそ 1,000 が
// Direct 流入 × 中国語ブラウザ × 滞在 0 秒のスキャナだった(US 646 / China 231 / Iran 78 /
// Vietnam 59 / Russia 38)。素の表を見ると「US が 44%」「中国・イランで滞在 0 秒」と読めて
// しまい、サイトの不具合を疑う誤診断になる。ここでは国ごとに Direct を除いた人間の数と
// ボット疑い層を並べて出す。判定規則は下の isBotSuspect に明示する。
//
// 使い方:
//   GA4_PROPERTY_ID=537610479 GA_SERVICE_ACCOUNT_JSON=<path or json> node scripts/ga4-country-report.mjs [days=28]
//   (SA は GA4 プロパティの閲覧者であること。既定の鍵パスは pickly/.secrets/ga4-service-account.json)
//   REPORT_OUT=<path>   … Markdown も書き出す(週次 Actions が GA4_COUNTRIES.md に使う)
//   BOT_ALERT_PCT=20    … ボット疑い率がこれを超えたら GITHUB_OUTPUT に bot_alert=true を書く
//                        (ジョブ自体はここでは落とさない。落とすのは workflow 側の最後の step)
import { createSign } from "node:crypto";
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PROP = process.env.GA4_PROPERTY_ID ?? "537610479";
const DAYS = Number(process.argv[2] ?? 28);
const here = dirname(fileURLToPath(import.meta.url));
const DEFAULT_KEY = resolve(here, "../../.secrets/ga4-service-account.json");

function loadKey() {
  const raw = process.env.GA_SERVICE_ACCOUNT_JSON ?? "";
  if (raw.trim().startsWith("{")) return JSON.parse(raw);
  const p = raw || DEFAULT_KEY;
  if (!existsSync(p)) throw new Error(`service account key not found: ${p}`);
  return JSON.parse(readFileSync(p, "utf8"));
}
const b64 = (o) => Buffer.from(typeof o === "string" ? o : JSON.stringify(o)).toString("base64url");
async function token(key) {
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({ iss: key.client_email, scope: "https://www.googleapis.com/auth/analytics.readonly", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 })}`;
  const sig = createSign("RSA-SHA256").update(unsigned).sign(key.private_key, "base64url");
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${unsigned}.${sig}` });
  const j = await r.json();
  if (!j.access_token) throw new Error("token: " + JSON.stringify(j));
  return j.access_token;
}
async function report(tok, body) {
  const r = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROP}:runReport`, { method: "POST", headers: { authorization: `Bearer ${tok}`, "content-type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json();
  if (j.error) throw new Error(j.error.message);
  return (j.rows ?? []).map((row) => ({ d: row.dimensionValues.map((v) => v.value), m: row.metricValues.map((v) => Number(v.value)) }));
}

// ボット疑い: Direct 流入で、1人あたり平均滞在が 3 秒未満(10 人以上の塊のみ)。
// エンゲージ率は使わない: スキャナは 2 ページ踏むだけで「エンゲージ済みセッション」に
// 数えられる(US×中国語 646 users がエンゲージ 16% なのに滞在 0 秒だった)。
// 人間の Direct は数十秒は滞在する。閾値は 8/12–9/8 の実測から。
const isBotSuspect = (users, _engaged, durSec) => users >= 10 && durSec / users < 3;

const key = loadKey();
const tok = await token(key);
const end = new Date(Date.now() - 86400e3).toISOString().slice(0, 10);
const start = new Date(Date.now() - DAYS * 86400e3).toISOString().slice(0, 10);
const dateRanges = [{ startDate: start, endDate: end }];
const metrics = [{ name: "activeUsers" }, { name: "engagedSessions" }, { name: "userEngagementDuration" }, { name: "keyEvents" }];

const rows = await report(tok, { dateRanges, dimensions: [{ name: "country" }, { name: "sessionDefaultChannelGroup" }, { name: "language" }], metrics, limit: 2000 });
const byCountry = new Map();
const bots = [];
for (const { d: [country, channel, language], m: [users, engaged, dur, key] } of rows) {
  const c = byCountry.get(country) ?? { users: 0, human: 0, engaged: 0, dur: 0, key: 0 };
  c.users += users;
  const bot = channel === "Direct" && isBotSuspect(users, engaged, dur);
  if (bot) bots.push({ country, language, users, engaged, dur });
  else { c.human += users; c.engaged += engaged; c.dur += dur; c.key += key; }
  byCountry.set(country, c);
}
const fmt = (n, w = 6) => String(n).padStart(w);
console.log(`GA4 property ${PROP}  ${start}..${end}\n`);
console.log("== 国別 (human = ボット疑い層を除いた数) ==");
console.log(`${"country".padEnd(22)}${fmt("all")}${fmt("human")}${fmt("eng")}${fmt("sec/u", 7)}${fmt("key")}`);
const sorted = [...byCountry].sort((a, b) => b[1].human - a[1].human).slice(0, 30);
for (const [country, c] of sorted) console.log(`${country.padEnd(22)}${fmt(c.users)}${fmt(c.human)}${fmt(c.engaged)}${fmt(c.human ? Math.round(c.dur / c.human) : 0, 7)}${fmt(c.key)}`);
const totalAll = [...byCountry.values()].reduce((s, c) => s + c.users, 0);
const totalBot = bots.reduce((s, b) => s + b.users, 0);
console.log(`\n== ボット疑い層 (Direct × 滞在<3秒/人 × 10人以上) : ${totalBot} / ${totalAll} users = ${((100 * totalBot) / (totalAll || 1)).toFixed(1)}% ==`);
for (const b of bots.sort((a, b) => b.users - a.users).slice(0, 15)) console.log(`${b.country.padEnd(22)}${b.language.padEnd(12)}${fmt(b.users)} users  eng=${b.engaged}  ${(b.dur / b.users).toFixed(1)}s/u`);
console.log("\n判定の読み方: docs/COUNTRY_ACCESS.md");

const botPct = (100 * totalBot) / (totalAll || 1);
const ALERT = Number(process.env.BOT_ALERT_PCT ?? 20);
const alert = botPct > ALERT;
if (process.env.REPORT_OUT) {
  const md = [
    `# GA4 国別レポート (ボット分離済み)`,
    ``,
    `property ${PROP} / ${start}..${end} / 生成 ${new Date().toISOString().slice(0, 10)}`,
    ``,
    alert ? `> ⚠ **ボット疑い率 ${botPct.toFixed(1)}% が閾値 ${ALERT}% を超過。** 標準の国別レポートは信用せず、この表の human 列で判断する。gtag の webdriver ゲートで足りていない → Cloudflare Bot Fight Mode を検討(承認制)。` : `ボット疑い率 ${botPct.toFixed(1)}% (閾値 ${ALERT}%)。`,
    ``,
    `読み方: docs/COUNTRY_ACCESS.md。human = Direct×滞在<3秒/人×10人以上 の塊を除いた数。`,
    ``,
    `| country | all | human | engaged | sec/user | key events |`,
    `|---|---:|---:|---:|---:|---:|`,
    ...sorted.map(([country, c]) => `| ${country} | ${c.users} | ${c.human} | ${c.engaged} | ${c.human ? Math.round(c.dur / c.human) : 0} | ${c.key} |`),
    ``,
    `## ボット疑い層 ${totalBot} / ${totalAll} users (${botPct.toFixed(1)}%)`,
    ``,
    `| country | language | users | engaged | sec/user |`,
    `|---|---|---:|---:|---:|`,
    ...bots.slice(0, 15).map((b) => `| ${b.country} | ${b.language} | ${b.users} | ${b.engaged} | ${(b.dur / b.users).toFixed(1)} |`),
    ``,
  ].join("\n");
  writeFileSync(process.env.REPORT_OUT, md);
  console.log(`wrote ${process.env.REPORT_OUT}`);
}
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `bot_alert=${alert}\nbot_pct=${botPct.toFixed(1)}\n`);
if (alert) console.log(`⚠ bot share ${botPct.toFixed(1)}% > ${ALERT}%`);
