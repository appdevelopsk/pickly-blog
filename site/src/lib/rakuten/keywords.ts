/**
 * 商品名 → 検索キーワード候補（2026-08-20）。
 *
 * 楽天/Yahoo の商品検索は「商品名を丸ごと投げる」と 0 件になりやすい。
 * 実測（2026-08-20）で判明した3つの失敗要因に対応する:
 *
 *  1. 修飾語が多すぎて0件
 *     "ラロッシュポゼ トレリアン ハイドレーティング ジェントル クレンザー" → 0件
 *     "ラロッシュポゼ トレリアン クレンザー"                               → ヒット
 *  2. 記号 `%` `+`、または1文字トークンを含むと RWS が 400 を返す
 *     "The Ordinary ナイアシンアミド 10% + ジンク 1%" / "メリタ バリオ E" → 400
 *  3. 細かい型番は楽天の商品名に載っていない
 *     "ブラウン シリーズ9 Pro+ 9565cc" → 0件
 *
 * そこで「具体的な候補から順に短くしていく」列を作り、呼び出し側が
 * 最初にヒットしたものを採用する。短いほど誤マッチしやすくなるため、
 * 関連性ガード（呼び出し側）と併用する前提。
 */

/**
 * RWS が 400 `keyword is not valid` を返す入力を除き、空白を正規化する。
 *
 * 400 の要因は実測（2026-08-20）で2つ:
 *   1. 記号 `%` `+` などを含む
 *   2. 空白区切りに1文字だけのトークンが混じる
 *      "A B" / "メリタ バリオ E" / "Oclean X" / "ラ ロッシュ" はいずれも400。
 *      1文字トークンが無い "オーラルB PRO" は通る。
 */
export function sanitizeKeyword(s: string): string {
  const cleaned = s
    .replace(/[%＋+&#?]/g, " ")
    .replace(/[（）()【】\[\]]/g, " ")
    .replace(/[／/|,，、]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  // 1文字トークンは捨てずに直前の語へ結合する。除去すると検索語の意味が変わる
  // （"ラ ロッシュ"→"ロッシュ" は製薬のロシュ、"Oclean X Pro"→"Oclean Pro"）。
  // 結合なら "ラロッシュ" / "OcleanX Pro" となり、楽天の商品名表記に近づく。
  const merged: string[] = [];
  for (const tok of cleaned.split(" ")) {
    if (!tok) continue;
    const prev = merged[merged.length - 1];
    if (tok.length === 1 && prev !== undefined) merged[merged.length - 1] = prev + tok;
    else merged.push(tok);
  }
  // 先頭が1文字だった場合（"ラ ロッシュ"）は結合先が無いので次の語へ前置き
  const [head, second] = merged;
  if (head !== undefined && second !== undefined && head.length === 1) {
    merged[1] = head + second;
    merged.shift();
  }
  return merged.filter((t) => t.length >= 2).join(" ");
}

/** 末尾に付きがちな型番トークン（英数字混在で桁が多い）か。 */
function isModelCode(tok: string): boolean {
  return /^[A-Za-z]*\d[A-Za-z0-9-]{3,}$/.test(tok);
}

/** 容量・数量など、検索を絞りすぎる単位トークンか。 */
function isUnit(tok: string): boolean {
  return /^\d+(\.\d+)?(ml|l|g|kg|mg|個|枚|本|回|日|錠|包|袋|色|cm|mm|inch|インチ)$/i.test(tok);
}

/**
 * 検索キーワード候補を「具体的 → 一般的」の順で返す（重複除去済み）。
 * 呼び出し側は先頭から順に試し、最初にヒットした時点で打ち切る。
 */
export function keywordCandidates(nameJa?: string, nameEn?: string): string[] {
  const out: string[] = [];
  const push = (s: string) => {
    const v = sanitizeKeyword(s);
    if (v.length < 3 || out.includes(v)) return;
    // ブランド名単独（1トークン）は誤マッチ源なので候補にしない。
    // 日本語の連続表記は空白が無く1トークンに見えるため、CJKを含む語は対象外。
    const oneToken = !v.includes(" ");
    const hasCjk = /[\u3040-\u30ff\u4e00-\u9fff]/.test(v);
    if (oneToken && !hasCjk) return;
    out.push(v);
  };

  for (const [raw, isJa] of [
    [nameJa, true],
    [nameEn, false],
  ] as [string | undefined, boolean][]) {
    if (!raw) continue;
    const base = sanitizeKeyword(raw);
    if (!base) continue;
    push(base);

    const toks = base.split(" ");
    // 型番・単位を落とした版
    const noCode = toks.filter((t) => !isModelCode(t) && !isUnit(t));
    if (noCode.length && noCode.length < toks.length) push(noCode.join(" "));

    // 先頭3トークン（ブランド + 製品ライン程度）
    if (noCode.length > 3) push(noCode.slice(0, 3).join(" "));

    // 先頭2トークンは日本語名のときだけ。
    // 日本語名は「ブランド 製品名」の形が多く2語で意味が残るが、英語名は
    // "The Ordinary" / "La Roche-Posay" / "Braun Series" のようにブランド側が
    // 2語を占めることが多く、切り詰めるとブランド名単独になって誤マッチする。
    if (isJa && noCode.length > 2) {
      const two = noCode.slice(0, 2).join(" ");
      // 日本語名でも先頭がラテン文字ブランドなら（"The Ordinary ナイアシンアミド"）
      // 2語に切るとブランド名単独になる。CJKが残る場合のみ採用する。
      if (/[\u3040-\u30ff\u4e00-\u9fff]/.test(two)) push(two);
    }
  }
  return out;
}
