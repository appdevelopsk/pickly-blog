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

export async function onRequest(context: {
  request: Request;
  next: () => Promise<Response>;
}): Promise<Response> {
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
