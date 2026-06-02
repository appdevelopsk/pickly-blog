import fs from "node:fs";
import path from "node:path";
import type { Locale } from "./locales";
import { DEFAULT_LOCALE } from "./locales";

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
 * Global messages: UI strings only. Article content is loaded per-page via loadArticleContent().
 * This keeps the RSC payload small (UI strings ~50KB vs all-articles ~8MB).
 */
export async function loadMessages(locale: Locale | string): Promise<Messages> {
  return loadCommon(locale);
}

const ARTICLES_ROOT = path.join(process.cwd(), "src/articles");

function readCardFields(slug: string, locale: string): { title?: string; description?: string } {
  const file = path.join(ARTICLES_ROOT, slug, "messages", `${locale}.json`);
  if (!fs.existsSync(file)) return {};
  try {
    const norm = normalizeArticleMessages(JSON.parse(fs.readFileSync(file, "utf8")) as Messages, slug);
    return {
      title: typeof norm.title === "string" ? norm.title : undefined,
      description: typeof norm.description === "string" ? norm.description : undefined,
    };
  } catch {
    return {};
  }
}

/**
 * Build-time, synchronous lookup of just an article's localized title + description
 * for listing cards (article index, homepage grid, related articles).
 *
 * Reads the per-article message JSON directly with `fs` and discards everything
 * except title/description — so it never accumulates full article bodies in the
 * module cache (the all-articles-in-memory path is what caused the ~67GB build).
 * Falls back: requested locale → English → de-slugified slug.
 *
 * Do NOT derive these from the global `t('articles.<slug>.title')`: the global
 * catalog carries UI strings only, so that lookup misses and next-intl's
 * getMessageFallback returns the literal last key segment ("title"/"description").
 */
export function loadArticleCardMeta(slug: string, locale: string): { title: string; description: string } {
  const en = readCardFields(slug, DEFAULT_LOCALE);
  const loc = locale === DEFAULT_LOCALE ? {} : readCardFields(slug, locale);
  return {
    title: loc.title ?? en.title ?? slug.replace(/-/g, " "),
    description: loc.description ?? en.description ?? "",
  };
}
