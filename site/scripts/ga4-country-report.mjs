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

// ボット疑い: Direct 流入で、1人あたり平均滞在が 8 秒未満(10 人以上の塊のみ)。
// エンゲージ率は使わない: スキャナは 2 ページ踏むだけで「エンゲージ済みセッション」に
// 数えられる(US×中国語 646 users がエンゲージ 16% なのに滞在 0 秒だった)。
//
// ★2026-09-14 閾値を 3 秒 → 8 秒に引き上げた。実測(2026-08-17..09-13, Direct 1,924 users,
//   国×言語×端末で集計)で、しきい値を動かしたときに落ちる人数と、そこに巻き込まれる
//   keyEvents は次のとおり:
//     <3秒: 1,106人 / keyEv 0    <5秒: 1,267人 / keyEv 0    <8秒: 1,277人 / keyEv 0
//     <10秒: 1,291人 / keyEv 2   <15秒: 1,551人 / keyEv 14
//   → 8 秒までは**本物の読者(keyEv)を1件も巻き込まずに**取りこぼしだけを拾える。
//     10 秒を超えると keyEv を巻き込み始めるので 8 が上限。
//   3 秒のままでは Singapore 161 users(滞在 4.6 秒・keyEv 0)が素通りしていた。これは
//   全記事を機械的に1周するスキャナで、閾値のすぐ外側を通っていた(下の top10% の経緯を参照)。
//
// ★言語(Chinese)での除外は意図的に採らない。滞在 0 秒の塊は確かに
//   US×中国語 649 / China 226 / Iran 66 / Russia 49 = 990 users(keyEv 全て 0)に集中するが、
//   言語で一律に切ると将来その言語圏の**実在の読者が黙って消える**(zh-TW は滞在 27 秒の
//   実読者がいる)。滞在時間で切れば本物は自動的に残る。
// 画面の見出しにも出すので定数にする(ベタ書きすると閾値を変えたとき表示だけ古くなる)。
const BOT_SEC_PER_USER = 8;
const BOT_MIN_USERS = 10;
const isBotSuspect = (users, _engaged, durSec) =>
  users >= BOT_MIN_USERS && durSec / users < BOT_SEC_PER_USER;

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

/**
 * ★2026-09-14 追加: 診断列 "top10%"(ページ閲覧の上位集中度)。
 *
 * これは**自動判定ではない**。意図的に判定に使っていない。
 *
 * 経緯: Singapore 167 users が当時の isBotSuspect(Direct×滞在<3秒/人)を素通りし、
 * (※この Singapore は 2026-09-14 の閾値 3→8 秒で捕捉されるようになった。ただし
 *   下の「閾値の外側を通る相手は原理的に検出できない」という話は閾値を動かしても
 *   変わらないので、この診断列は引き続き必要。)
 * 「ボット混入ゼロ・US に次ぐ2位の優良トラフィック」として表示されていた。実体は
 * 全記事を機械的に1周するスキャナで、閲覧ページ TOP15 が全て views=2 users=2、
 * 滞在は 0秒 か 8〜23秒 の二択、166/167 が Direct、9/09-9/11 の3日に平常の30倍が
 * 集中していた。平均滞在 8.4 秒で**閾値3秒のすぐ外側**にいたため捕まらなかった。
 *
 * 閾値ベースの判定は、閾値の外側を通る相手を原理的に検出できない。だから閾値を
 * 足すのではなく、**人間が異常に気づける材料を並べる**方針にした。
 *
 * top10% = 閲覧数上位10%のページが全ページビューに占める割合。
 *   人間は人気記事に偏るので高い。スキャナは全記事を均等に踏むので低い。
 *   2026-09-14 実測: Singapore 11% / Spain 20% / South Korea 25% / France 27%
 *                    Germany 30% / United States 35% / Brazil 36% / Japan 41%
 *   → 20% 未満が続く国は、数字が大きくても読者ではない可能性を疑う。
 *
 * ★他の指標を判定に使わなかった理由(いずれも実測で否定済み。再提案しないこと):
 *   - 最頻値占有率: Singapore 63% に対し France 82% / Spain 85% と**人間の方が高い**。
 *   - 0秒ページ率: Singapore 62% に対し **United States 77%**。US 自体に 649 人の
 *     ボットが混ざっているため。国単位では人間とボットを分離できない。
 *   - 日別バースト: Singapore 3.9x に対し South Korea 3.6x / Brazil 3.2x で差が薄い。
 */
async function topShareByCountry(countries) {
  const out = new Map();
  for (const country of countries) {
    try {
      const pr = await report(tok, {
        dateRanges,
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        dimensionFilter: { filter: { fieldName: "country", stringFilter: { value: country } } },
        orderBys: [{ desc: true, metric: { metricName: "screenPageViews" } }],
        limit: 2000,
      });
      // ページ数が少ない国は比率が暴れるだけなので出さない(誤読の元)。
      if (pr.length < 10) { out.set(country, null); continue; }
      const v = pr.map((r) => r.m[0]);
      const total = v.reduce((a, b) => a + b, 0);
      const top = Math.max(1, Math.floor(v.length * 0.1));
      out.set(country, total ? v.slice(0, top).reduce((a, b) => a + b, 0) / total : null);
    } catch { out.set(country, null); }
  }
  return out;
}

console.log("== 国別 (human = ボット疑い層を除いた数) ==");
console.log(`${"country".padEnd(22)}${fmt("all")}${fmt("human")}${fmt("eng")}${fmt("sec/u", 7)}${fmt("key")}${fmt("top10%", 8)}`);
const sorted = [...byCountry].sort((a, b) => b[1].human - a[1].human).slice(0, 30);
const tops = await topShareByCountry(sorted.map(([c]) => c));
const topStr = (t) => (t === null || t === undefined ? "-" : `${Math.round(t * 100)}%`);
for (const [country, c] of sorted) {
  const t = tops.get(country);
  // 印は human>=50 の国にだけ付ける。母数が小さい国は「20人が20ページを1回ずつ」で
  // 集中度が構造的に下がるため、閾値を割るのが普通で、印を付けても意味を持たない
  // (2026-09-14 実測: United Kingdom 19人で10%, Netherlands 20人で14%, Peru 12人で10%)。
  // 境界は 15%。20% にすると Spain(20%, 45秒/人・キーイベント23件・Amazon €3.17 の実収益あり)
  // が毎回引っかかる。実収益のある国を疑う印は、印そのものが読み流される原因になる。
  const mark = t !== null && t !== undefined && t < 0.15 && c.human >= 50 ? " ←均一" : "";
  console.log(`${country.padEnd(22)}${fmt(c.users)}${fmt(c.human)}${fmt(c.engaged)}${fmt(c.human ? Math.round(c.dur / c.human) : 0, 7)}${fmt(c.key)}${fmt(topStr(t), 8)}${mark}`);
}
const totalAll = [...byCountry.values()].reduce((s, c) => s + c.users, 0);
const totalBot = bots.reduce((s, b) => s + b.users, 0);
console.log(`\n== ボット疑い層 (Direct × 滞在<${BOT_SEC_PER_USER}秒/人 × ${BOT_MIN_USERS}人以上) : ${totalBot} / ${totalAll} users = ${((100 * totalBot) / (totalAll || 1)).toFixed(1)}% ==`);
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
    `読み方: docs/COUNTRY_ACCESS.md。human = Direct×滞在<${BOT_SEC_PER_USER}秒/人×${BOT_MIN_USERS}人以上 の塊を除いた数。`,
    ``,
    `**top10% 列は自動判定ではなく人が読むための材料。** 閲覧数上位10%のページが全ページ`,
    `ビューに占める割合。人間は人気記事に偏るので高く、全記事を1周するスキャナは低い。`,
    `2026-09-14 実測: Singapore 11% / Spain 20% / South Korea 25% / France 27% /`,
    `Germany 30% / United States 35% / Brazil 36% / Japan 41%。**15% 未満が続く国は、`,
    `human の数字が大きくても読者でない可能性を疑う**(Singapore 167人は平均滞在 8.4 秒で`,
    `閾値3秒の外側を通り、「ボット混入ゼロの優良トラフィック」として表示されていた)。`,
    `境界は 15%。20% にすると Spain(20%・45秒/人・キーイベント23件・Amazon €3.17 の実収益)`,
    `が毎回引っかかり、印が読み流される。`,
    `**ただし human が 50 人未満の国では読まないこと。** 母数が小さいと「20人が20ページを`,
    `1回ずつ」で集中度が構造的に下がり、健全な国でも 10〜15% になる(UK 19人で10%,`,
    `Netherlands 20人で14%)。コンソール出力の ←均一 印も human>=50 にだけ付く。`,
    ``,
    `human 列からは除外していない。除外する閾値を足しても、その外側を通る相手は捕まらない。`,
    ``,
    `| country | all | human | engaged | sec/user | key events | top10% |`,
    `|---|---:|---:|---:|---:|---:|---:|`,
    ...sorted.map(([country, c]) => `| ${country} | ${c.users} | ${c.human} | ${c.engaged} | ${c.human ? Math.round(c.dur / c.human) : 0} | ${c.key} | ${topStr(tops.get(country))} |`),
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
