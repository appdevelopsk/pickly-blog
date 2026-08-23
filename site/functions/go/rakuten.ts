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

const handler: PagesFunction<Env> = async (context) => {
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

  const cf = (request as unknown as { cf?: { country?: string; colo?: string } }).cf;
  const ua = request.headers.get("user-agent") ?? "";
  const cls = classifyUa(ua);

  // 自己申告で bot と分かる UA はアフィリIDを外して楽天トップへ逃がす (2026-08-23)。
  // hgc に bot を流すと「クリックだけ増えて成約0」の無効トラフィックとして
  // ASP 側に積み上がる。読者でないものに成果計上リンクを踏ませる理由が無い。
  // (UA を偽装する bot はここでは止まらない。それは KV の国×UA 集計で追う)
  if (cls === "bot") dest = fallback;

  // 計測。失敗しても遷移は絶対に止めない。
  if (env.ADMIN_KV) {
    const country = cf?.country ?? "??";
    // ★ キーに colo を含める。KV の get→put は原子的でなく、別 colo の put は
    //   最大60秒見えない。colo を跨いで同じキーを足し込むと互いに上書きして
    //   過少計上する。colo ごとに分けて集計側(admin-metrics)で合算する。
    const key = `rakuten:clicks:${utcDay()}:${cls}:${country}:${cf?.colo ?? "??"}`;
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

// GET だけ定義すると HEAD は Pages の静的フォールバックに落ちて 404 になる
// (2026-08-23 本番実測)。リンクチェッカ/プレビュー取得が 404 を見てリンク切れ
// 扱いにしないよう HEAD も同じ挙動にする。
export const onRequestGet = handler;
export const onRequestHead = handler;
