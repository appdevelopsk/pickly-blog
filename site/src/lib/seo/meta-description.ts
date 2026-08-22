// meta description をSERPの表示枠に収める (2026-08-22)
//
// なぜ: Bing Webmaster Tools の Recommendations が全プロパティで
// 「メタ説明が長すぎます / 短すぎます」を大量報告していた。
// pickly だけでビルド出力13,970ページ中、
//   ・160字超  2,686件 (最長273字。翻訳で英語より膨らむ de/fr/es が中心)
//   ・50字未満   918件 (privacy/disclosure などの定型ページ)
// H1・img alt・html lang・canonical は全ページ0件で、
// Bingのエラー総数は実質100%がこの1項目だった。
//
// 翻訳JSONを1本ずつ直すのは 2,686件×再翻訳で現実的でないうえ、
// 翻訳を足すたび再発する。description が <meta> に載る唯一の出口
// (各 generateMetadata) で機械的にクランプする。

export const DESC_MAX = 160;
export const DESC_MIN = 50;

// 全角(W/F)は表示幅2だが、Bingが見ているのは文字数なので長さは code point で数える。
// 区切り優先度: 文末(。．!?) > 読点/カンマ > 空白。CJKは空白が無いので
// 空白だけで切ると一度も発火せず、丸ごと切り捨てになる。
const SENTENCE_END = /[。．.!?！？]/;
const SOFT_BREAK = /[、，,;；:：\s]/;

function lastBreakBefore(s: string, limit: number, re: RegExp): number {
  for (let i = limit - 1; i >= Math.floor(limit * 0.6); i--) {
    const ch = s[i];
    if (ch && re.test(ch)) return i;
  }
  return -1;
}

/**
 * description を DESC_MAX 以内に収める。
 * 文末で切れるならそこで切り、無理なら読点/空白、それも無ければ素で切って「…」。
 */
export function clampDescription(raw: string): string {
  const s = (raw ?? "").replace(/\s+/g, " ").trim();
  if (!s) return "";
  if ([...s].length <= DESC_MAX) return s;

  // code point 単位に落としてから切る (絵文字/サロゲートペアで壊さない)
  const cp = [...s];
  const head = cp.slice(0, DESC_MAX).join("");

  const sentence = lastBreakBefore(head, head.length, SENTENCE_END);
  if (sentence >= 0) return head.slice(0, sentence + 1).trim();

  const soft = lastBreakBefore(head, head.length, SOFT_BREAK);
  if (soft >= 0) return head.slice(0, soft).trim().replace(/[、，,;；:：]$/, "") + "…";

  // 「…」も1文字ぶん枠を食うので DESC_MAX-1 で切る (161字になる off-by-one 対策)
  return cp.slice(0, DESC_MAX - 1).join("").trim() + "…";
}

/**
 * 短すぎる description を補う。fallback は記事の lede や定型文など。
 * 補ってもなお DESC_MIN 未満なら、短いまま返す(嘘を足すよりマシ)。
 */
export function padDescription(raw: string, ...fallbacks: string[]): string {
  let s = (raw ?? "").replace(/\s+/g, " ").trim();
  for (const f of fallbacks) {
    if ([...s].length >= DESC_MIN) break;
    const add = (f ?? "").replace(/\s+/g, " ").trim();
    if (!add || s.includes(add)) continue;
    s = s ? `${s} ${add}` : add;
  }
  return clampDescription(s);
}

/** 生成と補正を1回で。generateMetadata から呼ぶ入口。 */
export function seoDescription(raw: string, ...fallbacks: string[]): string {
  return padDescription(raw, ...fallbacks);
}
