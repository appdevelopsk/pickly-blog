/**
 * YouTube 検索のロケール設定（2026-08-12）。
 *
 * それまで検索語は「ja=レビュー / それ以外=review」の2択で、キャッシュも
 * ja / en の2本しか無かった。結果、独・仏・西・韓… どのロケールで読んでも
 * 埋め込まれるのは英語動画（検索リンクも英語クエリ）で、本文の言語と
 * 動画の言語が一致していなかった。ここを 17 言語ぶんに開く。
 *
 * - term: 「レビュー」に当たる語。検索クエリに足す。
 * - hl / gl: YouTube 検索 UI の言語・地域（検索リンク用）。
 * - relevanceLanguage / regionCode: Data API 側の絞り込み（取得スクリプト用）。
 * - reject: 「この言語の読者に出してはいけない」動画タイトルの文字種。
 *   例) 英語ロケールに日本語タイトルの動画を出さない。ラテン文字系どうしは
 *   文字種で区別できないので undefined（API の relevanceLanguage に委ねる）。
 */
export interface YtLocaleConf {
  term: string;
  hl: string;
  gl: string;
  relevanceLanguage: string;
  regionCode?: string;
  reject?: RegExp;
}

const CJK = /[぀-ヿ一-鿿가-힣]/;

export const YT_LOCALES: Record<string, YtLocaleConf> = {
  en: { term: "review", hl: "en", gl: "US", relevanceLanguage: "en", regionCode: "US", reject: CJK },
  ja: { term: "レビュー", hl: "ja", gl: "JP", relevanceLanguage: "ja", regionCode: "JP" },
  "zh-CN": { term: "评测", hl: "zh-CN", gl: "SG", relevanceLanguage: "zh-Hans" },
  "zh-TW": { term: "開箱評測", hl: "zh-TW", gl: "TW", relevanceLanguage: "zh-Hant", regionCode: "TW" },
  ko: { term: "리뷰", hl: "ko", gl: "KR", relevanceLanguage: "ko", regionCode: "KR" },
  es: { term: "análisis review", hl: "es", gl: "ES", relevanceLanguage: "es", regionCode: "ES", reject: CJK },
  "pt-BR": { term: "análise review", hl: "pt-BR", gl: "BR", relevanceLanguage: "pt", regionCode: "BR", reject: CJK },
  fr: { term: "test avis", hl: "fr", gl: "FR", relevanceLanguage: "fr", regionCode: "FR", reject: CJK },
  de: { term: "test review", hl: "de", gl: "DE", relevanceLanguage: "de", regionCode: "DE", reject: CJK },
  it: { term: "recensione", hl: "it", gl: "IT", relevanceLanguage: "it", regionCode: "IT", reject: CJK },
  ru: { term: "обзор", hl: "ru", gl: "RU", relevanceLanguage: "ru", regionCode: "RU", reject: CJK },
  ar: { term: "مراجعة", hl: "ar", gl: "SA", relevanceLanguage: "ar", regionCode: "SA", reject: CJK },
  hi: { term: "रिव्यू", hl: "hi", gl: "IN", relevanceLanguage: "hi", regionCode: "IN", reject: CJK },
  id: { term: "review", hl: "id", gl: "ID", relevanceLanguage: "id", regionCode: "ID", reject: CJK },
  th: { term: "รีวิว", hl: "th", gl: "TH", relevanceLanguage: "th", regionCode: "TH", reject: CJK },
  vi: { term: "đánh giá", hl: "vi", gl: "VN", relevanceLanguage: "vi", regionCode: "VN", reject: CJK },
  tr: { term: "inceleme", hl: "tr", gl: "TR", relevanceLanguage: "tr", regionCode: "TR", reject: CJK },
};

export function ytLocale(locale: string): YtLocaleConf {
  return YT_LOCALES[locale] ?? YT_LOCALES[locale.split("-")[0]] ?? YT_LOCALES.en;
}
