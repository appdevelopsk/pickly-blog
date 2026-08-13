import Dashboard from "./Dashboard";

/**
 * /admin — 利益の見える化。
 *
 * 静的書き出しなのでこのページ自体は空の器で、数字は実行時に /admin/data
 * (Cloudflare Pages Function → KV)から取る。認証は functions/admin/_middleware.ts。
 */
export default function AdminPage() {
  return <Dashboard />;
}
