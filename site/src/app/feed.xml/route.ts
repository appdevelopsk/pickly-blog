import { listArticles } from "@/lib/articles/registry";
import { loadArticleCardMeta } from "@/lib/i18n/loader";
import { ogImageUrl } from "@/lib/og";

export const dynamic = "force-static";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";

function esc(s: string): string {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c] ?? c),
  );
}

// RSS feed of the latest English articles — lets aggregators (Flipboard, feed
// readers) and RSS→social automation (Buffer/IFTTT/Zapier) pick up new posts,
// adding distribution channels beyond Pinterest/search.
export function GET() {
  const articles = [...listArticles()]
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .slice(0, 50);

  const items = articles
    .map((a) => {
      const { title, description } = loadArticleCardMeta(a.slug, "en");
      const url = `${SITE_URL}/en/articles/${a.slug}/`;
      const date = new Date(a.publishedAt).toUTCString();
      const img = ogImageUrl(a.slug, "en");
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
    <title>Pickly — Product Reviews &amp; Comparisons</title>
    <link>${SITE_URL}/en/</link>
    <description>Independent product comparisons, reviews, and buyer's guides across home, kitchen, fitness, food, beauty, fashion, finance, and tech.</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
