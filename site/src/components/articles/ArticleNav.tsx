import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { loadArticleCardMeta } from "@/lib/i18n/loader";
import type { ArticleMeta } from "@/lib/articles/types";

interface Props {
  prev: ArticleMeta | null;
  next: ArticleMeta | null;
  locale: string;
}

/**
 * 記事末の前後ナビ。関連記事グリッドとは別軸（同カテゴリの時系列）の導線で、
 * 「読み終えたら行き先が無い」状態を潰すために追加（2026-08-22）。
 */
export async function ArticleNav({ prev, next, locale }: Props) {
  if (!prev && !next) return null;

  const t = await getTranslations();
  const tt = (key: string, fallback: string) => {
    try {
      return t(key);
    } catch {
      return fallback;
    }
  };

  const prevLabel = tt("article.prev", "Previous article");
  const nextLabel = tt("article.next", "Next article");

  return (
    <nav className="mt-12 grid gap-3 sm:grid-cols-2" aria-label={tt("article.nav", "Article navigation")}>
      {prev && (
        <Link
          href={`/articles/${prev.slug}`}
          data-related="nav-prev"
          className="group flex flex-col rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-brand-300 hover:shadow-md"
        >
          <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
            ← {prevLabel}
          </span>
          <span className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-brand-600">
            {loadArticleCardMeta(prev.slug, locale).title}
          </span>
        </Link>
      )}
      {next && (
        <Link
          href={`/articles/${next.slug}`}
          data-related="nav-next"
          className="group flex flex-col rounded-xl border border-slate-200 bg-white p-4 text-right transition-all duration-200 hover:border-brand-300 hover:shadow-md sm:col-start-2"
        >
          <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
            {nextLabel} →
          </span>
          <span className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-brand-600">
            {loadArticleCardMeta(next.slug, locale).title}
          </span>
        </Link>
      )}
    </nav>
  );
}
