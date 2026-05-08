import { setRequestLocale, getTranslations } from "next-intl/server";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function DisclosurePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-4 text-3xl font-bold">{t("legal.disclosure.heading")}</h1>
      <div className="prose prose-slate">
        <p>{t("legal.disclosure.body1")}</p>
        <p>{t("legal.disclosure.body2")}</p>
        <p>{t("legal.disclosure.body3")}</p>
      </div>
    </article>
  );
}
