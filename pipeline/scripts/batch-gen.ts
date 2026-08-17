/**
 * 記事生成 + 画像生成の統合スクリプト (2026-06-13).
 * 1. meta.ts + 17ロケールJSON生成
 * 2. catalog-additions.ts にオファー追記
 * 3. registry.ts に import/エントリ追記
 * 4. fetch-product-images.ts で商品画像URL取得
 * 5. gen-pin-images.ts で Pinterestピン画像(1000x1500)生成
 *
 * Run: npx tsx pipeline/scripts/batch-gen.ts
 *      SKIP_IMAGES=1 npx tsx pipeline/scripts/batch-gen.ts  # 画像スキップ
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { ARTICLES as ALL_ARTICLES, NEW_OFFERS, type ArticleDef } from "./batch-articles";

/**
 * ★既存記事を巻き戻さないための絞り込み。
 * このスクリプトは meta.ts と17ロケールJSONを**上書き**するので、無指定で走らせると
 * 生成後に加えた手直し(架空の一次テスト記述の一括修正 2,290件など)が全部消える。
 * 新バッチを流すときは ONLY_SLUGS でそのバッチのslugだけに限定する。
 *   ONLY_SLUGS=best-foo-2026,best-bar-2026 npx tsx pipeline/scripts/batch-gen.ts
 */
const ONLY = (process.env.ONLY_SLUGS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const ARTICLES = ONLY.length ? ALL_ARTICLES.filter((a) => ONLY.includes(a.slug)) : ALL_ARTICLES;
if (ONLY.length && ARTICLES.length !== ONLY.length) {
  throw new Error(`ONLY_SLUGS に一致しない slug があります: ${ONLY.filter((s) => !ARTICLES.some((a) => a.slug === s)).join(", ")}`);
}

const ROOT = path.resolve(__dirname, "../..");
const ARTICLES_DIR = path.join(ROOT, "site/src/articles");
const CATALOG_ADDITIONS = path.join(ROOT, "site/src/lib/affiliates/catalog-additions.ts");
const REGISTRY_PATH = path.join(ROOT, "site/src/lib/articles/registry.ts");

const PUBLISHED_AT = "2026-05-19";

function camelCase(slug: string): string {
  return slug
    .split("-")
    .map((p, i) => (i === 0 ? p : p[0].toUpperCase() + p.slice(1)))
    .join("");
}

function writeMeta(article: ArticleDef) {
  const dir = path.join(ARTICLES_DIR, article.slug);
  fs.mkdirSync(dir, { recursive: true });
  const offerIds = article.offers.map((o) => `"${o.id}"`).join(", ");
  const content = `import type { ArticleMeta } from "@/lib/articles/types";
import { ALL_LOCALES } from "@/lib/i18n/locales";

export const meta: ArticleMeta = {
  slug: "${article.slug}",
  type: "comparison",
  category: "${article.category}",
  offerIds: [${offerIds}],
  publishedAt: "${PUBLISHED_AT}",
  updatedAt: "${PUBLISHED_AT}",
  locales: [...ALL_LOCALES],
  ogImage: "auto",
};
`;
  fs.writeFileSync(path.join(dir, "meta.ts"), content);
}

function writeMessages(article: ArticleDef) {
  const dir = path.join(ARTICLES_DIR, article.slug, "messages");
  fs.mkdirSync(dir, { recursive: true });

  // EN — full content
  const en = {
    title: article.en.title,
    description: article.en.description,
    lede: article.en.lede,
    methodology: article.en.methodology,
    sections: article.en.sections,
    faqs: article.en.faqs,
    products: article.en.products,
    offerNotes: article.en.offerNotes,
    pinDescription: article.en.pinDescription,
  };
  fs.writeFileSync(path.join(dir, "en.json"), JSON.stringify(en, null, 2));

  // JA — full content
  const ja = {
    title: article.ja.title,
    description: article.ja.description,
    lede: article.ja.lede,
    methodology: article.ja.methodology,
    sections: article.ja.sections,
    faqs: article.ja.faqs,
    products: article.ja.products,
    offerNotes: article.ja.offerNotes,
    pinDescription: article.ja.pinDescription,
  };
  fs.writeFileSync(path.join(dir, "ja.json"), JSON.stringify(ja, null, 2));

  // Other 15 locales — minimal: title/description/lede only.
  // Missing keys fall back to English at runtime.
  const otherLocales = ["zh-CN", "zh-TW", "ko", "es", "pt-BR", "fr", "de", "it", "ru", "ar", "hi", "id", "th", "vi", "tr"] as const;
  for (const locale of otherLocales) {
    const t = article.translations[locale];
    const data = { title: t.title, description: t.description, lede: t.lede };
    fs.writeFileSync(path.join(dir, `${locale}.json`), JSON.stringify(data, null, 2));
  }
}

function appendOffers() {
  let src = fs.readFileSync(CATALOG_ADDITIONS, "utf8");
  // Find existing IDs to avoid duplicates.
  const existing = new Set<string>();
  for (const m of src.matchAll(/"id":\s*"([a-z0-9-]+)"/g)) existing.add(m[1]);

  const toAdd = NEW_OFFERS.filter((o) => !existing.has(o.id));
  if (toAdd.length === 0) {
    console.log("→ no new offers to add");
    return;
  }

  // Replace the closing `];` with new offers + `];`
  const insertion = toAdd
    .map((o) => {
      const obj = {
        id: o.id,
        imageUrl: "",
        priceMin: o.priceMin,
        priceMax: o.priceMax,
        category: o.category,
        badge: o.badge,
        name: { en: o.nameEn, ja: o.nameJa },
        description: { en: o.descEn, ja: o.descJa },
        links: [
          {
            network: "direct",
            productId: o.url,
            markets: ["global"],
            approved: false,
          },
        ],
      };
      return "  " + JSON.stringify(obj, null, 2).replace(/\n/g, "\n  ");
    })
    .join(",\n");

  // ★末尾要素に既にカンマが付いている場合があるので、閉じ括弧の直前のカンマを一度吸収してから足す。
  //   吸収しないと `},` + `,` で穴(sparse array)が開き、CATALOG に undefined が混ざって
  //   catalog.ts の `OVERRIDES[offer.id]` が実行時に落ちる。
  // ★置換文字列に insertion を直接埋めてはいけない。価格は "$180" のような形なので
  //   String.replace の置換文字列中では `$1` が**キャプチャ参照**として解釈され、
  //   " as unknown as AffiliateOffer[]80" のような壊れた値が書き込まれる(2026-08-17に発覚)。
  //   関数形式なら置換文字列の特殊記号解釈が起きない。
  src = src.replace(
    /,?\s*\n\](\s+as[^;]+)?;\s*$/,
    (_m, tail: string | undefined) => `,\n${insertion}\n]${tail ?? ""};\n`,
  );
  fs.writeFileSync(CATALOG_ADDITIONS, src);
  console.log(`→ added ${toAdd.length} new offers to catalog-additions.ts`);
}

function patchRegistry() {
  let src = fs.readFileSync(REGISTRY_PATH, "utf8");

  // Build import statements
  const existingImports = new Set(
    Array.from(src.matchAll(/import \{ meta as (\w+) \} from/g)).map((m) => m[1])
  );

  const imports: string[] = [];
  const refs: string[] = [];
  for (const a of ARTICLES) {
    const ref = camelCase(a.slug);
    if (existingImports.has(ref)) continue;
    imports.push(`import { meta as ${ref} } from "@/articles/${a.slug}/meta";`);
    refs.push(ref);
  }

  if (imports.length === 0) {
    console.log("→ registry already up to date");
    return;
  }

  // Insert imports after the last existing import line
  const lastImport = src.lastIndexOf("import { meta as ");
  const lastImportEnd = src.indexOf("\n", lastImport);
  src = src.slice(0, lastImportEnd + 1) + imports.join("\n") + "\n" + src.slice(lastImportEnd + 1);

  // Append refs to REGISTRY array (before closing `];`)
  src = src.replace(/(const REGISTRY: ArticleMeta\[\] = \[[\s\S]*?), ([a-zA-Z0-9_, ]+)\];/, (_m, head, tail) => {
    return `${head}, ${tail}, ${refs.join(", ")}];`;
  });

  fs.writeFileSync(REGISTRY_PATH, src);
  console.log(`→ added ${imports.length} entries to registry.ts`);
}

function main() {
  console.log(`→ generating ${ARTICLES.length} articles (${NEW_OFFERS.length} offers)`);
  appendOffers();
  for (const a of ARTICLES) {
    writeMeta(a);
    writeMessages(a);
  }
  patchRegistry();

  if (process.env.SKIP_IMAGES === "1") {
    console.log("→ SKIP_IMAGES=1 — 画像生成スキップ");
    console.log("done");
    return;
  }

  const siteDir = path.join(ROOT, "site");

  // Step 4: 商品画像URLを取得（空の imageUrl を埋める）
  console.log("\n→ 商品画像URLをフェッチ中...");
  try {
    execSync("npx tsx scripts/fetch-product-images.ts", { cwd: siteDir, stdio: "inherit" });
  } catch {
    console.error("  ⚠ fetch-product-images 失敗 — 後で手動実行: cd site && npx tsx scripts/fetch-product-images.ts");
  }

  // Step 5: Pinterest ピン画像を生成（新規記事は未承認なので --all で hasApprovedAds をバイパス）
  const slugs = ARTICLES.map((a) => a.slug);
  console.log(`\n→ Pinterestピン画像を生成中 (${slugs.length} 記事 × en,ja,de,fr,es)...`);
  try {
    execSync(
      `npx tsx scripts/gen-pin-images.ts --all --locales en,ja,de,fr,es --force`,
      { cwd: siteDir, stdio: "inherit" },
    );
  } catch {
    console.error("  ⚠ gen-pin-images 失敗 — 後で手動実行: cd site && npx tsx scripts/gen-pin-images.ts --all --force");
  }

  console.log("\ndone");
}

main();
