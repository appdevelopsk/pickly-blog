import { useLocale, useTranslations } from "next-intl";
import type { ArticleContent, ArticleMeta } from "@/lib/articles/types";
import type { AffiliateOffer } from "@/lib/affiliates/types";
import { AffiliateLink } from "@/components/AffiliateLink";
import { Link } from "@/lib/i18n/navigation";

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating}点`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`text-base leading-none ${i < full ? "text-amber-400" : i === full && half ? "text-amber-300" : "text-slate-200"}`}>
          ★
        </span>
      ))}
      <span className="ml-1 text-sm font-bold text-amber-600">{rating.toFixed(1)}</span>
    </span>
  );
}

interface Props {
  meta: ArticleMeta;
  content: ArticleContent;
  offers: AffiliateOffer[];
}

export function ArticleBody({ meta, content, offers }: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const isComparison = meta.type === "comparison";

  // Build TOC entries for comparison articles
  const tocItems = isComparison
    ? offers.map((o, i) => ({
        id: `offer-${o.id}`,
        label: o.name[locale as keyof typeof o.name] ?? o.name.en ?? o.id,
        rank: i + 1,
      }))
    : [];

  // Section headings for TOC (non-comparison)
  const sectionToc = !isComparison
    ? content.sections.filter((s) => s.heading).map((s, i) => ({
        id: `section-${i}`,
        label: s.heading!,
      }))
    : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-slate-400">
        <Link href="/" className="hover:text-brand-600">Pickly</Link>
        <span>/</span>
        <Link href="/articles" className="hover:text-brand-600">
          {t("nav.articles")}
        </Link>
        <span>/</span>
        <span className="text-slate-600 line-clamp-1">{content.title}</span>
      </nav>

      {/* Article header */}
      <header className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-full bg-brand-50 px-3 py-0.5 text-xs font-semibold text-brand-600 border border-brand-100">
            {getCategoryLabel(t, meta.category)}
          </span>
          <span className="text-xs text-slate-400">{t("article.updatedAt", { date: formatDate(meta.updatedAt) })}</span>
        </div>
        <h1 className="mb-4 text-2xl font-black leading-snug text-slate-900 md:text-3xl">
          {content.title}
        </h1>
        {content.lede && (
          <p className="text-base leading-relaxed text-slate-600 border-l-4 border-brand-400 pl-4 bg-slate-50 py-3 pr-4 rounded-r-lg">
            {content.lede}
          </p>
        )}
      </header>

      <div className="lg:flex lg:gap-10">
        {/* Main content */}
        <div className="min-w-0 flex-1">

          {/* Comparison table */}
          {isComparison && offers.length > 0 && (
            <div className="mb-8 overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left">製品</th>
                    {offers.some(o => o.rating) && <th className="px-4 py-3 text-center">評価</th>}
                    {offers.some(o => o.price) && <th className="px-4 py-3 text-right">価格</th>}
                    <th className="px-4 py-3 text-center">リンク</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {offers.map((o, i) => {
                    const name = o.name[locale as keyof typeof o.name] ?? o.name.en ?? o.id;
                    const product = content.products?.find((p) => p.offerId === o.id);
                    return (
                      <tr key={o.id} className={i === 0 ? "bg-brand-50/40" : "bg-white"}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                              {i + 1}
                            </span>
                            <a href={`#offer-${o.id}`} className="font-medium text-slate-800 hover:text-brand-600 line-clamp-1">
                              {name}
                            </a>
                            {product?.badge && (
                              <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                                {product.badge}
                              </span>
                            )}
                          </div>
                        </td>
                        {offers.some(o2 => o2.rating) && (
                          <td className="px-4 py-3 text-center">
                            {o.rating ? <StarRating rating={o.rating} /> : <span className="text-slate-300">—</span>}
                          </td>
                        )}
                        {offers.some(o2 => o2.price) && (
                          <td className="px-4 py-3 text-right font-medium text-slate-700">
                            {o.price ?? "—"}
                          </td>
                        )}
                        <td className="px-4 py-3 text-center">
                          <AffiliateLink offer={o} variant="button" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TOC box */}
          {(tocItems.length > 0 || sectionToc.length > 0) && (
            <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                {isComparison ? t("article.rankingHeading") : "目次"}
              </p>
              <ol className="space-y-2">
                {(isComparison ? tocItems : sectionToc).map((item, i) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="flex items-center gap-2.5 text-sm text-slate-700 hover:text-brand-600 transition-colors"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                        {i + 1}
                      </span>
                      <span className="line-clamp-1">{"label" in item ? item.label : ""}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Comparison: product sections */}
          {isComparison && offers.map((o, i) => {
            const product = content.products?.find((p) => p.offerId === o.id);
            const name = o.name[locale as keyof typeof o.name] ?? o.name.en ?? o.id;
            return (
              <section
                key={o.id}
                id={`offer-${o.id}`}
                className="mb-10 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                {/* Rank badge + name */}
                <div className="mb-4 flex items-start gap-4">
                  {o.imageUrl && (
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={o.imageUrl}
                        alt={name}
                        className="h-full w-full object-contain p-1.5"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-3xl font-black text-brand-600 leading-none">#{i + 1}</span>
                      {product?.badge && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                          {product.badge}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mb-1">{name}</h2>
                    <div className="flex flex-wrap items-center gap-3">
                      {o.rating && <StarRating rating={o.rating} />}
                      {o.price && <span className="text-sm font-bold text-slate-700">{o.price}</span>}
                    </div>
                  </div>
                </div>

                {/* Review */}
                {product?.review && (
                  <p className="mb-4 text-[15px] leading-relaxed text-slate-700">{product.review}</p>
                )}

                {/* Pros / Cons */}
                {(product?.pros?.length || product?.cons?.length) && (
                  <div className="mb-5 grid gap-3 sm:grid-cols-2">
                    {product?.pros && product.pros.length > 0 && (
                      <div className="rounded-lg bg-green-50 border border-green-100 p-3">
                        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-green-700">
                          {t("article.pros")}
                        </p>
                        <ul className="space-y-1.5">
                          {product.pros.map((pro, k) => (
                            <li key={k} className="flex items-start gap-1.5 text-sm text-slate-700">
                              <span className="mt-0.5 shrink-0 text-green-500 font-bold">✓</span>
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {product?.cons && product.cons.length > 0 && (
                      <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                          {t("article.cons")}
                        </p>
                        <ul className="space-y-1.5">
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

                <AffiliateLink offer={o} variant="button" />
              </section>
            );
          })}

          {/* Sections (buying guide etc.) */}
          {content.sections.map((s, i) => (
            <section key={i} id={`section-${i}`} className="mb-8 scroll-mt-24">
              {s.heading && (
                <h2 className="mb-4 text-xl font-bold text-slate-900 border-b-2 border-brand-500 pb-2 inline-block">
                  {s.heading}
                </h2>
              )}
              {s.paragraphs.map((p, j) => (
                <p key={j} className="mb-3 text-[15px] leading-loose text-slate-700">
                  {p}
                </p>
              ))}
              {s.subsections && s.subsections.length > 0 && (
                <div className="mt-4 space-y-3">
                  {s.subsections.map((sub, j) => (
                    <div key={j} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <dt className="mb-1 font-bold text-slate-900">{sub.heading}</dt>
                      {sub.paragraphs.map((p, k) => (
                        <dd key={k} className="text-[14px] leading-relaxed text-slate-600">
                          {p}
                        </dd>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}

          {/* Non-comparison: offers grid */}
          {!isComparison && offers.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-4 text-xl font-bold text-slate-900 border-b-2 border-brand-500 pb-2 inline-block">
                {t("article.offersHeading")}
              </h2>
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
            <section className="mb-8" id="faq">
              <h2 className="mb-5 text-xl font-bold text-slate-900 border-b-2 border-brand-500 pb-2 inline-block">
                {t("article.faqHeading")}
              </h2>
              <div className="space-y-3">
                {content.faqs.map((f, i) => (
                  <details key={i} className="group rounded-xl border border-slate-200 bg-white">
                    <summary className="flex cursor-pointer items-center justify-between p-4 font-semibold text-slate-900 marker:hidden list-none">
                      <span>{f.q}</span>
                      <span className="ml-4 shrink-0 text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <div className="border-t border-slate-100 px-4 pb-4 pt-3 text-[14px] leading-relaxed text-slate-600">
                      {f.a}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Disclosure note */}
          <div className="mt-8 rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-slate-400">
            {t("offer.disclosureBadge")} — {t("offer.disclosureNote")}
            <Link href="/disclosure" className="ml-1 underline hover:text-brand-600">
              {t("nav.disclosure")}
            </Link>
          </div>
        </div>

        {/* Sidebar (desktop only) */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-28 space-y-6">
            {/* TOC sidebar */}
            {tocItems.length > 1 && (
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                  {t("article.rankingHeading")}
                </p>
                <ol className="space-y-2">
                  {tocItems.map((item, i) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="flex items-center gap-2 text-xs text-slate-600 hover:text-brand-600 transition-colors"
                      >
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[9px] font-bold text-white">
                          {i + 1}
                        </span>
                        <span className="line-clamp-2">{item.label}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Back to articles */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <Link
                href="/articles"
                className="flex items-center gap-2 text-sm font-medium text-brand-600 hover:underline"
              >
                ← {t("nav.articles")}
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function getCategoryLabel(
  t: ReturnType<typeof useTranslations>,
  category: string
): string {
  try { return t(`category.${category}`); } catch { return category; }
}

function formatDate(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}
