/**
 * 楽天アフィリリンクの中間リダイレクタ。/go/rakuten?u=<encoded hgc URL>
 *
 * なぜ挟むか (2026-08-23):
 *   楽天ASPで30日1,811クリック/成約0/¥0 という無効トラフィックを観測したが、
 *   従来リンクは hb.afl.rakuten.co.jp を直接指しており、クリックが我々の
 *   エッジを一切通らない = UA も国も測れず遮断もできなかった
 *   (memory: rakuten-clicks-are-invisible-to-our-edge)。
 *   ここを通すことで初めて「誰が踏んでいるか」が観測可能になる。
 *
 * 設計上の制約:
 *   - 成果計上を壊さないこと。hgc URL は一切書き換えず 302 でそのまま渡す。
 *   - KV は1クリック1書き込みにしない。1keyあたり1write/sec の制限に当たるし
 *     費用も無駄なので、日付×UA分類の粒度でカウンタに畳む。
 */
interface Env {
  ADMIN_KV?: KVNamespace;
}

/** 我々が発行した楽天リンクだけを通す。オープンリダイレクタにしないための門番。 */
const ALLOWED_HOSTS = new Set([
  "hb.afl.rakuten.co.jp",
  "hbb.afl.rakuten.co.jp",
]);

/**
 * UA をざっくり分類する。個々の UA 文字列を全部持つと KV のキーが際限なく
 * 増えるので、無効トラフィックの切り分けに要る粒度だけ残す。
 */
function classifyUa(ua: string): string {
  if (!ua) return "empty";
  const u = ua.toLowerCase();
  if (/bot|crawler|spider|slurp|bingpreview|headless|phantom|curl|wget|python-requests|go-http|java\/|okhttp|scrapy|axios|node-fetch/.test(u)) {
    return "bot";
  }
  if (/\b(iphone|ipad|android)\b/.test(u)) return "mobile";
  if (/mozilla\//.test(u)) return "desktop";
  return "other";
}

/** UTC日付。KVキーの粒度。 */
function utcDay(): string {
  return new Date().toISOString().slice(0, 10);
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const target = url.searchParams.get("u");

  // 行き先が無い/壊れている場合は楽天トップへ逃がす。読者を404で止めない。
  const fallback = "https://www.rakuten.co.jp/";
  let dest = fallback;
  if (target) {
    try {
      const parsed = new URL(target);
      if (parsed.protocol === "https:" && ALLOWED_HOSTS.has(parsed.hostname)) {
        dest = parsed.toString();
      }
    } catch {
      // 壊れたURLは fallback のまま
    }
  }

  // 計測。失敗しても遷移は絶対に止めない。
  if (env.ADMIN_KV) {
    const cf = (request as unknown as { cf?: { country?: string } }).cf;
    const ua = request.headers.get("user-agent") ?? "";
    const cls = classifyUa(ua);
    const country = cf?.country ?? "??";
    const key = `rakuten:clicks:${utcDay()}:${cls}:${country}`;
    context.waitUntil(
      (async () => {
        try {
          const prev = Number((await env.ADMIN_KV!.get(key)) ?? "0");
          // 90日で自動失効。掃除を人手に残さない。
          await env.ADMIN_KV!.put(key, String(prev + 1), { expirationTtl: 60 * 60 * 24 * 90 });
        } catch {
          // 計測の失敗は握りつぶす
        }
      })(),
    );
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: dest,
      // 中間ページを検索エンジンにもASPにも残さない
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "Referrer-Policy": "no-referrer-when-downgrade",
    },
  });
};
