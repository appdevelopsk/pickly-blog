import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { NewsletterForm } from "@/components/NewsletterForm";

export function SiteFooter() {
  const t = useTranslations();
  return (
    <footer className="mt-16 bg-slate-900 py-12 text-sm text-slate-400">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-8">
          <NewsletterForm source="pickly" />
        </div>
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

        {/* 関連サイト（クロスプロモ・統合集客） */}
        <div className="mb-8 border-t border-slate-800 pt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("crossPromo.title")}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-10">
            <a href="https://toolify365.com" className="group">
              <span className="font-bold text-slate-200 transition-colors group-hover:text-white">
                Toolify365
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">{t("crossPromo.toolify")}</span>
            </a>
            <a href="https://fxea365.com" className="group">
              <span className="font-bold text-slate-200 transition-colors group-hover:text-white">
                FXEA365
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">{t("crossPromo.fxea")}</span>
            </a>
          </div>
        </div>

        <p className="border-t border-slate-800 pt-5 text-xs text-slate-600">
          © {new Date().getFullYear()} {t("site.name")}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
