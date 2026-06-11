import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { NewsletterForm } from "@/components/NewsletterForm";

const CATEGORIES = [
  { key: "fitness",   icon: "🏋️" },
  { key: "food",      icon: "🍳" },
  { key: "tech",      icon: "💻" },
  { key: "beauty",    icon: "✨" },
  { key: "home",      icon: "🏠" },
  { key: "fashion",   icon: "👗" },
  { key: "finance",   icon: "💰" },
  { key: "travel",    icon: "✈️" },
  { key: "parenting", icon: "👶" },
  { key: "pets",      icon: "🐾" },
];

export function SiteFooter() {
  const t = useTranslations();
  return (
    <footer className="mt-16 bg-slate-900 py-12 text-sm text-slate-400">
      <div className="mx-auto max-w-5xl px-4">

        {/* Newsletter */}
        <div className="mb-10">
          <NewsletterForm source="pickly" />
        </div>

        {/* Main grid */}
        <div className="mb-10 grid gap-8 border-t border-slate-800 pt-10 sm:grid-cols-2 md:grid-cols-4">

          {/* Brand */}
          <div className="md:col-span-1">
            <p className="mb-2 text-xl font-black text-white">{t("site.name")}</p>
            <p className="text-slate-500 leading-relaxed text-xs">{t("site.footerTagline")}</p>
            <div className="mt-4 flex gap-3 text-xs">
              <Link href="/feed.xml" className="flex items-center gap-1 rounded-full border border-slate-700 px-3 py-1 text-slate-400 hover:border-orange-500 hover:text-orange-400 transition-colors">
                RSS
              </Link>
              <Link href="/author" className="flex items-center gap-1 rounded-full border border-slate-700 px-3 py-1 text-slate-400 hover:border-slate-400 hover:text-slate-200 transition-colors">
                About us
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">Categories</p>
            <nav className="flex flex-col gap-2">
              {CATEGORIES.slice(0, 5).map(({ key, icon }) => {
                let label = key;
                try { label = t(`category.${key}`); } catch { /* missing */ }
                return (
                  <Link key={key} href={`/category/${key}`} className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
                    <span aria-hidden className="text-xs">{icon}</span> {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">&nbsp;</p>
            <nav className="flex flex-col gap-2 mt-[1.125rem]">
              {CATEGORIES.slice(5).map(({ key, icon }) => {
                let label = key;
                try { label = t(`category.${key}`); } catch { /* missing */ }
                return (
                  <Link key={key} href={`/category/${key}`} className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
                    <span aria-hidden className="text-xs">{icon}</span> {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Discover */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">Discover</p>
            <nav className="flex flex-col gap-2">
              <Link href="/ranking"   className="text-slate-400 hover:text-white transition-colors">🏆 Rankings</Link>
              <Link href="/new"       className="text-slate-400 hover:text-white transition-colors">🆕 New reviews</Link>
              <Link href="/best-2026" className="text-slate-400 hover:text-white transition-colors">✨ Best of 2026</Link>
              <Link href="/gifts"     className="text-slate-400 hover:text-white transition-colors">🎁 Gift guides</Link>
              <Link href="/compare"   className="text-slate-400 hover:text-white transition-colors">⚖️ Compare</Link>
              <Link href="/tags"      className="text-slate-400 hover:text-white transition-colors">🏷️ Tags</Link>
              <Link href="/under-50"  className="text-slate-400 hover:text-white transition-colors">💰 Under $50</Link>
              <Link href="/under-100" className="text-slate-400 hover:text-white transition-colors">💰 Under $100</Link>
              <Link href="/brands"    className="text-slate-400 hover:text-white transition-colors">🎯 Brands</Link>
              <Link href="/search"    className="text-slate-400 hover:text-white transition-colors">🔍 Search</Link>
            </nav>
          </div>
        </div>

        {/* Legal links */}
        <div className="mb-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-800 pt-6 text-xs text-slate-500">
          <Link href="/disclosure" className="hover:text-slate-300 transition-colors">{t("nav.disclosure")}</Link>
          <Link href="/about"      className="hover:text-slate-300 transition-colors">{t("nav.about")}</Link>
          <Link href="/privacy"    className="hover:text-slate-300 transition-colors">{t("nav.privacy")}</Link>
          <Link href="/terms"      className="hover:text-slate-300 transition-colors">{t("nav.terms")}</Link>
          <Link href="/contact"    className="hover:text-slate-300 transition-colors">{t("nav.contact")}</Link>
        </div>

        {/* Sister sites */}
        <div className="mb-6 border-t border-slate-800 pt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("crossPromo.title")}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-10">
            <a href="https://toolify365.com" className="group">
              <span className="font-bold text-slate-200 group-hover:text-white transition-colors">Toolify365</span>
              <span className="mt-0.5 block text-xs text-slate-500">{t("crossPromo.toolify")}</span>
            </a>
            <a href="https://fxea365.com" className="group">
              <span className="font-bold text-slate-200 group-hover:text-white transition-colors">FXEA365</span>
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
