import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";

export function SiteFooter() {
  const t = useTranslations();
  return (
    <footer className="mt-16 bg-slate-900 py-12 text-sm text-slate-400">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-8 flex flex-col gap-8 md:flex-row md:justify-between">
          {/* Brand */}
          <div>
            <p className="mb-2 text-xl font-black text-white">{t("site.name")}</p>
            <p className="max-w-xs text-slate-500 leading-relaxed">{t("site.footerTagline")}</p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-x-8 gap-y-3 text-slate-400">
            <Link href="/articles" className="hover:text-white transition-colors">
              {t("nav.articles")}
            </Link>
            <Link href="/disclosure" className="hover:text-white transition-colors">
              {t("nav.disclosure")}
            </Link>
            <Link href="/about" className="hover:text-white transition-colors">
              {t("nav.about")}
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              {t("nav.privacy")}
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              {t("nav.terms")}
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              {t("nav.contact")}
            </Link>
          </nav>
        </div>
        <p className="border-t border-slate-800 pt-5 text-xs text-slate-600">
          © {new Date().getFullYear()} {t("site.name")}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
