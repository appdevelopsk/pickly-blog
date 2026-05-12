import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";

export function SiteFooter() {
  const t = useTranslations();
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50 py-10 text-sm text-slate-600">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-6 flex flex-col gap-6 md:flex-row md:justify-between">
          {/* Brand */}
          <div>
            <p className="mb-1 text-base font-black text-brand-600">{t("site.name")}</p>
            <p className="text-slate-500">{t("site.footerTagline")}</p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/articles" className="hover:text-brand-600 transition-colors">
              {t("nav.articles")}
            </Link>
            <Link href="/disclosure" className="hover:text-brand-600 transition-colors">
              {t("nav.disclosure")}
            </Link>
            <Link href="/about" className="hover:text-brand-600 transition-colors">
              {t("nav.about")}
            </Link>
            <Link href="/privacy" className="hover:text-brand-600 transition-colors">
              {t("nav.privacy")}
            </Link>
            <Link href="/terms" className="hover:text-brand-600 transition-colors">
              {t("nav.terms")}
            </Link>
            <Link href="/contact" className="hover:text-brand-600 transition-colors">
              {t("nav.contact")}
            </Link>
          </nav>
        </div>
        <p className="border-t border-slate-200 pt-4 text-xs text-slate-400">
          © {new Date().getFullYear()} {t("site.name")}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
