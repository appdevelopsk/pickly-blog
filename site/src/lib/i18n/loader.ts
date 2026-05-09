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
 * Supports both the legacy flat structure ({ title, description, ... })
 * and the newer nested structure ({ meta: { title, description }, ... }).
 */
function normalizeArticleMessages(raw: Messages): Messages {
  const { meta, ...rest } = raw as { meta?: { title?: string; description?: string } } & Messages;
  if (!meta) return raw;
  return {
    ...rest,
    meta,
    // Promote meta.title / meta.description to top level so existing t() calls work.
    ...(meta.title !== undefined && !rest.title ? { title: meta.title } : {}),
    ...(meta.description !== undefined && !rest.description ? { description: meta.description } : {}),
  };
}

async function loadArticleMessages(locale: string): Promise<Messages> {
  const articles = listArticles();
  const out: Messages = {};
  for (const a of articles) {
    try {
      const mod = await import(`@/articles/${a.slug}/messages/${locale}.json`);
      out[a.slug] = normalizeArticleMessages(mod.default as Messages);
    } catch {
      try {
        const fallback = await import(`@/articles/${a.slug}/messages/${DEFAULT_LOCALE}.json`);
        out[a.slug] = normalizeArticleMessages(fallback.default as Messages);
      } catch {
        out[a.slug] = {};
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
