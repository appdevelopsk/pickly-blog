// デプロイ直後の本番スモークテスト (2026-09-10)。
// `/` の言語振り分け(functions/index.ts)と gtag のボットゲート(layout.tsx)が本番で
// 生きているかを実 HTTP で確かめる。_redirects や Function を触って壊しても、ビルドも
// check:output も通ってしまう種類の壊れ方なので、配信後の応答を見るしかない。
// 失敗すると exit 1 → Actions が赤くなり通知される(デプロイ自体は済んでいる)。
const BASE = process.env.SMOKE_BASE_URL ?? "https://pickly.blog";
const HUMAN = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/128.0 Safari/537.36";
const BOT = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

const cases = [
  { name: "/ ja human → 302 /ja/", path: "/", headers: { "accept-language": "ja", "user-agent": HUMAN }, status: 302, location: "/ja/" },
  { name: "/ pt-PT human → 302 /pt-BR/", path: "/", headers: { "accept-language": "pt-PT,pt;q=0.9", "user-agent": HUMAN }, status: 302, location: "/pt-BR/" },
  { name: "/ en-GB human → 301 /en/", path: "/", headers: { "accept-language": "en-GB", "user-agent": HUMAN }, status: 301, location: "/en/" },
  { name: "/ ja Googlebot → 301 /en/", path: "/", headers: { "accept-language": "ja", "user-agent": BOT }, status: 301, location: "/en/" },
  { name: "/en/ 200 + gtag webdriver gate", path: "/en/", headers: { "user-agent": HUMAN }, status: 200, bodyIncludes: "navigator.webdriver===true" },
];

let failed = 0;
for (const c of cases) {
  let ok = false, detail = "";
  for (let attempt = 0; attempt < 3 && !ok; attempt++) {
    try {
      const r = await fetch(BASE + c.path, { headers: c.headers, redirect: "manual" });
      const loc = r.headers.get("location") ?? "";
      detail = `status=${r.status} location=${loc}`;
      ok = r.status === c.status && (!c.location || loc === BASE + c.location);
      if (ok && c.bodyIncludes) { const t = await r.text(); ok = t.includes(c.bodyIncludes); if (!ok) detail += " (gate string missing)"; }
    } catch (e) { detail = String(e); }
    if (!ok) await new Promise((res) => setTimeout(res, 10000));
  }
  console.log(`${ok ? "OK  " : "FAIL"} ${c.name}  [${detail}]`);
  if (!ok) failed++;
}
if (failed) { console.error(`[smoke-prod] ${failed} failed. docs/COUNTRY_ACCESS.md を参照`); process.exit(1); }
console.log("[smoke-prod] all passed");
