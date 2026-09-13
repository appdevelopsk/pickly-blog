import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";

/**
 * 全ページ共通の左サイドバー(価格.com 型)。
 *
 * 従来トップ(app/[locale]/page.tsx)にだけインラインで存在し、category / ranking /
 * new など他26ページは一段組で横メニューが一切無かった。回遊の入口をページ種別に
 * よらず同じ位置に固定するため、コンポーネントとして切り出して共有する(2026-09-13)。
 *
 * - lg 未満: 横スクロールの帯(スマホで縦に長い一覧を積むと本文が押し下がるため)
 * - lg 以上: 縦一列・sticky
 *
 * counts を渡すと各カテゴリの記事数を出す。トップのように件数を持っている
 * ページだけが渡せばよく、未指定なら数字は出ない。
 */

const CATEGORY_ICONS: Record<string, string> = {
  fitness: "🏋️",
  food: "🍳",
  tech: "💻",
  beauty: "✨",
  home: "🏠",
  fashion: "👗",
  finance: "💰",
  travel: "✈️",
  parenting: "👶",
  pets: "🐾",
};

// 表示順。記事数ではなく固定順にして、ビルドごとに並びが動かないようにする。
const CATEGORY_ORDER = [
  "food", "fitness", "home", "tech", "beauty",
  "fashion", "travel", "pets", "finance", "parenting",
];

// サイドバー下部の補助導線。ヘッダー3段目と重複するが、スクロール後に
// ヘッダーのカテゴリ段が畳まれても戻れるようにここにも置く。
const DISCOVER_LINKS = [
  { key: "rankings",   href: "/ranking" },
  { key: "newReviews", href: "/new" },
  { key: "bestOf",     href: "/best-2026" },
  { key: "gifts",      href: "/gifts" },
  { key: "compare",    href: "/compare" },
];

interface Props {
  /** 現在表示中のカテゴリ(あれば強調する) */
  active?: string;
  /** カテゴリ別の記事数。未指定なら件数バッジを出さない */
  counts?: Record<string, number>;
}

export function CategorySidebar({ active, counts }: Props) {
  const t = useTranslations();
  const tt = (key: string, fallback: string): string => {
    const v = t(key);
    return v ? v : fallback;
  };

  return (
    <aside className="mb-6 lg:mb-0">
      <nav className="lg:sticky lg:top-[4.5rem]">
        <p className="mb-2 hidden text-[11px] font-bold uppercase tracking-widest text-slate-400 lg:block">
          {tt("pages.sidebarHeading", "Categories")}
        </p>
        <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:block lg:space-y-0.5 lg:overflow-visible lg:px-0 lg:pb-0">
          {CATEGORY_ORDER.map((category) => {
            const label = tt(`category.${category}`, category);
            const isActive = category === active;
            const count = counts?.[category];
            return (
              <li key={category} className="shrink-0">
                <Link
                  href={`/category/${category}`}
                  data-related="sidebar-category"
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-2 text-sm transition-colors lg:border-0 lg:px-2 lg:py-1.5 ${
                    isActive
                      ? "border-brand-200 bg-brand-50 font-bold text-brand-700 lg:bg-brand-50"
                      : "border-slate-200 font-medium text-slate-600 hover:bg-slate-50 hover:text-brand-700"
                  }`}
                >
                  {CATEGORY_ICONS[category] && <span aria-hidden>{CATEGORY_ICONS[category]}</span>}
                  <span>{label}</span>
                  {typeof count === "number" && (
                    <span className="ml-auto hidden text-xs text-slate-400 lg:inline">{count}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* 特集導線(lg 以上のみ。スマホでは帯が二重になって邪魔になる) */}
        <div className="mt-6 hidden lg:block">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            {tt("discover.features", "Featured collections")}
          </p>
          <ul className="space-y-0.5">
            {DISCOVER_LINKS.map(({ key, href }) => (
              <li key={key}>
                <Link
                  href={href}
                  data-related="sidebar-discover"
                  className="block rounded-lg px-2 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-brand-700"
                >
                  {tt(`discover.${key}`, key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
