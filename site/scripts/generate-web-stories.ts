/**
 * Generate Google-Discover-eligible AMP Web Stories for pickly articles.
 *
 * Why: Pinterest API is stuck on Trial access (can't post Pins in production),
 * so this opens an alternative *visual discovery* channel we fully control —
 * Web Stories surface in Google Discover, Google Images and Search, with no
 * third-party account or approval wall. They reuse already-published, already-
 * localized data (per-locale OG image + article title/lede/product reviews), so
 * no new translation is needed.
 *
 * Output (static, copied verbatim into `out/` by `next build` → Cloudflare Pages):
 *   public/web-stories/<locale>/<slug>.html   one valid AMP story per article
 *   public/web-stories/index.html             crawlable hub linking every story
 *   public/web-stories/sitemap.xml            story sitemap (referenced from robots.ts)
 *
 * Run: npm run web-stories         (or: tsx scripts/generate-web-stories.ts)
 * Env: MAX_STORIES=60  LOCALES=en,ja
 */
import fs from "node:fs";
import path from "node:path";
import { listArticles } from "@/lib/articles/registry";
import { INDEXED_LOCALES } from "@/lib/i18n/locales";
import { ogImageUrl } from "@/lib/og";

const ROOT = path.resolve(__dirname, "..");
const ARTICLES_DIR = path.join(ROOT, "src/articles");
const OUT_DIR = path.join(ROOT, "public/web-stories");
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";
const LOGO = `${SITE_URL}/images/author-icon.png`; // 200x200 square raster (AMP publisher logo)

const MAX_STORIES = Number(process.env.MAX_STORIES ?? 60);
const LOCALES = (process.env.LOCALES?.split(",").map((s) => s.trim()).filter(Boolean) as string[]) ?? INDEXED_LOCALES;

// Chrome strings (the only text not already in the localized article data).
const LABELS: Record<string, { cta: string; tag: string; lang: string }> = {
  en: { cta: "Read the full comparison", tag: "Tested & ranked by pickly", lang: "en" },
  ja: { cta: "詳しい比較を読む", tag: "pickly が実際に比較", lang: "ja" },
  de: { cta: "Den vollständigen Vergleich lesen", tag: "Von pickly getestet & bewertet", lang: "de" },
  es: { cta: "Leer la comparación completa", tag: "Probado y clasificado por pickly", lang: "es" },
  fr: { cta: "Lire le comparatif complet", tag: "Testé et classé par pickly", lang: "fr" },
  it: { cta: "Leggi il confronto completo", tag: "Testato e classificato da pickly", lang: "it" },
  ru: { cta: "Читать полное сравнение", tag: "Тест и рейтинг от pickly", lang: "ru" },
  "pt-BR": { cta: "Ler a comparação completa", tag: "Testado e avaliado pela pickly", lang: "pt-br" },
};

function esc(s: string): string {
  return String(s ?? "").replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&#39;", '"': "&quot;" }[c] ?? c),
  );
}

function clip(s: string, n: number): string {
  const t = String(s ?? "").trim().replace(/\s+/g, " ");
  if (t.length <= n) return t;
  const cut = t.slice(0, n);
  const sp = cut.lastIndexOf(" ");
  return (sp > n * 0.6 ? cut.slice(0, sp) : cut).replace(/[,;:.\s]+$/, "") + "…";
}

type Msg = {
  title?: string;
  description?: string;
  lede?: string;
  pinDescription?: string;
  products?: Array<{ offerId?: string; badge?: string; review?: string }>;
};

function loadMsg(slug: string, locale: string): Msg | null {
  try {
    return JSON.parse(fs.readFileSync(path.join(ARTICLES_DIR, slug, "messages", `${locale}.json`), "utf-8"));
  } catch {
    return null;
  }
}

const AMP_BOILERPLATE =
  `<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>`;

// All styling via classes (AMP forbids inline style attributes). 4 rotating
// brand gradients give product pages visual variety without per-element styles.
const AMP_CSS = `
*{box-sizing:border-box}
amp-story{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Hiragino Sans","Noto Sans JP",sans-serif}
amp-story-grid-layer.scrim{background:linear-gradient(to top,rgba(0,0,0,.82) 0%,rgba(0,0,0,.30) 45%,rgba(0,0,0,0) 75%);justify-content:flex-end;padding:0 28px 64px}
.cover amp-img img{object-fit:cover}
.brand{color:#fb923c;font-weight:800;letter-spacing:.06em;text-transform:lowercase;font-size:20px;margin-bottom:10px}
h1{color:#fff;font-size:30px;line-height:1.2;font-weight:800;margin:0}
.tag{color:#fde9d6;font-size:15px;margin:14px 0 0;font-weight:600}
.pg{justify-content:center;align-items:flex-start;padding:0 30px}
.g0{background:linear-gradient(150deg,#7c2d12,#ea580c)}
.g1{background:linear-gradient(150deg,#9a3412,#f97316)}
.g2{background:linear-gradient(150deg,#78350f,#d97706)}
.g3{background:linear-gradient(150deg,#7c2d12,#b45309)}
.rank{display:inline-block;background:#fff;color:#9a3412;font-weight:800;font-size:14px;border-radius:999px;padding:6px 16px;margin-bottom:18px}
.badge{color:#fff;font-size:28px;font-weight:800;line-height:1.2;margin:0 0 16px}
.review{color:#fff8f1;font-size:18px;line-height:1.5;margin:0;font-weight:500}
.cta-bg{background:linear-gradient(160deg,#9a3412,#f97316);justify-content:center;align-items:center;text-align:center;padding:0 34px}
h2{color:#fff;font-size:26px;font-weight:800;line-height:1.25;margin:0 0 6px}
.cta-sub{color:#ffe9d6;font-size:16px;margin:18px 0 0}
amp-story-cta-layer a.cta{background:#fff;color:#9a3412;font-weight:800;font-size:17px;text-decoration:none;padding:14px 30px;border-radius:999px}
`;

function productPages(m: Msg, base: string): string {
  const items = (m.products ?? []).filter((p) => p?.review || p?.badge).slice(0, 3);
  return items
    .map((p, i) => {
      const rank = `#${i + 1}`;
      const badge = esc(clip(p.badge || "", 60));
      const review = esc(clip(p.review || "", 170));
      return `  <amp-story-page id="${base}-p${i + 1}">
    <amp-story-grid-layer template="vertical" class="pg g${i % 4}">
      <span class="rank">${rank}</span>
      ${badge ? `<p class="badge">${badge}</p>` : ""}
      ${review ? `<p class="review">${review}</p>` : ""}
    </amp-story-grid-layer>
  </amp-story-page>`;
    })
    .join("\n");
}

function buildStory(slug: string, locale: string, category: string, publishedAt: string, updatedAt: string): string | null {
  const m = loadMsg(slug, locale);
  if (!m?.title) return null;
  const L = LABELS[locale] ?? LABELS.en;
  const og = ogImageUrl(slug, locale);
  const title = esc(m.title);
  const desc = esc(clip(m.description || m.pinDescription || m.lede || m.title, 200));
  const tagline = esc(clip(m.pinDescription || m.lede || L.tag, 90));
  const articleUrl = `${SITE_URL}/${locale}/articles/${slug}/`;
  const storyUrl = `${SITE_URL}/web-stories/${locale}/${slug}.html`;

  const ld = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: m.title,
    image: [og],
    datePublished: publishedAt,
    dateModified: updatedAt || publishedAt,
    author: { "@type": "Organization", name: "pickly" },
    publisher: { "@type": "Organization", name: "pickly", logo: { "@type": "ImageObject", url: LOGO } },
    mainEntityOfPage: storyUrl,
  });

  return `<!doctype html>
<html ⚡ lang="${L.lang}">
<head>
<meta charset="utf-8">
<title>${title}</title>
<link rel="canonical" href="${storyUrl}">
<meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
<meta name="description" content="${desc}">
<script async src="https://cdn.ampproject.org/v0.js"></script>
<script async custom-element="amp-story" src="https://cdn.ampproject.org/v0/amp-story-1.0.js"></script>
<script type="application/ld+json">${ld}</script>
${AMP_BOILERPLATE}
<style amp-custom>${AMP_CSS}</style>
</head>
<body>
<amp-story standalone title="${title}" publisher="pickly" publisher-logo-src="${LOGO}" poster-portrait-src="${og}">
  <amp-story-page id="cover">
    <amp-story-grid-layer template="fill" class="cover">
      <amp-img layout="fill" src="${og}" alt="${title}"></amp-img>
    </amp-story-grid-layer>
    <amp-story-grid-layer template="vertical" class="scrim">
      <div class="brand">pickly</div>
      <h1>${title}</h1>
      <p class="tag">${tagline}</p>
    </amp-story-grid-layer>
  </amp-story-page>
${productPages(m, slug)}
  <amp-story-page id="more">
    <amp-story-grid-layer template="vertical" class="cta-bg">
      <div class="brand">pickly</div>
      <h2>${title}</h2>
      <p class="cta-sub">${esc(L.cta)} →</p>
    </amp-story-grid-layer>
    <amp-story-cta-layer>
      <a class="cta" href="${articleUrl}">${esc(L.cta)}</a>
    </amp-story-cta-layer>
  </amp-story-page>
</amp-story>
</body>
</html>`;
}

// ---- main ----
const articles = [...listArticles()]
  .filter((a) => a.publishedAt)
  .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
  .slice(0, MAX_STORIES);

fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

const generated: Array<{ slug: string; locale: string; url: string; title: string; og: string; updatedAt: string }> = [];

for (const a of articles) {
  const locales = LOCALES.filter((l) => (a.locales as string[]).includes(l));
  for (const locale of locales) {
    const html = buildStory(a.slug, locale, a.category, a.publishedAt, a.updatedAt || a.publishedAt);
    if (!html) continue;
    const dir = path.join(OUT_DIR, locale);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${a.slug}.html`), html);
    const m = loadMsg(a.slug, locale)!;
    generated.push({
      slug: a.slug,
      locale,
      url: `${SITE_URL}/web-stories/${locale}/${a.slug}.html`,
      title: m.title!,
      og: ogImageUrl(a.slug, locale),
      updatedAt: a.updatedAt || a.publishedAt,
    });
  }
}

// sitemap.xml (with image extension so Google Images picks up the posters)
const sm = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${generated
  .map(
    (g) => `  <url>
    <loc>${esc(g.url)}</loc>
    <lastmod>${new Date(g.updatedAt).toISOString().slice(0, 10)}</lastmod>
    <image:image><image:loc>${esc(g.og)}</image:loc></image:image>
  </url>`,
  )
  .join("\n")}
</urlset>`;
fs.writeFileSync(path.join(OUT_DIR, "sitemap.xml"), sm);

// crawlable hub
const byLocale = generated.reduce<Record<string, typeof generated>>((acc, g) => {
  (acc[g.locale] ??= []).push(g);
  return acc;
}, {});
const hub = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>pickly Web Stories — visual product comparisons</title>
<link rel="canonical" href="${SITE_URL}/web-stories/">
<meta name="description" content="Visual, swipeable product comparisons from pickly — tested and ranked across home, kitchen, fitness, beauty, tech and more.">
</head><body>
<h1>pickly Web Stories</h1>
${Object.entries(byLocale)
  .map(
    ([loc, items]) =>
      `<h2>${loc}</h2><ul>${items
        .map((g) => `<li><a href="${esc(g.url)}">${esc(g.title)}</a></li>`)
        .join("")}</ul>`,
  )
  .join("\n")}
</body></html>`;
fs.writeFileSync(path.join(OUT_DIR, "index.html"), hub);

console.log(`web-stories: generated ${generated.length} stories across ${Object.keys(byLocale).length} locales (${articles.length} articles, cap ${MAX_STORIES})`);
console.log(`  sitemap: ${SITE_URL}/web-stories/sitemap.xml`);
