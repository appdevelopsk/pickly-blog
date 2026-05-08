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

async function loadArticleMessages(locale: string): Promise<Messages> {
  const articles = listArticles();
  const out: Messages = {};
  for (const a of articles) {
    try {
      const mod = await import(`@/articles/${a.slug}/messages/${locale}.json`);
      out[a.slug] = mod.default;
    } catch {
      try {
        const fallback = await import(`@/articles/${a.slug}/messages/${DEFAULT_LOCALE}.json`);
        out[a.slug] = fallback.default;
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
