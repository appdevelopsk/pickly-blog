import { setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/LegalPage";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalPage baseKey="legal.about" />;
}
