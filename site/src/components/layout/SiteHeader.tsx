import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";

export function SiteHeader() {
  const t = useTranslations();
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-brand-600">
          {t("site.name")}
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link href="/articles" className="hover:text-brand-600">
            {t("nav.articles")}
          </Link>
          <Link href="/disclosure" className="text-slate-500 hover:text-brand-600">
            {t("nav.disclosure")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
