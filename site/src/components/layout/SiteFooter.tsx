import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";

export function SiteFooter() {
  const t = useTranslations();
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50 py-8 text-sm text-slate-600">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 md:flex-row md:justify-between">
        <p>{t("site.footerTagline")}</p>
        <nav className="flex gap-4">
          <Link href="/about">{t("nav.about")}</Link>
          <Link href="/privacy">{t("nav.privacy")}</Link>
          <Link href="/terms">{t("nav.terms")}</Link>
          <Link href="/contact">{t("nav.contact")}</Link>
          <Link href="/disclosure">{t("nav.disclosure")}</Link>
        </nav>
      </div>
    </footer>
  );
}
