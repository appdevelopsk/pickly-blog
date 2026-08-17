import type { Locale } from "./locales";
import { DEFAULT_LOCALE } from "./locales";
import fs from "fs";
import path from "path";

type Messages = Record<string, unknown>;

function deepMerge(base: Messages, override: Messages): Messages {
  const result: Messages = { ...base };
  for (const key of Object.keys(override)) {
    const b = base[key];
    const o = override[key];
    if (b && o && typeof b === "object" && typeof o === "object" && !Array.isArray(b) && !Array.isArray(o)) {
      result[key] = deepMerge(b as Messages, o as Messages);
    } else {
      result[key] = o;
    }
  }
  return result;
}

async function loadCommon(locale: string): Promise<Messages> {
  const en = ((await import(`@/messages/${DEFAULT_LOCALE}.json`)).default) as Messages;
  if (locale === DEFAULT_LOCALE) return en;
  try {
    const loc = ((await import(`@/messages/${locale}.json`)).default) as Messages;
    // Deep-merge: locale overrides English, English fills any missing keys
    return deepMerge(en, loc);
  } catch {
    return en;
  }
}

/**
 * Normalize article messages to always expose top-level `title` and `description`.
 * Handles three formats:
 *   1. Flat:   { title, description, ... }
 *   2. Meta:   { meta: { title, description }, ... }
 *   3. Nested: { articles: { "slug": { title, description, ... } } }
 */
export function normalizeArticleMessages(raw: Messages, slug?: string): Messages {
  // Format 3: { articles: { slug: { ... } } } — unwrap one level
  if (
    slug &&
    Object.keys(raw).length === 1 &&
    raw.articles !== undefined &&
    typeof raw.articles === "object" &&
    raw.articles !== null &&
    slug in (raw.articles as Messages)
  ) {
    return (raw.articles as Messages)[slug] as Messages;
  }

  // Format 2: { meta: { title, description }, ... }
  const { meta, ...rest } = raw as { meta?: { title?: string; description?: string } } & Messages;
  if (!meta) return raw;
  return {
    ...rest,
    meta,
    ...(meta.title !== undefined && !rest.title ? { title: meta.title } : {}),
    ...(meta.description !== undefined && !rest.description ? { description: meta.description } : {}),
  };
}

/**
 * Load messages for a single article (slug + locale) with English fallback.
 * Used by the article page instead of loading all articles at once.
 */
export async function loadArticleContent(slug: string, locale: string): Promise<Messages> {
  let base: Messages = {};
  try {
    const enMod = await import(`@/articles/${slug}/messages/${DEFAULT_LOCALE}.json`);
    base = normalizeArticleMessages(enMod.default as Messages, slug);
  } catch { /* no en.json */ }

  if (locale === DEFAULT_LOCALE) return base;
  try {
    const mod = await import(`@/articles/${slug}/messages/${locale}.json`);
    const localized = normalizeArticleMessages(mod.default as Messages, slug);
    return { ...base, ...localized };
  } catch {
    return base;
  }
}

/**
 * Synchronously load card-level metadata (title + description) for an article.
 * Uses English as fallback if the locale file is missing. Safe to call during SSG.
 */
export function loadArticleCardMeta(
  slug: string,
  locale: string,
): { title: string; description: string } {
  const cwd = process.cwd();
  for (const l of [locale, DEFAULT_LOCALE]) {
    try {
      const filePath = path.join(cwd, "src", "articles", slug, "messages", `${l}.json`);
      const raw = JSON.parse(fs.readFileSync(filePath, "utf-8")) as Messages;
      const msg = normalizeArticleMessages(raw, slug);
      const title = msg.title as string | undefined;
      if (title) {
        return { title, description: (msg.description as string | undefined) ?? "" };
      }
    } catch { /* try next locale */ }
  }
  return { title: slug, description: "" };
}

/** Collect every string value in a messages tree (used for the body-translation check). */
function collectStrings(node: unknown, out: string[]): void {
  if (typeof node === "string") {
    out.push(node);
  } else if (Array.isArray(node)) {
    for (const v of node) collectStrings(v, out);
  } else if (node && typeof node === "object") {
    for (const v of Object.values(node as Messages)) collectStrings(v, out);
  }
}

function readArticleMessages(slug: string, locale: string): Messages | null {
  try {
    const filePath = path.join(process.cwd(), "src", "articles", slug, "messages", `${locale}.json`);
    return normalizeArticleMessages(JSON.parse(fs.readFileSync(filePath, "utf-8")) as Messages, slug);
  } catch {
    return null;
  }
}

/** sitemap は article×locale で1万回以上呼ぶのでメモ化する。 */
const translatedCache = new Map<string, boolean>();

/** 記事本文そのものを構成するキー。欠けると「中身の無いページ」になるので stub 送りにする。
 *
 *  ★ここに入れてよいのは「欠けるとページが成立しないキー」だけ。
 *  page.tsx は msg(=そのロケールのファイル)しか読まないので en へのフォールバックは無く、
 *  products が欠ければ商品カードが0枚、sections が欠ければ本文が空になる = stub が正しい。
 *
 *  ★2026-08-17: 逆に `recommendedFor` をここに入れていたのが事故だった。
 *  これは en に後から追加された任意の推奨ブロックで、ArticleBody.tsx が
 *  `content.recommendedFor && length > 0` で条件描画している = 欠けても英語は漏れず
 *  ブロックが1つ省略されるだけ。にもかかわらず「本文キー」扱いしていたため、
 *  本文が完訳済みの記事まで /en/ へ meta-refresh するだけの stub に落ちていた
 *  (de/it/es/fr の実流入 212 engaged のうち 72 = 34% が stub 着地。該当250ファイル)。
 *  → 新しいキーを en に足すときは、ここに足す前に「欠けたらページが壊れるか」を見る。 */
const BODY_KEYS = ["sections", "products", "faqs"] as const;

/**
 * Returns true if the article body is actually translated for the given locale.
 *
 * 以前はタイトルの有無しか見ておらず（`return !!msg.title`）、タイトルだけ翻訳されて
 * 本文が英語のままのページを「翻訳済み」と判定していた。その結果、英語本文が
 * 各ロケールURLで self-canonical + index + sitemap 掲載され、重複コンテンツに
 * なっていた（2026-08-01 の全数調査で本文が en と同一のファイルが612件、
 * うち index 対象で実際に露出していたのが ko 5 + ru 7 の12ページ）。
 *
 * 判定: 40文字以上の英語側の文字列のうち、ロケール側に「そのままの文字列」として
 * 残っているものが半数以上なら未翻訳とみなす。固有名詞や短い語は言語をまたいで
 * 一致しうるので、長い文字列だけを対象にする。
 */
export function isArticleBodyTranslated(slug: string, locale: string): boolean {
  if (locale === DEFAULT_LOCALE) return true;
  const cacheKey = `${slug}|${locale}`;
  const cached = translatedCache.get(cacheKey);
  if (cached !== undefined) return cached;

  const compute = (): boolean => {
    const msg = readArticleMessages(slug, locale);
    if (!msg?.title) return false;

    const en = readArticleMessages(slug, DEFAULT_LOCALE);
    if (!en) return true; // 比較対象が無ければ従来どおりタイトル有無で判定

    // 本文キーがロケール側に「存在しない」場合、描画時に loadArticleContent の
    // `{ ...base, ...localized }` で en の本文がそのまま配信される。ロケールファイルには
    // 英語の文字列が1つも無いので下の同一文字列チェックは 0/N ですり抜けるが、
    // 実際にユーザーと検索エンジンが見るのは英語本文。よって未翻訳として扱う。
    // （2026-08-12 の全数調査で 3,059 ファイルがこの形、うち 1,494 ページが
    //  index + self-canonical で英語本文を配信していた）
    const missingBody = BODY_KEYS.some((k) => en[k] !== undefined && msg[k] === undefined);
    if (missingBody) return false;

    const enStrings: string[] = [];
    collectStrings(en, enStrings);
    const enLong = enStrings.filter((s) => s.length >= 40);
    if (enLong.length === 0) return true;

    const localized: string[] = [];
    collectStrings(msg, localized);
    const localizedSet = new Set(localized);
    const identical = enLong.filter((s) => localizedSet.has(s)).length;
    return identical / enLong.length < 0.5;
  };

  const result = compute();
  translatedCache.set(cacheKey, result);
  return result;
}

/**
 * Global messages: UI strings only. Article content is loaded per-page via loadArticleContent().
 * This keeps the RSC payload small (UI strings ~50KB vs all-articles ~8MB).
 */
export async function loadMessages(locale: Locale | string): Promise<Messages> {
  return loadCommon(locale);
}
