import type { ArticleCategory } from "@/lib/articles/types";

const CATEGORY_MAP: Record<ArticleCategory, { emoji: string; from: string; to: string }> = {
  fitness:  { emoji: "💪", from: "#dbeafe", to: "#bfdbfe" },
  food:     { emoji: "🍽️", from: "#dcfce7", to: "#bbf7d0" },
  tech:     { emoji: "💻", from: "#ede9fe", to: "#ddd6fe" },
  home:     { emoji: "🏠", from: "#fef9c3", to: "#fef08a" },
  beauty:   { emoji: "✨", from: "#fce7f3", to: "#fbcfe8" },
  fashion:  { emoji: "👗", from: "#ffedd5", to: "#fed7aa" },
  finance:  { emoji: "💰", from: "#d1fae5", to: "#a7f3d0" },
  travel:   { emoji: "✈️", from: "#e0f2fe", to: "#bae6fd" },
  parenting:{ emoji: "👶", from: "#fef3c7", to: "#fde68a" },
  pets:     { emoji: "🐾", from: "#f3e8ff", to: "#e9d5ff" },
};

export function CategoryPlaceholder({ category, className = "" }: { category: ArticleCategory; className?: string }) {
  const { emoji, from, to } = CATEGORY_MAP[category] ?? { emoji: "📦", from: "#f1f5f9", to: "#e2e8f0" };
  return (
    <div
      className={`flex h-full w-full items-center justify-center text-4xl ${className}`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {emoji}
    </div>
  );
}
