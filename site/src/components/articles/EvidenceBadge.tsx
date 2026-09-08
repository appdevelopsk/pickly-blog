import { useTranslations } from "next-intl";
import type { ArticleContent } from "@/lib/articles/types";
import { hasVerifiedSpecs } from "@/lib/articles/specs";

/**
 * 記事の根拠レベルを示すコンパクトなバッジ列（2026-09-08）。
 * 記事ページ専用。既存データからのみ導出し、新しい入力は要求しない:
 *   spec-verified … products[].specs か specs-cache の検証済みスペックを持つ商品がある
 *   sourced       … methodology（選定方法の明記）がある
 *   editorial     … それ以外（編集部レビューのみ）
 * 併せて updatedAt を「Last reviewed」として提示し、AI 検索/読者に鮮度を示す。
 */
export type EvidenceLevel = "spec-verified" | "sourced" | "editorial";

export function deriveEvidenceLevel(content: ArticleContent, offerIds: readonly string[]): EvidenceLevel {
  const products = content.products ?? [];
  const specVerified =
    products.some((p) => p.specs && Object.keys(p.specs).length > 0) ||
    offerIds.some((id) => hasVerifiedSpecs(id));
  if (specVerified) return "spec-verified";
  if (content.methodology && content.methodology.trim().length > 0) return "sourced";
  return "editorial";
}

const LEVEL_KEY: Record<EvidenceLevel, string> = {
  "spec-verified": "article.evidenceSpecVerified",
  sourced: "article.evidenceSourced",
  editorial: "article.evidenceEditorial",
};

const LEVEL_CLASS: Record<EvidenceLevel, string> = {
  "spec-verified": "border-emerald-200 bg-emerald-50 text-emerald-700",
  sourced: "border-blue-200 bg-blue-50 text-blue-700",
  editorial: "border-slate-200 bg-slate-50 text-slate-600",
};

interface Props {
  level: EvidenceLevel;
  /** ISO date (YYYY-MM-DD) of the last review, from ArticleMeta.updatedAt */
  reviewedAt: string;
}

export function EvidenceBadge({ level, reviewedAt }: Props) {
  const t = useTranslations();
  return (
    <div className="flex flex-wrap items-center gap-2" data-evidence-level={level}>
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${LEVEL_CLASS[level]}`}
        title={t("article.evidenceLabel")}
      >
        <span aria-hidden="true">✓</span>
        {t(LEVEL_KEY[level])}
      </span>
      <span className="text-xs text-slate-500">
        {t("article.lastReviewed", { date: reviewedAt })}
      </span>
    </div>
  );
}
