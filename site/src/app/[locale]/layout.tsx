import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { LOCALES, getDirection, type Locale } from "@/lib/i18n/locales";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!(LOCALES as readonly string[]).includes(locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();
  const dir = getDirection(locale);

  return (
    <html lang={locale} dir={dir}>
      <body className="min-h-screen flex flex-col">
        <NextIntlClientProvider locale={locale as Locale} messages={messages}>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
