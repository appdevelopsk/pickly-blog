/**
 * 管理ダッシュボードのデータを返す。/admin/data
 *
 * 中身は scripts/admin-metrics.mjs が日次で KV に PUT したもの。
 * 売上の数字を公開リポジトリに置かないための経路なので、ここが唯一の読み出し口。
 * 認証は functions/admin/_middleware.ts が先に済ませている。
 */
interface Env {
  ADMIN_KV?: KVNamespace;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  if (!context.env.ADMIN_KV) {
    return Response.json(
      { error: "KV バインディング ADMIN_KV が未設定です。Pages > Settings > Functions > KV bindings を確認してください。" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }

  const raw = await context.env.ADMIN_KV.get("metrics:latest");
  if (!raw) {
    return Response.json(
      { error: "まだデータがありません。ローカルで `node scripts/admin-metrics.mjs` を実行してください。" },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }

  return new Response(raw, {
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
};
