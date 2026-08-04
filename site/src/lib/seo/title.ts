/**
 * SERP タイトルの幅管理。
 *
 * なぜ必要か:
 *   検索結果でタイトルが切れるかどうかは**文字数ではなく表示幅**で決まる。
 *   全角(East Asian Width = W/F)は半角2文字ぶんなので、CJK は文字数で数えると
 *   取りこぼす(pickly で ja は「60文字超」だと28本、表示幅60だと392本だった)。
 *
 *   さらに root layout の `title: { template: "%s | Pickly" }` が
 *   ブランド接尾辞を自動で足すため、本文タイトルを60幅に収めても
 *   結局9幅ぶん切れる。接尾辞は「入るときだけ付ける」のが正しい。
 */
const WIDE = /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦]/;

/** SERP の表示幅。全角は 2、それ以外は 1 で数える。 */
export function serpWidth(text: string): number {
  let w = 0;
  for (const c of text) w += WIDE.test(c) ? 2 : 1;
  return w;
}

export const SERP_TITLE_LIMIT = 60;
const BRAND_SUFFIX = " | Pickly";

/**
 * Metadata の `title` に入れる値を作る。
 *
 * 常に `absolute` を返してテンプレートを無効化し、**幅60に収まるときだけ**
 * 自分でブランド接尾辞を足す。収まらなければブランドを落として本文を守る
 * (ブランド名はドメインとファビコンで既に見えているので、失うものが小さい)。
 */
export function serpTitle(title: string): { absolute: string } {
  const withBrand = `${title}${BRAND_SUFFIX}`;
  return {
    absolute: serpWidth(withBrand) <= SERP_TITLE_LIMIT ? withBrand : title,
  };
}
