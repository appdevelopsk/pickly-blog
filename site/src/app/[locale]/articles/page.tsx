import { setRequestLocale, getTranslations } from "next-intl/server";
import { LOCALES } from "@/lib/i18n/locales";
import { Link } from "@/lib/i18n/navigation";
import { listArticlesForLocale } from "@/lib/articles/registry";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function ArticlesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const articles = listArticlesForLocale(locale);

  // Group by category
  const byCategory = articles.reduce<Record<string, typeof articles>>(
    (acc, a) => {
      (acc[a.category] ??= []).push(a);
      return acc;
    },
    {},
  );

  let categoryTitle = "";
  try { categoryTitle = t("nav.articles"); } catch { categoryTitle = "Articles"; }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-8 text-4xl font-bold">{categoryTitle}</h1>
      {Object.entries(byCategory).map(([category, items]) => {
        let catLabel = category;
        try { catLabel = t(`category.${category}`); } catch { /* missing key */ }
        return (
          <section key={category} className="mb-10">
            <h2 className="mb-4 text-lg font-semibold uppercase tracking-wide text-brand-600">
              {catLabel}
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((a) => {
                let title = a.slug;
                try { title = t(`articles.${a.slug}.title`); } catch { /* missing key */ }
                let description = "";
                try { description = t(`articles.${a.slug}.description`); } catch { /* missing key */ }
                return (
                  <li key={a.slug}>
                    <Link
                      href={`/articles/${a.slug}`}
                      className="block rounded-lg border border-slate-200 p-4 hover:border-brand-500 hover:bg-brand-50"
                    >
                      <h3 className="font-semibold leading-snug">{title}</h3>
                      {description && (
                        <p className="mt-1 text-sm text-slate-500 line-clamp-2">{description}</p>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  let title = "Articles";
  try { title = t("nav.articles"); } catch { /* missing key */ }
  let siteName = "Pickly";
  try { siteName = t("site.name"); } catch { /* missing key */ }
  return { title: `${title} | ${siteName}` };
}
