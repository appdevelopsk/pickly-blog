import { Link } from "@/lib/i18n/navigation";
import { COMPARISONS } from "@/lib/pages/compare-config";
import { TAGS } from "@/lib/pages/tag-config";
import { SALE_EVENTS } from "@/lib/pages/sale-config";
import type { ArticleCategory } from "@/lib/articles/types";

interface Props {
  slug: string;
  category: ArticleCategory;
}

export function ArticleCrossLinks({ slug, category }: Props) {
  // Find a comparison that involves this article
  const relatedCompare = COMPARISONS.find(
    (c) => c.slugA === slug || c.slugB === slug
  );

  // Find tags that cover this article's category
  const relatedTags = TAGS.filter((t) => t.categories.includes(category)).slice(0, 3);

  // Find sale events that cover this category
  const relatedSale = SALE_EVENTS.find((e) => e.categories.includes(category));

  const hasAnything = relatedCompare || relatedTags.length > 0 || relatedSale;
  if (!hasAnything) return null;

  return (
    <div className="mt-10 space-y-3">
      {/* Compare banner */}
      {relatedCompare && (
        <Link
          href={`/compare/${relatedCompare.slug}`}
          className="group flex items-center gap-4 rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-4 transition-all hover:border-indigo-400 hover:shadow-md"
        >
          <span className="shrink-0 text-2xl" aria-hidden>⚖️</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-wide mb-0.5">Head-to-head</p>
            <p className="text-sm font-black text-slate-900 group-hover:text-indigo-700 transition-colors truncate">
              {relatedCompare.title}
            </p>
          </div>
          <span className="shrink-0 text-xs font-bold text-indigo-600 group-hover:underline">Compare →</span>
        </Link>
      )}

      {/* Tags row */}
      {relatedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {relatedTags.map((tag) => (
            <Link
              key={tag.slug}
              href={`/tag/${tag.slug}`}
              className="flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1.5 text-xs font-bold text-teal-700 hover:border-teal-400 hover:bg-teal-100 transition-colors"
            >
              {tag.icon} {tag.label}
            </Link>
          ))}
          <Link
            href="/tags"
            className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-colors"
          >
            More tags →
          </Link>
        </div>
      )}

      {/* Sale event banner */}
      {relatedSale && (
        <Link
          href={`/sale/${relatedSale.slug}`}
          className="group flex items-center gap-4 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 transition-all hover:border-orange-400 hover:shadow-md"
        >
          <span className="shrink-0 text-2xl" aria-hidden>{relatedSale.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-wide mb-0.5">Sale guide</p>
            <p className="text-sm font-black text-slate-900 group-hover:text-orange-700 transition-colors truncate">
              {relatedSale.title}
            </p>
          </div>
          <span className="shrink-0 text-xs font-bold text-orange-600 group-hover:underline">See deals →</span>
        </Link>
      )}
    </div>
  );
}
