import type { Translation } from "./batch-articles-types";

/**
 * Generate the 15-locale translation set from a structured key.
 * The 15 non-EN/JA locales only need {title, description, lede} — the article
 * body falls back to English at runtime.
 *
 * Key fields:
 *  - subject: the noun phrase being compared, in each locale.
 *  - brands:  brand names listed in description (kept in Latin script).
 *  - n:       number of products tested.
 *  - days:    test duration in days.
 *  - kind:    short descriptor of *what makes one best* (speed / value / battery / etc.)
 */
export type TranslationKey = {
  subject: Record<string, string>;
  brands: string;
  n: number;
  days: number;
  kind: Record<string, string>;
};

const T = {
  "zh-CN": {
    titlePat: (s: string, n: number, d: number) => `2026年最佳${s}：${n}款产品测试${d}天`,
    descPat: (s: string, brands: string, kind: string) => `我们测试了${brands}。看看2026年哪款${s}在${kind}方面真正出色。`,
    ledePat: (n: number, d: number) => `${n}款。${d}天。实测对比，不是营销。`,
  },
  "zh-TW": {
    titlePat: (s: string, n: number, d: number) => `2026年最佳${s}：${n}款產品測試${d}天`,
    descPat: (s: string, brands: string, kind: string) => `我們測試了${brands}。看看2026年哪款${s}在${kind}方面真正出色。`,
    ledePat: (n: number, d: number) => `${n}款。${d}天。實測比較，不是行銷。`,
  },
  ko: {
    titlePat: (s: string, n: number, d: number) => `2026 최고의 ${s}: ${n}개 제품을 ${d}일간 테스트`,
    descPat: (s: string, brands: string, kind: string) => `${brands}를 비교했습니다. 2026년 진짜 ${kind}이 좋은 ${s}는 무엇인지.`,
    ledePat: (n: number, d: number) => `${n}개. ${d}일. 광고가 아닌 실측 데이터.`,
  },
  es: {
    titlePat: (s: string, n: number, d: number) => `Mejor ${s} 2026: ${n} probados durante ${d} días`,
    descPat: (s: string, brands: string, kind: string) => `Comparamos ${brands}. Esto es lo que realmente destaca en ${kind} para ${s} en 2026.`,
    ledePat: (n: number, d: number) => `${n} opciones. ${d} días. Medimos, no copiamos marketing.`,
  },
  "pt-BR": {
    titlePat: (s: string, n: number, d: number) => `Melhor ${s} 2026: ${n} testados por ${d} dias`,
    descPat: (s: string, brands: string, kind: string) => `Comparamos ${brands}. Veja o que realmente se destaca em ${kind} para ${s} em 2026.`,
    ledePat: (n: number, d: number) => `${n} opções. ${d} dias. Medimos, não copiamos marketing.`,
  },
  fr: {
    titlePat: (s: string, n: number, d: number) => `Meilleur ${s} 2026 : ${n} testés pendant ${d} jours`,
    descPat: (s: string, brands: string, kind: string) => `Nous avons comparé ${brands}. Voici ce qui sort vraiment du lot côté ${kind} pour ${s} en 2026.`,
    ledePat: (n: number, d: number) => `${n} options. ${d} jours. Des mesures, pas du marketing.`,
  },
  de: {
    titlePat: (s: string, n: number, d: number) => `Bestes ${s} 2026: ${n} im ${d}-Tage-Test`,
    descPat: (s: string, brands: string, kind: string) => `Wir haben ${brands} verglichen. Das überzeugt 2026 wirklich bei ${kind} und ${s}.`,
    ledePat: (n: number, d: number) => `${n} Modelle. ${d} Tage. Echte Messungen, kein Marketing.`,
  },
  it: {
    titlePat: (s: string, n: number, d: number) => `Miglior ${s} 2026: ${n} testati per ${d} giorni`,
    descPat: (s: string, brands: string, kind: string) => `Abbiamo confrontato ${brands}. Ecco cosa spicca davvero per ${kind} tra i ${s} nel 2026.`,
    ledePat: (n: number, d: number) => `${n} opzioni. ${d} giorni. Misure reali, niente marketing.`,
  },
  ru: {
    titlePat: (s: string, n: number, d: number) => `Лучший ${s} 2026: ${n} протестированы за ${d} дней`,
    descPat: (s: string, brands: string, kind: string) => `Мы сравнили ${brands}. Что действительно выделяется в категории ${s} по ${kind} в 2026.`,
    ledePat: (n: number, d: number) => `${n} вариантов. ${d} дней. Реальные замеры, не маркетинг.`,
  },
  ar: {
    titlePat: (s: string, n: number, d: number) => `أفضل ${s} 2026: اختبرنا ${n} لمدة ${d} يومًا`,
    descPat: (s: string, brands: string, kind: string) => `قارنّا ${brands}. هذا ما يبرز فعلًا في ${kind} ضمن ${s} عام 2026.`,
    ledePat: (n: number, d: number) => `${n} خيارات. ${d} يومًا. قياسات حقيقية، لا تسويق.`,
  },
  hi: {
    titlePat: (s: string, n: number, d: number) => `2026 का सर्वश्रेष्ठ ${s}: ${n} को ${d} दिनों तक परखा`,
    descPat: (s: string, brands: string, kind: string) => `हमने ${brands} की तुलना की। 2026 में ${s} में ${kind} के मामले में असली विजेता कौन है।`,
    ledePat: (n: number, d: number) => `${n} विकल्प। ${d} दिन। असली माप, मार्केटिंग नहीं।`,
  },
  id: {
    titlePat: (s: string, n: number, d: number) => `${s} Terbaik 2026: ${n} diuji selama ${d} hari`,
    descPat: (s: string, brands: string, kind: string) => `Kami membandingkan ${brands}. Inilah ${s} 2026 yang benar-benar unggul dalam hal ${kind}.`,
    ledePat: (n: number, d: number) => `${n} pilihan. ${d} hari. Pengukuran nyata, bukan iklan.`,
  },
  th: {
    titlePat: (s: string, n: number, d: number) => `${s} ที่ดีที่สุดปี 2026: ทดสอบ ${n} รุ่นเป็นเวลา ${d} วัน`,
    descPat: (s: string, brands: string, kind: string) => `เราเปรียบเทียบ ${brands} ดูว่า ${s} รุ่นไหนเด่นจริงด้าน ${kind} ในปี 2026`,
    ledePat: (n: number, d: number) => `${n} ตัวเลือก ${d} วัน วัดผลจริง ไม่ใช่การตลาด`,
  },
  vi: {
    titlePat: (s: string, n: number, d: number) => `${s} tốt nhất 2026: thử nghiệm ${n} sản phẩm trong ${d} ngày`,
    descPat: (s: string, brands: string, kind: string) => `Chúng tôi so sánh ${brands}. Đâu là ${s} 2026 thực sự nổi bật về ${kind}.`,
    ledePat: (n: number, d: number) => `${n} lựa chọn. ${d} ngày. Đo lường thật, không phải marketing.`,
  },
  tr: {
    titlePat: (s: string, n: number, d: number) => `2026'nın en iyi ${s}: ${n} ürün ${d} gün test edildi`,
    descPat: (s: string, brands: string, kind: string) => `${brands} ürünlerini karşılaştırdık. 2026'da ${s} için ${kind} açısından gerçekten öne çıkan hangisi.`,
    ledePat: (n: number, d: number) => `${n} ürün. ${d} gün. Pazarlama değil, gerçek ölçüm.`,
  },
} as const;

type Locale15 = keyof typeof T;

export function buildTranslations(key: TranslationKey): Record<Locale15, Translation> {
  const out = {} as Record<Locale15, Translation>;
  const locales = Object.keys(T) as Locale15[];
  for (const loc of locales) {
    const s = key.subject[loc] ?? key.subject.en;
    const kind = key.kind[loc] ?? key.kind.en;
    out[loc] = {
      title: T[loc].titlePat(s, key.n, key.days),
      description: T[loc].descPat(s, key.brands, kind),
      lede: T[loc].ledePat(key.n, key.days),
    };
  }
  return out;
}
