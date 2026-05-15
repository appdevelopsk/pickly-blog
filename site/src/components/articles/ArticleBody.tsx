import { useLocale, useTranslations } from "next-intl";
import type { ArticleContent, ArticleMeta } from "@/lib/articles/types";
import type { AffiliateOffer } from "@/lib/affiliates/types";
import { AffiliateLink } from "@/components/AffiliateLink";
import { Link } from "@/lib/i18n/navigation";
import { getOfferImageUrl } from "@/lib/affiliates/images";
import { inferMarketFromLocale } from "@/lib/i18n/locales";
import { PRICES } from "@/lib/affiliates/prices-override";

function resolvePrice(o: AffiliateOffer, locale: string): string | null {
  const market = inferMarketFromLocale(locale);
  // 1. Market-specific override (auto-fetched daily)
  const override = PRICES[o.id]?.[market];
  if (override) return override;
  // 2. Catalog price field — hide when currency doesn't match market
  const price = o.priceMin && o.priceMax ? `${o.priceMin}〜${o.priceMax}` : (o.price ?? null);
  if (!price) return null;
  if (price.includes("$") && market !== "US" && market !== "CA") return null;
  if ((price.includes("¥") || price.includes("円")) && market !== "JP") return null;
  if (price.includes("£") && market !== "UK") return null;
  if (price.includes("€") && !["EU", "FR", "ES", "IT"].includes(market)) return null;
  return price;
}

function StarRating({ rating, label, size = "md" }: { rating: number; label?: string; size?: "sm" | "md" }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={label ?? String(rating)}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`leading-none ${size === "sm" ? "text-sm" : "text-base"} ${i < full ? "text-amber-400" : i === full && half ? "text-amber-300" : "text-slate-200"}`}>
          ★
        </span>
      ))}
      <span className={`ml-1 font-bold text-amber-600 ${size === "sm" ? "text-xs" : "text-sm"}`}>{rating.toFixed(1)}</span>
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
        <h1 className="mb-4 text-3xl font-black leading-tight text-slate-900 md:text-4xl">
          {content.title}
        </h1>
        {content.lede && (
          <p className="text-base leading-relaxed text-slate-600 border-l-4 border-brand-400 pl-4 bg-slate-50 py-3 pr-4 rounded-r-lg">
            {content.lede}
          </p>
        )}
        {/* Expert reviewer block */}
        {content.expert && (
          <div className="mt-4 flex items-start gap-3 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
            {content.expert.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={content.expert.imageUrl} alt={content.expert.name} className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-brand-100 shrink-0 flex items-center justify-center text-brand-600 font-black text-sm border border-brand-200">
                {content.expert.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800">{content.expert.name}</p>
              <p className="text-xs text-brand-600 mb-1">{content.expert.title}</p>
              <p className="text-xs leading-relaxed text-slate-600">{content.expert.bio}</p>
            </div>
          </div>
        )}
        {content.methodology && (
          <div className="mt-3 flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3">
            <span className="mt-0.5 shrink-0 text-blue-500 text-lg leading-none">📋</span>
            <p className="text-sm leading-relaxed text-blue-900">{content.methodology}</p>
          </div>
        )}
      </header>

      <div className="lg:flex lg:gap-10">
        {/* Main content */}
        <div className="min-w-0 flex-1">

          {/* Comparison table — only shown when offers have rating or price data */}
          {isComparison && offers.length > 0 && (offers.some(o => o.rating) || offers.some(o => resolvePrice(o, locale))) && (
            <div className="mb-8 overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="min-w-full text-sm">
                <thead className="bg-gradient-to-r from-slate-800 to-slate-700 text-xs font-bold uppercase tracking-wide text-slate-300">
                  <tr>
                    <th className="px-4 py-3 text-left">{t("article.tableProduct")}</th>
                    {offers.some(o => o.rating) && <th className="px-4 py-3 text-center">{t("article.tableRating")}</th>}
                    {offers.some(o => resolvePrice(o, locale)) && <th className="px-4 py-3 text-right">{t("article.tablePrice")}</th>}
                    <th className="px-4 py-3 text-center">{t("article.tableLink")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {offers.map((o, i) => {
                    const name = o.name[locale as keyof typeof o.name] ?? o.name.en ?? o.id;
                    const product = content.products?.find((p) => p.offerId === o.id);
                    return (
                      <tr key={o.id} className={i === 0 ? "bg-amber-50/60" : i % 2 === 0 ? "bg-white" : "bg-slate-50/40"}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white ${i === 0 ? "bg-amber-500" : "bg-brand-600"}`}>
                              {i + 1}
                            </span>
                            {(() => { const img = getOfferImageUrl(o); return img ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={img} alt={name} className="h-8 w-8 shrink-0 rounded object-contain bg-slate-50 border border-slate-100" loading="lazy" />
                            ) : null; })()}
                            <a href={`#offer-${o.id}`} className="font-semibold text-slate-800 hover:text-brand-600 transition-colors line-clamp-1">
                              {name}
                            </a>
                            {product?.grade && (
                              <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-black ${
                                product.grade === "A+" ? "bg-amber-500 text-white" :
                                product.grade === "A"  ? "bg-brand-600 text-white" :
                                "bg-slate-500 text-white"
                              }`}>
                                {product.grade}
                              </span>
                            )}
                            {product?.badge && (
                              <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                                {product.badge}
                              </span>
                            )}
                          </div>
                        </td>
                        {offers.some(o2 => o2.rating) && (
                          <td className="px-4 py-3 text-center">
                            {o.rating ? <StarRating rating={o.rating} label={t("article.ratingLabel", { rating: o.rating.toFixed(1) })} /> : <span className="text-slate-300">—</span>}
                          </td>
                        )}
                        {offers.some(o2 => resolvePrice(o2, locale)) && (
                          <td className="px-4 py-3 text-right font-medium text-slate-700">
                            {resolvePrice(o, locale) ?? "—"}
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

          {/* TOC box — mobile only; desktop uses the sidebar TOC */}
          {(tocItems.length > 0 || sectionToc.length > 0) && (
            <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-5 lg:hidden">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                {isComparison ? t("article.rankingHeading") : t("article.toc")}
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
            const isWinner = i === 0;
            return (
              <section
                key={o.id}
                id={`offer-${o.id}`}
                className={`mb-10 scroll-mt-24 rounded-2xl border p-6 ${
                  isWinner
                    ? "border-amber-300 bg-gradient-to-br from-amber-50 via-white to-white shadow-md shadow-amber-100"
                    : "border-slate-200 bg-white shadow-sm"
                }`}
              >
                {/* Winner crown + grade badge */}
                {(isWinner || product?.grade) && (
                  <div className="mb-3 flex items-center gap-2">
                    {isWinner && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-0.5 text-xs font-black text-amber-900 shadow-sm">
                        ★ Best Pick
                      </span>
                    )}
                    {product?.grade && (
                      <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-sm font-black shadow-sm ${
                        product.grade === "A+" ? "bg-amber-500 text-white" :
                        product.grade === "A"  ? "bg-brand-600 text-white" :
                        "bg-slate-500 text-white"
                      }`}>
                        {product.grade}
                      </span>
                    )}
                  </div>
                )}

                {/* Rank badge + name */}
                <div className="mb-4 flex items-start gap-4">
                  {(() => { const img = getOfferImageUrl(o); return img ? (
                    <div className={`h-24 w-24 shrink-0 overflow-hidden rounded-xl border bg-slate-50 ${isWinner ? "border-amber-200" : "border-slate-100"}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={name} className="h-full w-full object-contain p-2" loading="lazy" />
                    </div>
                  ) : null; })()}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className={`text-4xl font-black leading-none ${isWinner ? "text-amber-500" : "text-brand-600"}`}>
                        #{i + 1}
                      </span>
                      {product?.badge && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                          {product.badge}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mb-2">{name}</h2>
                    <div className="flex flex-wrap items-center gap-3">
                      {o.rating && <StarRating rating={o.rating} label={t("article.ratingLabel", { rating: o.rating.toFixed(1) })} />}
                      {resolvePrice(o, locale) && <span className="text-sm font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">{resolvePrice(o, locale)}</span>}
                    </div>
                  </div>
                </div>

                {/* One-liner tagline from offerNotes */}
                {content.offerNotes?.[o.id] && (
                  <p className="mb-4 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5">
                    {content.offerNotes[o.id]}
                  </p>
                )}

                {/* Review */}
                {product?.review && (
                  <p className="mb-5 text-base leading-relaxed text-slate-700">{product.review}</p>
                )}

                {/* Pros / Cons */}
                {(product?.pros?.length || product?.cons?.length) && (
                  <div className="mb-5 grid gap-3 sm:grid-cols-2">
                    {product?.pros && product.pros.length > 0 && (
                      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                        <p className="mb-2.5 text-xs font-black uppercase tracking-widest text-emerald-700">
                          {t("article.pros")}
                        </p>
                        <ul className="space-y-2">
                          {product.pros.map((pro, k) => (
                            <li key={k} className="flex items-start gap-2 text-sm text-slate-700">
                              <span className="mt-0.5 shrink-0 text-emerald-500 font-black text-base leading-none">✓</span>
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {product?.cons && product.cons.length > 0 && (
                      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                        <p className="mb-2.5 text-xs font-black uppercase tracking-widest text-slate-500">
                          {t("article.cons")}
                        </p>
                        <ul className="space-y-2">
                          {product.cons.map((con, k) => (
                            <li key={k} className="flex items-start gap-2 text-sm text-slate-500">
                              <span className="mt-0.5 shrink-0 text-slate-400 font-black text-base leading-none">✗</span>
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Score breakdown bars */}
                {product?.scores && Object.keys(product.scores).length > 0 && (
                  <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-500">
                      {t("article.scoreBreakdown")}
                    </p>
                    <div className="space-y-2.5">
                      {Object.entries(product.scores).map(([label, score]) => (
                        <div key={label} className="flex items-center gap-3">
                          <span className="w-28 shrink-0 text-xs font-medium text-slate-600 leading-tight">{label}</span>
                          <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-brand-500"
                              style={{ width: `${(score / 5) * 100}%` }}
                            />
                          </div>
                          <span className="w-6 shrink-0 text-xs font-bold text-slate-700 text-right">{score.toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Spec comparison table */}
                {product?.specs && Object.keys(product.specs).length > 0 && (
                  <div className="mb-5 overflow-hidden rounded-xl border border-slate-200">
                    <table className="min-w-full text-sm">
                      <tbody className="divide-y divide-slate-100">
                        {Object.entries(product.specs).map(([key, val]) => (
                          <tr key={key} className="even:bg-slate-50/60">
                            <td className="px-4 py-2 font-medium text-slate-600 w-36 shrink-0">{key}</td>
                            <td className="px-4 py-2 text-slate-800">{val}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <AffiliateLink offer={o} variant="stores" />
              </section>
            );
          })}

          {/* "Recommended For Whom" matrix */}
          {isComparison && content.recommendedFor && content.recommendedFor.length > 0 && (
            <section className="mb-10 scroll-mt-24">
              <h2 className="mb-4 text-xl font-black text-slate-900 flex items-center gap-3 before:block before:h-6 before:w-1 before:rounded-full before:bg-brand-500 before:shrink-0">
                {t("article.recommendedFor")}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {content.recommendedFor.map((item, i) => {
                  const offer = offers.find((o) => o.id === item.offerId);
                  const offerName = offer ? (offer.name[locale as keyof typeof offer.name] ?? offer.name.en ?? item.offerId) : item.offerId;
                  return (
                    <a
                      key={i}
                      href={`#offer-${item.offerId}`}
                      className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-400 hover:shadow-sm transition-all"
                    >
                      <span className="mt-0.5 shrink-0 text-brand-500 text-xl leading-none">✓</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-500 mb-0.5">{item.label}</p>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">{offerName}</p>
                        <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{item.reason}</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </section>
          )}

          {/* Sections (buying guide etc.) */}
          {content.sections.map((s, i) => (
            <section key={i} id={`section-${i}`} className="mb-10 scroll-mt-24">
              {s.heading && (
                <h2 className="mb-4 text-xl font-black text-slate-900 flex items-center gap-3 before:block before:h-6 before:w-1 before:rounded-full before:bg-brand-500 before:shrink-0">
                  {s.heading}
                </h2>
              )}
              {s.paragraphs.map((p, j) => (
                <p key={j} className="mb-4 text-base leading-relaxed text-slate-700">
                  {p}
                </p>
              ))}
              {s.subsections && s.subsections.length > 0 && (
                <div className="mt-5 space-y-3">
                  {s.subsections.map((sub, j) => (
                    <div key={j} className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                      <dt className="mb-1.5 font-bold text-slate-900">{sub.heading}</dt>
                      {sub.paragraphs.map((p, k) => (
                        <dd key={k} className="text-sm leading-relaxed text-slate-600">
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
            <section className="mb-10">
              <h2 className="mb-4 text-xl font-black text-slate-900 flex items-center gap-3 before:block before:h-6 before:w-1 before:rounded-full before:bg-brand-500 before:shrink-0">
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
            <section className="mb-10" id="faq">
              <h2 className="mb-5 text-xl font-black text-slate-900 flex items-center gap-3 before:block before:h-6 before:w-1 before:rounded-full before:bg-brand-500 before:shrink-0">
                {t("article.faqHeading")}
              </h2>
              <div className="space-y-2">
                {content.faqs.map((f, i) => (
                  <details key={i} className="group rounded-xl border border-slate-200 bg-white overflow-hidden">
                    <summary className="flex cursor-pointer items-center justify-between px-5 py-4 font-semibold text-slate-900 marker:hidden list-none hover:bg-slate-50 transition-colors">
                      <span>{f.q}</span>
                      <span className="ml-4 shrink-0 text-brand-500 group-open:rotate-180 transition-transform duration-200 text-xs">▼</span>
                    </summary>
                    <div className="border-t border-slate-100 px-5 pb-5 pt-4 text-sm leading-relaxed text-slate-600">
                      {f.a}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Disclosure note */}
          <div className="mt-10 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-slate-400">
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

            {/* Author card */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src="/images/author-icon.png"
                  alt={t("author.name")}
                  width={44}
                  height={44}
                  className="rounded-full object-cover shrink-0"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">{t("author.name")}</p>
                  <a
                    href="https://www.pinterest.com/appdevelopsk/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] text-brand-600 hover:underline mt-0.5"
                  >
                    <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current" aria-hidden="true">
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                    </svg>
                    Pinterest
                  </a>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{t("author.bio")}</p>
            </div>

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
