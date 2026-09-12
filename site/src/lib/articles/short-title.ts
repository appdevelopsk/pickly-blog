/**
 * 記事タイトルから「品目名」だけを切り出す。
 *
 * トップのカテゴリ表（価格.com 型）はリンクを 1 行に詰めるため、
 * "Best Air Fryer 2026: 5 Models Compared Honestly" のようなフルタイトルは使えない。
 * ★ slug から英語名を作ると 17 ロケールすべてが英語になるので、
 *   必ず翻訳済みタイトル側から削る。
 */
export function shortTitle(title: string): string {
  let s = title.split(/[:：|｜–—]/)[0] ?? title;
  s = s.replace(/[【（(\[].*$/u, "");                       // 【2026年版】以降
  s = s.replace(/\s*\b20\d\d\s*年?版?\s*/gu, " ");          // 年号
  s = s.replace(/の?おすすめ\s*\d*\s*選?/gu, " ");          // 「おすすめ5選」「のおすすめ」
  s = s.replace(/\s*\d+\s*(選|製品|機種|本|社|州|モデル|足)\s*/gu, " ");
  s = s.replace(/(比較|ランキング)$/u, "");
  // "5 Best Health Savings Accounts of 2026" のように数詞が先頭に来る語順もある。
  s = s.replace(/^\d+\s+/u, "");
  s = s.replace(
    /^(The Best|Best|Die besten|Beste[sn]?|Los mejores|Las mejores|Les meilleurs?|Les meilleures?|I migliori|Le migliori|As melhores|Os melhores)\s+/i,
    "",
  );
  s = s.replace(/\s+(of|for|in)\s*$/i, "");   // 年号を落とした後に残る前置詞
  s = s.replace(/\s+/g, " ").trim();
  s = s.replace(/\s*[をはがのにでと]$/u, "");               // 切り落とし後に残る助詞
  return s || title;
}

/**
 * 年号だけを落とす。
 *
 * ★usecase/gift/compare の翻訳済みタイトルは元から短い。ここに shortTitle を
 *   掛けると「大学生に の製品」のように助詞が浮く(日本語訳が
 *   "大学生に おすすめの製品" のような語順で、「おすすめ」除去が中間に当たるため)。
 *   年号の除去だけに留める。
 */
export function stripYear(title: string): string {
  return title
    .replace(/\s*\b20\d\d\s*年?版?\s*$/u, "")
    .replace(/\s+(of|for|in)\s*$/i, "")
    .trim() || title;
}
