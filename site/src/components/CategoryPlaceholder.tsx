import type { ArticleCategory } from "@/lib/articles/types";

const CATEGORY_GRADIENTS: Partial<Record<ArticleCategory | string, { from: string; to: string }>> = {
  fitness:  { from: "#dc2626", to: "#7f1d1d" },
  food:     { from: "#16a34a", to: "#14532d" },
  tech:     { from: "#2563eb", to: "#1e3a8a" },
  beauty:   { from: "#db2777", to: "#831843" },
  home:     { from: "#d97706", to: "#78350f" },
  fashion:  { from: "#7c3aed", to: "#4c1d95" },
  finance:  { from: "#0369a1", to: "#0c4a6e" },
  travel:   { from: "#0891b2", to: "#164e63" },
  parenting:{ from: "#ea580c", to: "#7c2d12" },
  pets:     { from: "#059669", to: "#064e3b" },
};

const CATEGORY_ICONS: Partial<Record<ArticleCategory | string, string>> = {
  fitness:  "🏋️",
  food:     "🍳",
  tech:     "💻",
  beauty:   "✨",
  home:     "🏠",
  fashion:  "👗",
  finance:  "💰",
  travel:   "✈️",
  parenting:"👶",
  pets:     "🐾",
};

interface Props {
  category: ArticleCategory | string;
  title?: string;
  className?: string;
}

export function CategoryPlaceholder({ category, title, className = "" }: Props) {
  const g = CATEGORY_GRADIENTS[category] ?? { from: "#475569", to: "#1e293b" };
  const icon = CATEGORY_ICONS[category] ?? "📋";
  return (
    <div
      className={`relative flex h-full w-full flex-col items-center justify-center overflow-hidden ${className}`}
      style={{ background: `linear-gradient(145deg, ${g.from}, ${g.to})` }}
    >
      {/* Dot texture */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(circle, white 1.5px, transparent 1.5px)",
          backgroundSize: "22px 22px",
        }}
      />
      {/* Glow */}
      <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(ellipse at 30% 30%, white, transparent 60%)` }} />
      {/* Content */}
      <span className="relative mb-2 text-4xl drop-shadow-sm" aria-hidden="true">{icon}</span>
      <p className="relative mb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
        {category}
      </p>
      {title && (
        <p className="relative max-w-[80%] px-2 text-center text-sm font-bold leading-snug text-white/90 line-clamp-2">
          {title}
        </p>
      )}
    </div>
  );
}
