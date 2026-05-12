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
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
