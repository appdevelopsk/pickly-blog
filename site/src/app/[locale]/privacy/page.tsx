import { setRequestLocale, getTranslations } from "next-intl/server";
import { LegalPage } from "@/components/LegalPage";
import { localeAlternates } from "@/lib/i18n/alternates";

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
  const title = read("legal.privacy.heading", "Privacy");
  const description = read("legal.privacy.lede", title);
  // 見出しに既にブランド名が入っている場合(en "About Pickly" / ja "Pickly について" 等)、
  // ルート layout の template を通すと「About Pickly | Pickly」と二重になる。
  const brand = read("site.name", "Pickly");
  return {
    title: title.includes(brand) ? { absolute: title } : title,
    description: description.slice(0, 160),
    alternates: localeAlternates("/privacy", locale),
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalPage baseKey="legal.privacy" />;
}
