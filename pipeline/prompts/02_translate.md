# 02_translate — Translate article to remaining 16 locales

After `01_write` produced `site/src/articles/<slug>/messages/en.json`, generate the same structure for **every other active locale** (16 files).

## Hard rules

1. **No machine-translation feel.** The translation should read as if a native speaker rewrote the article — same facts, idiomatic phrasing.
2. **Localize examples, currency, and units.**
   - Pricing: convert $ to ¥ (with current 2026 rates ~¥150/USD), € for EU langs, ₹ for hi, R$ for pt-BR, ₩ for ko, ฿ for th
   - Comparisons: replace US-specific brands/sites with locale-appropriate alternatives where the article references them generically
   - Dates: use locale conventions (ja: 2026年5月7日, de: 7. Mai 2026, etc.)
3. **Keep all keys identical** — only values change. The `offerNotes` keys (= offer IDs) stay English.
4. **Numbers and product names** stay accurate — do not translate brand names (NordVPN stays NordVPN in all locales except where the brand has an official localized name).
5. **Pin description** must be re-written, not translated literally — emotional hooks differ per culture.

## Per-locale tone hints

- **ja**: 丁寧体（です・ます調）、「結論」のような直接表現を避け、「実際に〜してみた」系のニュアンス
- **zh-CN**: 简洁、数据先行、避免过度修辞
- **zh-TW**: 繁體、語感稍微正式
- **ko**: 격식체基本、商品レビューは多少カジュアルでも可
- **es**: España基準（vosotros避ける、tú中心）。LatAm展開時は別ファイル化検討
- **pt-BR**: Brasil基準、informal você
- **de**: Sie / du は商品ジャンル次第。テック系はdu可
- **fr**: vous基本、価格は €
- **it**: Lei vs tu は商品次第
- **ru**: вы基本、価格は €or USD（ルーブル不安定なため）
- **ar**: RTL、Modern Standard Arabic（MSA）。価格は USD or local
- **hi**: Hindi-Roman ではなく Devanagari スクリプト
- **id**: 標準インドネシア語、Bahasa Gaul は使わない
- **th**: ภาษาราชการ、敬語の使い分け注意
- **vi**: 標準ベトナム語、phổ thông
- **tr**: 標準トルコ語、商品レビューは多少カジュアルでも可

## Translation workflow

For each locale:

1. Read `messages/en.json` as source of truth
2. Translate field-by-field, preserving JSON structure
3. Replace currencies/units/examples with locale-appropriate equivalents
4. Re-write `pinDescription` from scratch using the cultural hook angle (do NOT literal-translate)
5. Save to `messages/<locale>.json`

## Quality gate

Before considering a locale done:

- [ ] All keys present (compare with en.json)
- [ ] No untranslated English strings remaining (except brand names, offer IDs)
- [ ] Currency converted
- [ ] Length within ±20% of English (catches under-translation)
- [ ] No machine-translation idioms ("at the end of the day" → 直訳「一日の終わりに」のような誤訳を排除)
