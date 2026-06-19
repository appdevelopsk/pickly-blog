/**
 * 17言語フル定義。pickly は Pinterest 流入主軸で
 * Google HCU リスクが低いため、最初から全言語 active にする
 * （Toolifyとは異なる方針）。
 */
export const LOCALE_DEFS = [
  { code: "en", name: "English", native: "English", dir: "ltr", active: true },
  { code: "ja", name: "Japanese", native: "日本語", dir: "ltr", active: true },
  { code: "zh-CN", name: "Chinese (Simplified)", native: "简体中文", dir: "ltr", active: true },
  { code: "zh-TW", name: "Chinese (Traditional)", native: "繁體中文", dir: "ltr", active: true },
  { code: "ko", name: "Korean", native: "한국어", dir: "ltr", active: true },
  { code: "es", name: "Spanish", native: "Español", dir: "ltr", active: true },
  { code: "pt-BR", name: "Portuguese (Brazil)", native: "Português", dir: "ltr", active: true },
  { code: "fr", name: "French", native: "Français", dir: "ltr", active: true },
  { code: "de", name: "German", native: "Deutsch", dir: "ltr", active: true },
  { code: "it", name: "Italian", native: "Italiano", dir: "ltr", active: true },
  { code: "ru", name: "Russian", native: "Русский", dir: "ltr", active: true },
  { code: "ar", name: "Arabic", native: "العربية", dir: "rtl", active: true },
  { code: "hi", name: "Hindi", native: "हिन्दी", dir: "ltr", active: true },
  { code: "id", name: "Indonesian", native: "Bahasa Indonesia", dir: "ltr", active: true },
  { code: "th", name: "Thai", native: "ไทย", dir: "ltr", active: true },
  { code: "vi", name: "Vietnamese", native: "Tiếng Việt", dir: "ltr", active: true },
  { code: "tr", name: "Turkish", native: "Türkçe", dir: "ltr", active: true },
] as const;

export type Locale = (typeof LOCALE_DEFS)[number]["code"];

export const LOCALES = LOCALE_DEFS.filter((l) => l.active).map((l) => l.code);
export const ALL_LOCALES = LOCALE_DEFS.map((l) => l.code);
export const DEFAULT_LOCALE: Locale = "en";

/**
 * 検索インデックス対象ロケール（2026-06-19）。Search Console 28日実測で
 * クリックを生むのはこの8言語のみ（en/de/es/it/ru + 表示のある fr/pt-BR +
 * 本拠地 ja）。残り9言語（zh-CN/zh-TW/ko/ar/hi/id/th/vi/tr）は28日で
 * ほぼ0クリックなのに大量の死蔵ページとなり、サイト全体の品質評価(HCU)を
 * 下げていた（量産7,938ページ中の表示は5.6%のみ）。
 * → 全言語のページ自体は残す（URL/UI言語切替は不変・内部リンクは follow）が、
 *   非対象ロケールを noindex + sitemap除外して死蔵在庫を検索から外す。
 * 再開は本配列に該当コードを戻すだけ（可逆）。
 */
export const INDEXED_LOCALES: Locale[] = ["en", "ja", "de", "es", "fr", "it", "ru", "pt-BR"];

export function isIndexedLocale(code: string): boolean {
  return (INDEXED_LOCALES as readonly string[]).includes(code);
}

export function getLocaleDef(code: string) {
  return LOCALE_DEFS.find((l) => l.code === code);
}

export function getDirection(code: string): "ltr" | "rtl" {
  return getLocaleDef(code)?.dir === "rtl" ? "rtl" : "ltr";
}

/**
 * Pinterest流入を狙う優先ロケール。これ以外の言語はSEOボーナス目的で
 * 用意するが、SNS投稿は en/ja/es/pt-BR/de/fr に集中させる。
 */
export const PINTEREST_PRIORITY_LOCALES: Locale[] = ["en", "ja", "es", "pt-BR", "de", "fr"];

/**
 * ロケールから推定される購買力市場（アフィリリンク振り分け用）。
 * UK / CA は locale では判別できないため、Cloudflare Pages Function が
 * セットする x-market クッキーを AffiliateLink クライアントで読んで上書きする。
 */
export function inferMarketFromLocale(locale: string): "JP" | "US" | "UK" | "CA" | "EU" | "FR" | "ES" | "IT" | "CN" | "global" {
  if (locale === "ja") return "JP";
  if (locale === "zh-CN" || locale === "zh-TW") return "CN";
  if (locale === "en") return "US";
  if (locale === "fr") return "FR";
  if (locale === "es") return "ES";
  if (locale === "it") return "IT";
  if (locale === "de" || locale === "pt-BR") return "EU";
  return "global";
}
