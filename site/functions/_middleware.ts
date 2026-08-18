/**
 * Cloudflare Pages Function — geo market cookie
 * Runs at edge before serving static assets.
 * Sets x-market cookie based on visitor's country so the client-side
 * AffiliateLink component can pick the correct regional Amazon store.
 */

const GEO_MARKET: Record<string, string> = {
  GB: "UK",
  CA: "CA",
};

/**
 * ★*.pages.dev を pickly.blog へ 301 する (2026-08-18)
 *
 * なぜ: Cloudflare Pages の本番URL `pickly-blog.pages.dev` が
 * `Allow: /` + `<meta name="robots" content="index, follow">` のまま公開され、
 * **5,634 URL 分の完全ミラー**として pickly.blog と競合していた。
 * canonical は正しく pickly.blog を指しているが、それは防御にならない:
 * 同型の appdevelopsk.github.io では GSC の URL Inspection で
 * Google が canonical を無視してミラー側を選んでいた実績がある。
 *
 * canonical(ヒント)ではなく 301(命令)で潰す。こちらは蓄積した評価も統合できる。
 * ここで返すのは静的アセットより前なので、sitemap も画像も一律で本番へ寄る。
 *
 * 副作用: プレビューデプロイの *.pages.dev も本番へ飛ぶ。動作確認は
 * `wrangler pages dev` かローカルビルドで行うこと。
 */
const CANONICAL_HOST = "pickly.blog";

export async function onRequest(context: {
  request: Request;
  next: () => Promise<Response>;
}): Promise<Response> {
  const url = new URL(context.request.url);
  if (url.hostname.endsWith(".pages.dev")) {
    url.hostname = CANONICAL_HOST;
    url.protocol = "https:";
    url.port = "";
    return Response.redirect(url.toString(), 301);
  }

  const response = await context.next();

  const country = (context.request as unknown as { cf?: { country?: string } }).cf?.country;
  const market = country ? GEO_MARKET[country] : undefined;

  if (!market) return response;

  const existing = context.request.headers.get("cookie") ?? "";
  if (existing.includes("x-market=")) return response;

  const headers = new Headers(response.headers);
  headers.append(
    "Set-Cookie",
    `x-market=${market}; Path=/; SameSite=Lax; Secure; Max-Age=86400`,
  );
  // 本文を持てないステータスに body を渡すと TypeError になり、Pages は 500 を返す。
  // クローラは条件付きリクエストで 304 を受け取るので、ここは踏み得る。
  const NO_BODY = [101, 204, 205, 304];
  if (NO_BODY.includes(response.status)) {
    return new Response(null, { status: response.status, statusText: response.statusText, headers });
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
