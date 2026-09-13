// offerId キーで製品の評点(grade)を引く。サイトは grade-cache.json を読むだけで、
// ビルド時の取得や記事JSONの走査はしない(specs.ts と同じ作法)。
//
// grade の出どころは記事ごとの products[]。CATALOG 側の `rating` は型宣言だけで
// 投入が0件なので、製品単位の並べ替えに使える実データは grade だけになる。
// 索引の生成は scripts/generate-grade-cache.ts。
import rawCache from "./grade-cache.json";

/** 高い順。索引生成側(generate-grade-cache.ts)と同じ並びでなければならない。 */
export const GRADE_ORDER = ["A+", "A", "A-", "B+", "B", "B-", "C+"] as const;
export type Grade = (typeof GRADE_ORDER)[number];

export type GradeEntry = {
  grade: Grade;
  /** 採点の出典記事。同じ製品が複数記事に載る場合は最高点を採った方の slug。 */
  slug: string;
};

const CACHE = rawCache as unknown as Record<string, GradeEntry>;

const RANK = new Map<string, number>(GRADE_ORDER.map((g, i) => [g, i]));

/** 評点があれば返す。無ければ undefined(= 並べ替えの対象外)。 */
export function getGrade(offerId: string): Grade | undefined {
  return CACHE[offerId]?.grade;
}

export function getGradeEntry(offerId: string): GradeEntry | undefined {
  return CACHE[offerId];
}

/**
 * 並べ替え用の序数。小さいほど高評価。
 * 未評価は Number.MAX_SAFE_INTEGER を返して必ず末尾に落とす
 * (0 を返すと未評価が最上位に来てしまう)。
 */
export function gradeRank(offerId: string): number {
  const g = CACHE[offerId]?.grade;
  if (!g) return Number.MAX_SAFE_INTEGER;
  return RANK.get(g) ?? Number.MAX_SAFE_INTEGER;
}

/**
 * バッジの配色。ArticleBody の製品カードと同じ見え方に揃える
 * (A+ だけ金、A はブランド色、それ以外はグレー)。
 * 新しい色を足すと同じ評点が画面によって違う色になるので増やさない。
 */
export function gradeBadgeClass(grade: Grade): string {
  if (grade === "A+") return "bg-amber-500 text-pure";
  if (grade === "A") return "bg-brand-600 text-white";
  return "bg-slate-500 text-white";
}
