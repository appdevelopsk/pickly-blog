import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { getRelatedArticles } from "@/lib/articles/registry";
import { CATALOG } from "@/lib/affiliates/catalog";
import { getOfferImageUrl } from "@/lib/affiliates/images";
import { CategoryPlaceholder } from "@/components/CategoryPlaceholder";
import type { ArticleMeta } from "@/lib/articles/types";

function getThumbnail(article: ArticleMeta): string | null {
  for (const offerId of article.offerIds) {
    const offer = CATALOG.find((o) => o.id === offerId);
    if (!offer) continue;
    const img = getOfferImageUrl(offer);
    if (img) return img;
  }
  return null;
}

interface Props {
  slug: string;
  category: string;
  locale: string;
}

export async function RelatedArticles({ slug, category, locale }: Props) {
  const articles = getRelatedArticles(slug, category, locale);
  if (articles.length === 0) return null;

  const t = await getTranslations();

  let heading = "Related articles";
  try { heading = t("article.related"); } catch { /* missing key */ }

  return (
    <section className="mt-16 border-t border-slate-200 pt-10">
      <h2 className="mb-6 text-xl font-black text-slate-900">{heading}</h2>
      <ul className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        {articles.map((a) => {
          let title = a.slug;
          try { title = t(`articles.${a.slug}.title`); } catch { /* missing */ }
          const imgSrc = getThumbnail(a);
          const isProductImg = !!imgSrc;

          return (
            <li key={a.slug}>
              <Link
                href={`/articles/${a.slug}`}
                className="group flex flex-col rounded-xl border border-slate-200 overflow-hidden bg-white hover:border-brand-300 hover:shadow-md transition-all duration-200"
              >
                <div
                  className="relative overflow-hidden bg-slate-50"
                  style={{ aspectRatio: isProductImg ? "1/1" : "4/3" }}
                >
                  {imgSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imgSrc}
                      alt={title}
                      className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <CategoryPlaceholder category={a.category} title={title} />
                  )}
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
