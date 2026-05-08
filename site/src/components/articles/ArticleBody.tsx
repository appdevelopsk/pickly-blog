import { useTranslations } from "next-intl";
import type { ArticleContent, ArticleMeta } from "@/lib/articles/types";
import type { AffiliateOffer } from "@/lib/affiliates/types";
import { AffiliateLink } from "@/components/AffiliateLink";

interface Props {
  meta: ArticleMeta;
  content: ArticleContent;
  offers: AffiliateOffer[];
}

/**
 * 共通の記事レンダラ。type別に微調整するが、
 * 大枠（hero → body → offers → FAQ → disclosure）は共通。
 */
export function ArticleBody({ meta, content, offers }: Props) {
  const t = useTranslations();

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-8">
        <h1 className="mb-3 text-3xl font-bold leading-tight md:text-4xl">
          {content.title}
        </h1>
        <p className="text-lg text-slate-600">{content.lede}</p>
        <p className="mt-4 text-xs text-slate-500">
          {t("article.publishedAt", { date: formatDate(meta.publishedAt) })}
          {meta.updatedAt !== meta.publishedAt &&
            " · " + t("article.updatedAt", { date: formatDate(meta.updatedAt) })}
        </p>
      </header>

      {/* For comparison-type, show offer ranking up front */}
      {meta.type === "comparison" && offers.length > 0 && (
        <section className="mb-8" aria-labelledby="ranking-heading">
          <h2 id="ranking-heading" className="mb-3 text-xl font-bold">
            {t("article.rankingHeading")}
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {offers.map((o, i) => (
              <li key={o.id} className="relative">
                <span className="absolute -left-2 -top-2 z-10 rounded-full bg-brand-600 px-2 py-0.5 text-xs font-bold text-white">
                  #{i + 1}
                </span>
                <AffiliateLink
                  offer={o}
                  note={content.offerNotes?.[o.id]}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {content.sections.map((s, i) => (
        <section key={i} className="mb-8">
          <h2 className="mb-3 text-2xl font-bold">{s.heading}</h2>
          {s.paragraphs.map((p, j) => (
            <p key={j} className="mb-3 leading-relaxed text-slate-700">
              {p}
            </p>
          ))}
          {s.subsections?.map((sub, j) => (
            <div key={j} className="ml-4 mt-4 border-l-2 border-slate-200 pl-4">
              <h3 className="mb-2 text-lg font-semibold">{sub.heading}</h3>
              {sub.paragraphs.map((p, k) => (
                <p key={k} className="mb-3 leading-relaxed text-slate-700">
                  {p}
                </p>
              ))}
            </div>
          ))}
        </section>
      ))}

      {/* For review/guide types, show offers at the bottom */}
      {meta.type !== "comparison" && offers.length > 0 && (
        <section className="mb-8" aria-labelledby="offers-heading">
          <h2 id="offers-heading" className="mb-3 text-xl font-bold">
            {t("article.offersHeading")}
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {offers.map((o) => (
              <li key={o.id}>
                <AffiliateLink
                  offer={o}
                  note={content.offerNotes?.[o.id]}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {content.faqs.length > 0 && (
        <section className="mb-8" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="mb-3 text-2xl font-bold">
            {t("article.faqHeading")}
          </h2>
          <dl>
            {content.faqs.map((f, i) => (
              <div key={i} className="mb-4">
                <dt className="font-semibold">{f.q}</dt>
                <dd className="mt-1 text-slate-700">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </article>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}
