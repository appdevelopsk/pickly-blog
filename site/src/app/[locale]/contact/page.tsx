import { setRequestLocale, getTranslations } from "next-intl/server";
import { localeAlternates } from "@/lib/i18n/alternates";
import { seoDescription } from "@/lib/seo/meta-description";

interface Props {
  params: Promise<{ locale: string }>;
}

// 全ロケールで <title>Pickly</title>・説明文も共通という重複状態だったため、
// heading/lede からロケール固有の title/description を組み立て、
// canonical と hreflang(sitemap と同一条件)も宣言する (2026-08-01)。
export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const read = (k: string, fallback: string) => {
    try {
      const v = t(k);
      return v && v !== k ? v : fallback;
    } catch {
      return fallback;
    }
  };
  const title = read("legal.contact.heading", "Contact");
  const description = read("legal.contact.lede", title);
  // 見出しに既にブランド名が入っている場合(en "About Pickly" / ja "Pickly について" 等)、
  // ルート layout の template を通すと「About Pickly | Pickly」と二重になる。
  const brand = read("site.name", "Pickly");
  return {
    title: title.includes(brand) ? { absolute: title } : title,
    description: seoDescription(description),
    alternates: localeAlternates("/contact", locale),
  };
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
        {/*
          ★Cloudflare Email Obfuscation 回避 (2026-08-18)
          Scrape Shield が mailto: を `/cdn-cgi/l/email-protection#<hex>` に書き換えるが、
          この URL は実際に **404 を返す**（JS が復号する前に踏むと死ぬ）。
          クローラは JS を待たずに辿るので、問い合わせ導線が検索側から見て壊れていた。
          `<!--email_off-->` で囲むと Cloudflare は書き換えをスキップする。
          JSX では HTML コメントを出力できないので dangerouslySetInnerHTML を使う。
          email は上でハードコードした定数のみ（外部入力は入らない）。
        */}
        <span
          dangerouslySetInnerHTML={{
            __html: `<!--email_off--><a href="mailto:${email}" class="text-xl font-semibold text-brand-600 hover:underline">${email}</a><!--/email_off-->`,
          }}
        />
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
