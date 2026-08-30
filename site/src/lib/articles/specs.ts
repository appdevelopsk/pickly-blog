// offerId キーで Web一次情報から検証済みの製品スペックを引く。
// サイトは specs-cache.json を読むだけ（ビルド時 API/取得なし）。値ごとに出典URLを保持。
// 表示は spec-labels.ts でロケール化。確証の取れなかったフィールドは null = 表示しない。
import rawCache from "./specs-cache.json";
import { specLabel, SPEC_UNITS } from "./spec-labels";

export type SpecEntry = {
  confirmedProduct?: string;
  fields: Record<string, string | null>;
  /**
   * ロケール別の値の上書き。fields[] は英語(源言語)を持ち、日本語など
   * 現地語の表記が必要なフィールドだけここに置く。
   * 未収録ロケールは fields[] の英語をそのまま使う。
   * (これが無いと日本語の値が /en/ のスペック表に素通しで出る)
   */
  i18n?: Record<string, Record<string, string>>;
  sources?: Record<string, string | null>;
  verifiedAt?: string;
  notes?: string;
};

const CACHE = rawCache as unknown as Record<string, SpecEntry>;

/** 検証済みspecがあれば {ローカライズ済みラベル: 値+単位} を返す。なければ undefined。 */
export function getVerifiedSpecs(offerId: string, locale: string): Record<string, string> | undefined {
  const e = CACHE[offerId];
  if (!e?.fields) return undefined;
  const out: Record<string, string> = {};
  const override = e.i18n?.[locale] ?? (locale === "zh-TW" ? e.i18n?.["zh-CN"] : undefined);
  for (const [key, rawVal] of Object.entries(e.fields)) {
    const val = override?.[key] ?? rawVal;
    if (val == null || val === "") continue; // 未検証/該当なしは出さない
    const unit = SPEC_UNITS[key] ?? "";
    // 既に値側に単位が含まれていれば二重付与しない
    const display = unit && !String(val).includes(unit.trim()) ? `${val}${unit}` : String(val);
    out[specLabel(key, locale)] = display;
  }
  return Object.keys(out).length ? out : undefined;
}

export function hasVerifiedSpecs(offerId: string): boolean {
  return !!CACHE[offerId]?.fields;
}
