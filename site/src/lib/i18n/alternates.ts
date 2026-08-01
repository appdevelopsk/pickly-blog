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
    languages: {
      ...Object.fromEntries(INDEXED_LOCALES.map((l) => [l, `${SITE_URL}/${l}${p}/`])),
      "x-default": `${SITE_URL}/${DEFAULT_LOCALE}${p}/`,
    },
  };
}
