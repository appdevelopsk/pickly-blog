import { useLocale, useTranslations } from "next-intl";
import type { ArticleContent, ArticleMeta, ArticleCategory } from "@/lib/articles/types";
import type { AffiliateOffer } from "@/lib/affiliates/types";
import { AffiliateLink } from "@/components/AffiliateLink";

interface Props {
  meta: ArticleMeta;
  content: ArticleContent;
  offers: AffiliateOffer[];
}

export function ArticleBody({ meta, content, offers }: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const isComparison = meta.type === "comparison";

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-8">
        <h1 className="mb-3 text-3xl font-bold leading-tight md:text-4xl">
          {content.title}
        </h1>
        {content.lede && (
          <p className="text-lg leading-relaxed text-slate-600">{content.lede}</p>
        )}
        <p className="mt-3 text-xs text-slate-400">
          {t("article.updatedAt", { date: formatDate(meta.updatedAt) })}
        </p>
      </header>

      {/* Comparison: quick picks index */}
      {isComparison && offers.length > 0 && (
        <section className="mb-10 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
            {t("article.rankingHeading")}
          </h2>
          <ol className="space-y-2">
            {offers.map((o, i) => {
              const product = content.products?.find((p) => p.offerId === o.id);
              const name = o.name[locale as keyof typeof o.name] ?? o.name.en ?? o.id;
              return (
                <li key={o.id} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <a
                    href={`#offer-${o.id}`}
                    className="flex-1 text-sm font-medium text-slate-800 hover:text-brand-600"
                  >
                    {name}
                  </a>
                  {product?.badge && (
                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                      {product.badge}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {/* Comparison: detailed product sections */}
      {isComparison &&
        offers.map((o, i) => {
          const product = content.products?.find((p) => p.offerId === o.id);
          const name = o.name[locale as keyof typeof o.name] ?? o.name.en ?? o.id;
          return (
            <section
              key={o.id}
              id={`offer-${o.id}`}
              className="mb-10 scroll-mt-20 border-b border-slate-100 pb-10 last:border-0"
            >
              {/* Image + title row */}
              <div className="mb-4 flex gap-4">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                  {o.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={o.imageUrl}
                      alt={name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <CategoryPlaceholder category={meta.category} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex flex-wrap items-baseline gap-2">
                    <span className="text-xl font-black text-brand-600 leading-none">#{i + 1}</span>
                    <h2 className="text-lg font-bold text-slate-900 leading-snug">{name}</h2>
                  </div>
                  {product?.badge && (
                    <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                      {product.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Review text */}
              {product?.review && (
                <p className="mb-4 leading-relaxed text-slate-700">{product.review}</p>
              )}

              {/* Pros / Cons */}
              {(product?.pros?.length || product?.cons?.length) && (
                <div className="mb-5 grid gap-3 sm:grid-cols-2">
                  {product?.pros && product.pros.length > 0 && (
                    <div className="rounded-lg bg-green-50 p-3">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-green-700">
                        {t("article.pros")}
                      </p>
                      <ul className="space-y-1">
                        {product.pros.map((pro, k) => (
                          <li key={k} className="flex items-start gap-1.5 text-sm text-slate-700">
                            <span className="mt-0.5 shrink-0 font-bold text-green-500">✓</span>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {product?.cons && product.cons.length > 0 && (
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                        {t("article.cons")}
                      </p>
                      <ul className="space-y-1">
                        {product.cons.map((con, k) => (
                          <li key={k} className="flex items-start gap-1.5 text-sm text-slate-500">
                            <span className="mt-0.5 shrink-0 text-slate-400">✗</span>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <AffiliateLink offer={o} hideBadge />
            </section>
          );
        })}

      {/* Generic sections (buying guide, etc.) */}
      {content.sections.map((s, i) => (
        <section key={i} className="mb-8">
          {s.heading && (
            <h2 className="mb-4 border-b border-slate-200 pb-2 text-2xl font-bold text-slate-900">
              {s.heading}
            </h2>
          )}
          {s.paragraphs.map((p, j) => (
            <p key={j} className="mb-3 leading-relaxed text-slate-700">
              {p}
            </p>
          ))}
          {s.subsections && s.subsections.length > 0 && (
            <dl className="mt-4 space-y-3">
              {s.subsections.map((sub, j) => (
                <div key={j} className="rounded-lg border border-slate-200 p-4">
                  <dt className="mb-1 font-bold text-slate-900">{sub.heading}</dt>
                  {sub.paragraphs.map((p, k) => (
                    <dd key={k} className="text-sm leading-relaxed text-slate-600">
                      {p}
                    </dd>
                  ))}
                </div>
              ))}
            </dl>
          )}
        </section>
      ))}

      {/* Review / guide: offers at bottom */}
      {!isComparison && offers.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-bold">{t("article.offersHeading")}</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {offers.map((o) => (
              <li key={o.id}>
                <AffiliateLink offer={o} note={content.offerNotes?.[o.id]} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* FAQ */}
      {content.faqs.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 border-b border-slate-200 pb-2 text-2xl font-bold">
            {t("article.faqHeading")}
          </h2>
          <dl className="space-y-3">
            {content.faqs.map((f, i) => (
              <div key={i} className="rounded-lg border border-slate-200 p-4">
                <dt className="mb-1 font-semibold text-slate-900">{f.q}</dt>
                <dd className="text-sm leading-relaxed text-slate-600">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </article>
  );
}

function CategoryPlaceholder({ category }: { category: ArticleCategory }) {
  const map: Record<ArticleCategory, { emoji: string; from: string; to: string }> = {
    fitness:  { emoji: "💪", from: "#dbeafe", to: "#bfdbfe" },
    food:     { emoji: "🍽️", from: "#dcfce7", to: "#bbf7d0" },
    tech:     { emoji: "💻", from: "#ede9fe", to: "#ddd6fe" },
    home:     { emoji: "🏠", from: "#fef9c3", to: "#fef08a" },
    beauty:   { emoji: "✨", from: "#fce7f3", to: "#fbcfe8" },
    fashion:  { emoji: "👗", from: "#ffedd5", to: "#fed7aa" },
    finance:  { emoji: "💰", from: "#d1fae5", to: "#a7f3d0" },
    travel:   { emoji: "✈️", from: "#e0f2fe", to: "#bae6fd" },
    parenting:{ emoji: "👶", from: "#fef3c7", to: "#fde68a" },
    pets:     { emoji: "🐾", from: "#f3e8ff", to: "#e9d5ff" },
  };
  const { emoji, from, to } = map[category] ?? { emoji: "📦", from: "#f1f5f9", to: "#e2e8f0" };
  return (
    <div
      className="flex h-full w-full items-center justify-center text-3xl"
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {emoji}
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}
