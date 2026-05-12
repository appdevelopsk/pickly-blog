import type { Locale } from "./locales";
import { DEFAULT_LOCALE } from "./locales";
import { listArticles } from "@/lib/articles/registry";

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
function normalizeArticleMessages(raw: Messages, slug?: string): Messages {
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

async function loadArticleMessages(locale: string): Promise<Messages> {
  const articles = listArticles();
  const out: Messages = {};
  for (const a of articles) {
    // Always load English as base so no key is ever missing
    let base: Messages = {};
    try {
      const enMod = await import(`@/articles/${a.slug}/messages/${DEFAULT_LOCALE}.json`);
      base = normalizeArticleMessages(enMod.default as Messages, a.slug);
    } catch { /* no en.json, skip */ }

    if (locale === DEFAULT_LOCALE) {
      out[a.slug] = base;
    } else {
      try {
        const mod = await import(`@/articles/${a.slug}/messages/${locale}.json`);
        const localized = normalizeArticleMessages(mod.default as Messages, a.slug);
        // Locale keys override English base; missing keys fall back to English
        out[a.slug] = { ...base, ...localized };
      } catch {
        out[a.slug] = base;
      }
    }
  }
  return out;
}

export async function loadMessages(locale: Locale | string): Promise<Messages> {
  const [common, articles] = await Promise.all([
    loadCommon(locale),
    loadArticleMessages(locale),
  ]);
  return { ...common, articles };
}
