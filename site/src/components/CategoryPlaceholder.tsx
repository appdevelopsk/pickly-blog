import type { ArticleCategory } from "@/lib/articles/types";

const CATEGORY_GRADIENTS: Partial<Record<ArticleCategory | string, { from: string; to: string }>> = {
  fitness:  { from: "#dc2626", to: "#9f1239" },
  food:     { from: "#16a34a", to: "#14532d" },
  tech:     { from: "#1d4ed8", to: "#1e3a8a" },
  beauty:   { from: "#db2777", to: "#831843" },
  home:     { from: "#b45309", to: "#78350f" },
  fashion:  { from: "#7c3aed", to: "#4c1d95" },
  finance:  { from: "#0369a1", to: "#0c4a6e" },
  travel:   { from: "#0891b2", to: "#164e63" },
  parenting:{ from: "#d97706", to: "#92400e" },
  pets:     { from: "#059669", to: "#064e3b" },
};

interface Props {
  category: ArticleCategory | string;
  title?: string;
  className?: string;
}

export function CategoryPlaceholder({ category, title, className = "" }: Props) {
  const g = CATEGORY_GRADIENTS[category] ?? { from: "#475569", to: "#1e293b" };
  return (
    <div
      className={`flex h-full w-full items-center justify-center overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
    >
      {title ? (
        <p className="px-4 text-center text-sm font-bold leading-snug text-white/90 line-clamp-3">
          {title}
        </p>
      ) : (
        <span
          className="text-4xl font-black uppercase tracking-widest text-white/10 select-none"
          aria-hidden="true"
        >
          {(category ?? "").slice(0, 1).toUpperCase()}
        </span>
      )}
    </div>
  );
}
