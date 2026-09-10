/**
 * Cloudflare Pages Function — ルート "/" の言語振り分け (2026-09-09)
 *
 * 経緯: これまで "/" は public/_redirects の `/ /en/ 301` で全訪問者を無条件に
 * 英語へ送っていた。GA4 の国別レポート(8/12–9/8)では人間の流入が 40 か国以上に
 * 散っており、ブラジル・韓国・スペイン語圏の読者もまず /en/ に着地していた。
 * 17 ロケール分のページは全部生成済みなのに、入口だけが英語固定だった。
 *
 * 方針:
 *   - クローラ(UA に bot/crawl/spider 等)  → 301 /en/   … 従来どおり。
 *     302 にすると Google が "/" を canonical に選ぶ事故が起きた(2026-08-04)ので、
 *     検索エンジンには 301 で /en/ を確定させ続ける。hreflang/x-default は各ページ側。
 *   - 人間: Accept-Language の最良一致が en 以外の対応ロケール → 302 /<locale>/
 *           一致なし / en                                    → 301 /en/
 *     302 なのは「同じ URL が人によって違う先に飛ぶ」ことを正直に表すため。
 *     Vary: Accept-Language を付けてエッジキャッシュの取り違えを防ぐ。
 *
 * ★_redirects より Functions が優先される(Pages の仕様: Functions が応答した
 *   リクエストには _redirects は適用されない)。_redirects の行は Functions が
 *   落ちた時の保険として残す。
 * ★ロケール一覧は src/lib/i18n/locales.ts と同期すること。functions/ は Next の
 *   バンドル外で src を import しないため、scripts/check-root-routing.mjs が
 *   両者の差分をビルド前に検査する。
 */

// ★ src/lib/i18n/locales.ts の LOCALES(active) と同一であること(check-root-routing.mjs が検査)。
const LOCALES = [
  "en", "ja", "zh-CN", "zh-TW", "ko", "es", "pt-BR", "fr", "de", "it",
  "ru", "ar", "hi", "id", "th", "vi", "tr",
] as const;
const DEFAULT_LOCALE = "en";

// 言語タグ → ロケールの寄せ方。exact 一致を先に見て、次にここ、最後に基底言語。
const ALIASES: Record<string, string> = {
  "zh-hant": "zh-TW", "zh-hk": "zh-TW", "zh-mo": "zh-TW", "zh-tw": "zh-TW",
  "zh-hans": "zh-CN", "zh-sg": "zh-CN", "zh": "zh-CN",
  "pt": "pt-BR", "pt-pt": "pt-BR",
};

const BOT_UA = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora link preview|pinterest|whatsapp|telegram|discord|preview|headless|lighthouse|pagespeed|gtmetrix|curl\/|wget\//i;

export function pickLocale(acceptLanguage: string | null): string {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const lower = new Map<string, string>(LOCALES.map((l) => [l.toLowerCase(), l]));
  const prefs = acceptLanguage
    .split(",")
    .map((part, i) => {
      const [tag, ...params] = part.trim().split(";");
      const qp = params.find((p) => p.trim().startsWith("q="));
      const q = qp ? Number(qp.trim().slice(2)) : 1;
      return { tag: tag.trim().toLowerCase(), q: Number.isFinite(q) ? q : 0, i };
    })
    .filter((p) => p.tag && p.q > 0)
    .sort((a, b) => b.q - a.q || a.i - b.i);
  for (const { tag } of prefs) {
    if (tag === "*") return DEFAULT_LOCALE;
    const exact = lower.get(tag);
    if (exact) return exact;
    const alias = ALIASES[tag];
    if (alias) return alias;
    const base = tag.split("-")[0];
    const baseAlias = ALIASES[base];
    if (baseAlias) return baseAlias;
    const baseHit = lower.get(base);
    if (baseHit) return baseHit;
  }
  return DEFAULT_LOCALE;
}

export function routeRoot(request: Request): Response {
  const url = new URL(request.url);
  const ua = request.headers.get("user-agent") ?? "";
  const isBot = BOT_UA.test(ua) || !ua;
  const locale = isBot ? DEFAULT_LOCALE : pickLocale(request.headers.get("accept-language"));
  const target = `${url.origin}/${locale}/${url.search}`;
  const status = locale === DEFAULT_LOCALE ? 301 : 302;
  return new Response(null, {
    status,
    headers: {
      Location: target,
      Vary: "Accept-Language",
      "Cache-Control": status === 301 ? "public, max-age=3600" : "private, no-store",
    },
  });
}

export const onRequest = (context: { request: Request }): Response => routeRoot(context.request);
