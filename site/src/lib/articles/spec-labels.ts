// 製品スペック表の表示ラベル（多言語）＋単位。
// 値は specs-cache.json に出典付きで保持し、表示時にこのラベルでローカライズする。
// （量産AI生成の未検証specを、Web一次情報で検証した実データへ置換する厳選施策・2026-06-29）
// 新カテゴリのフィールドを追加するときは SPEC_LABELS と必要なら SPEC_UNITS に足す。

export const SPEC_UNITS: Record<string, string> = {
  // 食品/飲料（1食分あたり）
  calories: " kcal",
  protein_g: " g",
  totalFat_g: " g",
  sugars_g: " g",
  fiber_g: " g",
  sodium_mg: " mg",
};

export const SPEC_LABELS: Record<string, Record<string, string>> = {
  // ---- 食品/飲料 ----
  servingSize: { en: "Serving size", ja: "1食分", "zh-CN": "每份", ko: "1회 제공량", es: "Porción", "pt-BR": "Porção", fr: "Portion", de: "Portion", it: "Porzione" },
  calories: { en: "Calories", ja: "カロリー", "zh-CN": "热量", ko: "칼로리", es: "Calorías", "pt-BR": "Calorias", fr: "Calories", de: "Kalorien", it: "Calorie" },
  protein_g: { en: "Protein", ja: "たんぱく質", "zh-CN": "蛋白质", ko: "단백질", es: "Proteínas", "pt-BR": "Proteínas", fr: "Protéines", de: "Protein", it: "Proteine" },
  totalFat_g: { en: "Total fat", ja: "脂質", "zh-CN": "脂肪", ko: "지방", es: "Grasas", "pt-BR": "Gorduras", fr: "Lipides", de: "Fett", it: "Grassi" },
  sugars_g: { en: "Sugars", ja: "糖類", "zh-CN": "糖", ko: "당류", es: "Azúcares", "pt-BR": "Açúcares", fr: "Sucres", de: "Zucker", it: "Zuccheri" },
  fiber_g: { en: "Fiber", ja: "食物繊維", "zh-CN": "膳食纤维", ko: "식이섬유", es: "Fibra", "pt-BR": "Fibras", fr: "Fibres", de: "Ballaststoffe", it: "Fibre" },
  sodium_mg: { en: "Sodium", ja: "ナトリウム", "zh-CN": "钠", ko: "나트륨", es: "Sodio", "pt-BR": "Sódio", fr: "Sodium", de: "Natrium", it: "Sodio" },
  base_oil: { en: "Added oil", ja: "添加油脂", "zh-CN": "添加油脂", ko: "첨가 유지", es: "Aceite añadido", "pt-BR": "Óleo adicionado", fr: "Huile ajoutée", de: "Zugesetztes Öl", it: "Olio aggiunto" },
  certifications: { en: "Certifications", ja: "認証", "zh-CN": "认证", ko: "인증", es: "Certificaciones", "pt-BR": "Certificações", fr: "Certifications", de: "Zertifizierungen", it: "Certificazioni" },
};

export function specLabel(fieldKey: string, locale: string): string {
  const m = SPEC_LABELS[fieldKey];
  return m?.[locale] ?? m?.en ?? fieldKey;
}
