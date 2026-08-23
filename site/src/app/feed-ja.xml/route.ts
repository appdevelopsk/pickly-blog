import { listArticles } from "@/lib/articles/registry";
import { loadArticleCardMeta, isArticleBodyTranslated } from "@/lib/i18n/loader";
import { ogImageUrl } from "@/lib/og";

export const dynamic = "force-static";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";

function esc(s: string): string {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c] ?? c),
  );
}

export function GET() {
  const articles = [...listArticles()]
    .filter((a) => isArticleBodyTranslated(a.slug, "ja"))
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .slice(0, 50);

  const items = articles
    .map((a) => {
      const { title, description } = loadArticleCardMeta(a.slug, "ja");
      const url = `${SITE_URL}/ja/articles/${a.slug}/`;
      const date = new Date(a.publishedAt).toUTCString();
      const img = ogImageUrl(a.slug, "ja");
      return `    <item>
      <title>${esc(title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${date}</pubDate>
      <description>${esc(description)}</description>
      <enclosure url="${esc(img)}" type="image/png" />
      <media:content url="${esc(img)}" type="image/png" medium="image" width="1000" height="1500" />
      <media:thumbnail url="${esc(img)}" width="1000" height="1500" />
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Pickly — 製品レビュー・比較</title>
    <link>${SITE_URL}/ja/</link>
    <description>家電・キッチン・フィットネス・食品・美容・ファッション・金融・テックの比較レビューと購入ガイド。</description>
    <language>ja</language>
    <atom:link href="${SITE_URL}/feed-ja.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
