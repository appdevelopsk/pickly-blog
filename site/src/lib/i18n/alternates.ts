import { INDEXED_LOCALES, DEFAULT_LOCALE } from "./locales";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";

/**
 * ロケール共通ページ（/about, /articles など全ロケールで必ず生成されるページ）の
 * canonical + hreflang を組み立てる。
 *
 * sitemap.ts は STATIC_PATHS に対して INDEXED_LOCALES 分の hreflang と x-default を
 * 宣言しているのに、ページ側は canonical も hreflang も出していなかった
 * （/about /contact /privacy /terms /disclosure /articles × 11ロケール = 66ページ）。
 * sitemap とページで宣言が食い違うと hreflang クラスタが成立しないため、
 * ページ側を sitemap と同一条件に揃える (2026-08-01)。
 *
 * @param path 先頭スラッシュ付き・末尾スラッシュなしのロケール以下のパス（例 "/about"、トップは ""）
 */
export function localeAlternates(path: string, locale: string) {
  const p = path === "/" ? "" : path;
  return {
    canonical: `${SITE_URL}/${locale}${p}/`,
    languages: withEnglishGeoAlternates({
      ...Object.fromEntries(INDEXED_LOCALES.map((l) => [l, `${SITE_URL}/${l}${p}/`])),
      "x-default": `${SITE_URL}/${DEFAULT_LOCALE}${p}/`,
    }),
  };
}

/**
 * en を宣言している hreflang クラスタに en-GB / en-CA を同一URLで追加する。
 *
 * UK/CA には専用ロケールが無く(inferMarketFromLocale は en→US 固定)、sitemap 4,181件
 * 中 UK/CA 向けページは0本だった。一方 AffiliateLink 側は geo 検出(タイムゾーン+
 * navigator.languages+x-market cookie)で UK/CA 訪問者を amazon.co.uk / amazon.ca +
 * 各国タグに変換済み。つまり「UK/CA の検索結果に /en/ が出さえすれば」収益化される。
 * 同一URLを en / en-GB / en-CA で多重宣言するのは hreflang 仕様上有効(2026-08-11)。
 * ★ページ metadata と sitemap の両方に適用すること。片方だけだと三者不一致に戻る。
 */
export function withEnglishGeoAlternates(
  languages: Record<string, string>,
): Record<string, string> {
  if (!languages[DEFAULT_LOCALE]) return languages;
  return {
    ...languages,
    "en-GB": languages[DEFAULT_LOCALE],
    "en-CA": languages[DEFAULT_LOCALE],
  };
}
