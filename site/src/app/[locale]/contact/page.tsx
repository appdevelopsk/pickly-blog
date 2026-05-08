import { setRequestLocale, getTranslations } from "next-intl/server";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const email = "contact@pickly.blog";

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-4 text-3xl font-bold md:text-4xl">{t("legal.contact.heading")}</h1>
      <p className="mb-6 text-lg text-slate-600">{t("legal.contact.lede")}</p>

      <section className="mb-8 rounded-lg border border-slate-200 bg-slate-50 p-6">
        <p className="mb-2 text-sm font-medium text-slate-700">
          {t("legal.contact.emailLabel")}
        </p>
        <a
          href={`mailto:${email}`}
          className="text-xl font-semibold text-brand-600 hover:underline"
        >
          {email}
        </a>
      </section>

      <p className="mb-3 leading-relaxed text-slate-700">
        {t("legal.contact.responseTime")}
      </p>
      <p className="mb-3 leading-relaxed text-slate-700">
        {t("legal.contact.scope")}
      </p>
      <p className="mb-3 text-sm text-slate-500">{t("legal.contact.privacy")}</p>
    </article>
  );
}
