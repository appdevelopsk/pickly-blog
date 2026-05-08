import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { listArticlesForLocale } from "@/lib/articles/registry";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Home locale={locale} />;
}

function Home({ locale }: { locale: string }) {
  const t = useTranslations();
  const articles = listArticlesForLocale(locale);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-3 text-4xl font-bold">{t("home.heading")}</h1>
      <p className="mb-8 text-lg text-slate-600">{t("home.subheading")}</p>
      {articles.length === 0 ? (
        <p className="rounded-md bg-amber-50 p-6 text-amber-800">
          {t("home.empty")}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/articles/${a.slug}`}
                className="block rounded-lg border border-slate-200 p-4 hover:border-brand-500 hover:bg-brand-50"
              >
                <span className="text-xs font-medium uppercase tracking-wide text-brand-600">
                  {t(`category.${a.category}`)}
                </span>
                <h2 className="mt-1 text-lg font-semibold">
                  {t(`articles.${a.slug}.title`)}
                </h2>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
