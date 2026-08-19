#!/usr/bin/env tsx
/**
 * 指定slugについて、index対象ロケール(INDEXED_LOCALES)のうち
 * 「stub落ちする = そのロケールで実質存在しない」ものを列挙する。
 *
 * 用途: pickly-enrich-daily.sh の AI引用ガードが noindex記事を index復帰させる直前に、
 * 翻訳の穴が無いか確認する。穴のまま復帰すると /en への meta-refresh stub が index対象になる
 * (2026-08-19、deindexed記事425件の stub落ちを埋めた際に判明した構造的リーク)。
 *
 * 使い方: npx tsx scripts/check-article-translations.ts <slug> [<slug>...]
 *   stdout に "slug<TAB>locale" を1行ずつ出力。穴が無ければ何も出力しない。
 */
import { INDEXED_LOCALES, DEFAULT_LOCALE } from "../src/lib/i18n/locales";
import { isArticleBodyTranslated } from "../src/lib/i18n/loader";

const slugs = process.argv.slice(2);
if (!slugs.length) {
  console.error("usage: check-article-translations.ts <slug> [<slug>...]");
  process.exit(2);
}

for (const slug of slugs) {
  for (const locale of INDEXED_LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    if (!isArticleBodyTranslated(slug, locale)) console.log(`${slug}\t${locale}`);
  }
}
