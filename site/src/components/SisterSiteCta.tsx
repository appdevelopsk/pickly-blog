import { useTranslations } from "next-intl";

/**
 * 姉妹サイト fxea365（無料MT5自動売買EA）への文脈内クロスプロモCTA。
 * finance カテゴリの記事（証券・クレカ・投資系）に表示し、資産運用に関心のある読者を
 * 高LTVな fxea365 へ送客する。
 *
 * fxea365 は自社プロパティなので通常の follow リンク（rel="sponsored" は付けない）。
 */
export function SisterSiteCta() {
  const t = useTranslations("crossPromo");
  return (
    <aside className="my-10 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
      <p className="text-sm font-semibold text-emerald-900">{t("financeCta.title")}</p>
      <p className="mt-1 text-sm text-emerald-800/80">{t("fxea")}</p>
      <a
        href="https://fxea365.com"
        rel="noopener"
        className="mt-3 inline-flex w-fit items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-pure transition-colors hover:bg-emerald-700"
      >
        {t("financeCta.cta")} →
      </a>
    </aside>
  );
}
