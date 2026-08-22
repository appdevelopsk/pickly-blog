import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { getRelatedArticles } from "@/lib/articles/registry";
import { loadArticleCardMeta } from "@/lib/i18n/loader";
import { CategoryPlaceholder } from "@/components/CategoryPlaceholder";
import { ArticleCardImage } from "@/components/ArticleCardImage";
import { getThumbnail } from "./related-data";

interface Props {
  slug: string;
  category: string;
  locale: string;
  /**
   * 本文中インライン導線で既に出したスラッグ。ここで除外しないと
   * インライン3件と末尾グリッドが同じ集合になり、1記事から辿れる
   * ユニーク導線が4本しか無くなる（2026-08-22 に発見・pv/session 1.09 の直接原因）。
   */
  exclude?: string[];
  limit?: number;
}

export async function RelatedArticles({ slug, category, locale, exclude = [], limit = 6 }: Props) {
  const articles = getRelatedArticles(slug, category, locale, limit, exclude);
  if (articles.length === 0) return null;

  const t = await getTranslations();

  let heading = "Related articles";
  try { heading = t("article.related"); } catch { /* missing key */ }

  return (
    <section className="mt-16 border-t border-slate-200 pt-10">
      <h2 className="mb-6 text-xl font-black text-slate-900">{heading}</h2>
      <ul className="grid gap-4 grid-cols-2 sm:grid-cols-3">
        {articles.map((a) => {
          const { title } = loadArticleCardMeta(a.slug, locale);
          const imgSrc = getThumbnail(a, locale);
          const isProductImg = imgSrc && !imgSrc.includes("/og/");

          return (
            <li key={a.slug}>
              <Link
                href={`/articles/${a.slug}`}
                data-related="grid"
                className="group flex flex-col rounded-xl border border-slate-200 overflow-hidden bg-white hover:border-brand-300 hover:shadow-md transition-all duration-200"
              >
                <div
                  className="relative overflow-hidden bg-slate-50"
                  style={{ aspectRatio: isProductImg ? "1/1" : "4/3" }}
                >
                  <ArticleCardImage
                    src={imgSrc}
                    alt={title}
                    className={`w-full h-full transition-transform duration-300 group-hover:scale-105 ${isProductImg ? "object-contain p-3" : "object-cover"}`}
                  >
                    <CategoryPlaceholder category={a.category} title={title} />
                  </ArticleCardImage>
                </div>
                <div className="p-3">
                  <p className="text-xs font-bold leading-snug text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-3">
                    {title}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
