/**
 * /admin/* に Basic 認証をかける Cloudflare Pages Function。
 *
 * なぜここか: サイトは output:"export" の静的書き出しなので Next 側で認証できない。
 * /admin 配下は静的HTMLも data エンドポイントも、必ずこの middleware を通る。
 *
 * ★ 認証情報が未設定なら **閉じる**(403)。fxea365 は「未設定なら課さない」に
 *   しているが、あちらは Supabase セッションが後段にある。こちらは Basic 認証が
 *   唯一の鍵なので、設定漏れが即ち全公開になる方に倒してはいけない。
 *
 * 環境変数(Cloudflare Pages > Settings > Environment variables):
 *   ADMIN_BASIC_USER / ADMIN_BASIC_PASS
 */
interface Env {
  ADMIN_BASIC_USER?: string;
  ADMIN_BASIC_PASS?: string;
}

/** タイミング攻撃を避けるため長さに依らず全文字を比較する。 */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const deny = (body: string, status: number, extra?: HeadersInit) =>
  new Response(body, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", ...extra },
  });

export const onRequest: PagesFunction<Env> = async (context) => {
  const user = context.env.ADMIN_BASIC_USER;
  const pass = context.env.ADMIN_BASIC_PASS;

  if (!user || !pass) {
    return deny("管理画面の認証情報(ADMIN_BASIC_USER / ADMIN_BASIC_PASS)が未設定です。", 403);
  }

  const header = context.request.headers.get("Authorization") ?? "";
  if (!header.startsWith("Basic ")) {
    return deny("認証が必要です。", 401, { "WWW-Authenticate": 'Basic realm="Pickly Admin", charset="UTF-8"' });
  }

  let decoded = "";
  try {
    decoded = atob(header.slice(6));
  } catch {
    return deny("認証ヘッダを解釈できません。", 400);
  }

  const sep = decoded.indexOf(":");
  const gotUser = sep < 0 ? decoded : decoded.slice(0, sep);
  const gotPass = sep < 0 ? "" : decoded.slice(sep + 1);

  if (!safeEqual(gotUser, user) || !safeEqual(gotPass, pass)) {
    return deny("ユーザー名またはパスワードが違います。", 401, {
      "WWW-Authenticate": 'Basic realm="Pickly Admin", charset="UTF-8"',
    });
  }

  const response = await context.next();
  // 管理画面は検索にもキャッシュにも載せない。
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "no-store");
  headers.set("X-Robots-Tag", "noindex, nofollow");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
};
