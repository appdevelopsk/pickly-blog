import type { Locale } from "./locales";
import { DEFAULT_LOCALE } from "./locales";
import fs from "fs";
import path from "path";

type Messages = Record<string, unknown>;

async function loadCommon(locale: string): Promise<Messages> {
  try {
    return (await import(`@/messages/${locale}.json`)).default;
  } catch {
    return (await import(`@/messages/${DEFAULT_LOCALE}.json`)).default;
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

/**
 * Returns true if the article has a translated title for the given locale.
 * Used by sitemap.ts to exclude untranslated pages from the sitemap.
 */
export function isArticleBodyTranslated(slug: string, locale: string): boolean {
  if (locale === DEFAULT_LOCALE) return true;
  try {
    const filePath = path.join(
      process.cwd(),
      "src",
      "articles",
      slug,
      "messages",
      `${locale}.json`,
    );
    const raw = JSON.parse(fs.readFileSync(filePath, "utf-8")) as Messages;
    const msg = normalizeArticleMessages(raw, slug);
    return !!(msg.title as string | undefined);
  } catch {
    return false;
  }
}

/**
 * Global messages: UI strings only. Article content is loaded per-page via loadArticleContent().
 * This keeps the RSC payload small (UI strings ~50KB vs all-articles ~8MB).
 */
export async function loadMessages(locale: Locale | string): Promise<Messages> {
  return loadCommon(locale);
}
