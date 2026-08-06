import type { Market } from "./types";

/**
 * 訪問者の UK / CA 判定（クライアント側推定）。
 *
 * 背景 (2026-08-06): AffiliateLink は `x-market` cookie を読んで UK/CA を
 * 各国 Amazon に振り替える設計だったが、**cookie を設定する処理がどこにも
 * 存在せず**、英語ページの UK 訪問者には amazon.com が出続けていた。
 * pickly は静的エクスポート(Cloudflare Pages)でサーバ実行時が無いため、
 * geo はクライアントで推定するのが唯一の経路。
 *
 * 判定材料は2つ。位置の証拠として強い順に:
 *   1. IANA タイムゾーン (Europe/London は UK 居住のほぼ確実な証拠)
 *   2. ブラウザ言語 (en-GB / en-CA は設定嗜好なので弱いが、単独でも十分)
 *
 * CA も適用済み(2026-08-06)。当初「タグ未取得」として見送ったが、
 * アカウントは実在した(pickly056-20)。前提を確かめずにガードを書いた教訓。
 */

const UK_ZONES = new Set(["Europe/London", "Europe/Belfast", "Europe/Guernsey", "Europe/Jersey", "Europe/Isle_of_Man"]);

const CA_ZONES = new Set([
  "America/Toronto", "America/Montreal", "America/Vancouver", "America/Edmonton",
  "America/Winnipeg", "America/Halifax", "America/St_Johns", "America/Regina",
  "America/Moncton", "America/Saskatoon", "America/Whitehorse", "America/Yellowknife",
  "America/Iqaluit", "America/Dawson", "America/Dawson_Creek", "America/Fort_Nelson",
  "America/Glace_Bay", "America/Goose_Bay", "America/Inuvik", "America/Cambridge_Bay",
  "America/Rankin_Inlet", "America/Resolute", "America/Swift_Current", "America/Creston",
  "America/Blanc-Sablon", "America/Atikokan", "America/Thunder_Bay", "America/Nipigon",
  "America/Rainy_River", "America/Pangnirtung",
]);

export function inferGeoMarket(
  languages: readonly string[],
  timeZone: string | undefined,
): Extract<Market, "UK" | "CA"> | null {
  if (timeZone) {
    if (UK_ZONES.has(timeZone)) return "UK";
    if (CA_ZONES.has(timeZone)) return "CA";
  }
  for (const l of languages) {
    const lower = l.toLowerCase();
    if (lower === "en-gb") return "UK";
    if (lower === "en-ca" || lower === "fr-ca") return "CA";
  }
  return null;
}
