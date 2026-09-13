import type { ArticleCategory } from "@/lib/articles/types";

/**
 * カテゴリ直下のサブカテゴリ(価格.com 型の「大カテゴリ→品目」の中間層)。
 *
 * ★全カテゴリには作れない。2026-09-13 に en 790本の slug 語彙を実測したところ、
 *   記事が5件以上ぶら下がる語はカテゴリごとに 2〜6 語しかなく、しかも
 *   travel の "travel" 40件(カテゴリ名と同語)、fitness の "bar"/"up"/"pull"
 *   (pull-up-bar が分解された断片)、home の "air" 7件(purifier/fryer/conditioner が
 *   混在)のように、サブカテゴリとして成立しない語が上位を占める。
 *   そのため **実数と粒度が伴う pets / parenting / finance の3カテゴリのみ** 定義する。
 *   残り7カテゴリは子を持たず、サイドバーでは従来どおり単独で並ぶ。
 *
 * ★軸を足す前に必ず投入率を実測すること(rating を型宣言だけで「ある」と誤認した前科)。
 *   ArticleFacets の冒頭コメントにも同じ戒めがある。
 *
 * 記事の寄せ方は tag-config と同じ slugKeywords 方式。ただし tag と違い
 * **1記事が複数の親を持たない**よう parent は単一カテゴリに固定する。
 * マッチは slug をハイフン分割した「語」の完全一致(部分一致だと cat が
 * "category"/"application" に誤爆する)。
 */

export interface SubcategoryConfig {
  slug: string;
  /** 属する大カテゴリ。tag と違い複数に跨がらせない。 */
  parent: ArticleCategory;
  /** 英語の既定ラベル。翻訳は messages の subcategory.<slug> があればそちらが優先。 */
  label: string;
  /** slug をハイフン分割した語との完全一致で記事を寄せる。 */
  slugKeywords: string[];
}

export const SUBCATEGORIES: SubcategoryConfig[] = [
  // ── pets (58件中 37件がマッチ、残り21件は魚/鳥/小動物など犬猫以外) ──
  { slug: "dog", parent: "pets", label: "Dog", slugKeywords: ["dog"] },
  { slug: "cat", parent: "pets", label: "Cat", slugKeywords: ["cat"] },

  // ── parenting (54件中 40件がマッチ。年齢帯という一貫した軸) ──
  { slug: "baby",    parent: "parenting", label: "Baby",    slugKeywords: ["baby"] },
  { slug: "kids",    parent: "parenting", label: "Kids",    slugKeywords: ["kids", "kid"] },
  { slug: "toddler", parent: "parenting", label: "Toddler", slugKeywords: ["toddler"] },

  // ── finance (54件中 33件がマッチ。insurance は life/pet/home/auto… と粒度が揃う) ──
  { slug: "insurance", parent: "finance", label: "Insurance", slugKeywords: ["insurance"] },
  { slug: "card",      parent: "finance", label: "Cards",     slugKeywords: ["card", "credit"] },
  { slug: "account",   parent: "finance", label: "Accounts",  slugKeywords: ["account", "savings", "ira", "etf"] },
];

/** 親カテゴリ → 子の配列。子を持たないカテゴリはキー自体が無い。 */
export const SUBCATEGORIES_BY_PARENT: Partial<Record<ArticleCategory, SubcategoryConfig[]>> =
  SUBCATEGORIES.reduce((acc, s) => {
    (acc[s.parent] ??= []).push(s);
    return acc;
  }, {} as Partial<Record<ArticleCategory, SubcategoryConfig[]>>);

/**
 * 記事 slug がこのサブカテゴリに属するか。
 * 呼び出し側で記事の category が parent と一致することを先に確かめること
 * (このリスト単体では pets/cat と fashion の "cat" のような同語衝突を弾けない)。
 */
export function matchesSubcategory(articleSlug: string, sub: SubcategoryConfig): boolean {
  const words = articleSlug.split("-");
  return sub.slugKeywords.some((k) => words.includes(k));
}
