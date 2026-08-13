"use client";

import { useEffect, useMemo, useState } from "react";

/* ── 型 ─────────────────────────────────────────────────────────────────────
   scripts/admin-metrics.mjs が KV に入れる形。片方だけ直すとずれるので注意。 */
type RevenueRow = {
  source: string; connected: boolean; currency: string;
  revenue: number | null; revenueJpy: number | null;
  clicks: number | null; orders: number | null; asOf?: string; note?: string;
  /** 契約はあるがリンクを1本も貼っていない = 売上が本当に0。直す対象ではない。 */
  dormant?: boolean;
};
/** データ元の管理画面。セッションが切れたら人間がここへ行くしか復旧手段が無い。 */
type LoginRow = { key: string; label: string; url: string; state: "ok" | "login-required" | "error" | "unknown"; checkedAt?: string | null; note?: string };
type FunnelStep = { key: string; label: string; value: number; rateFromPrev?: number | null; note?: string };
type ArticleRow = {
  path: string; locale: string; views: number | null; clicks: number;
  clicksPerView: number | null; estRevenueJpy: number;
};
type Metrics = {
  generatedAt: string;
  period: { start: string; end: string; days: number };
  fx: { rates: Record<string, number>; date: string | null; source: string };
  profit: { revenueJpy: number; profitJpy: number; connectedSources: number; totalSources: number };
  revenue: RevenueRow[];
  logins?: LoginRow[];
  funnel: { steps: FunnelStep[]; leak: string | null };
  articles: ArticleRow[];
  localeClicks: { domain: string; clicks: number; market: string | null }[];
  traffic: {
    sessions: number; realSessions: number; selfSessions: number; users: number;
    pageViews: number; avgEngagementSec: number; daily: { date: string; sessions: number; users: number }[];
  };
  warnings: string[];
};

/* ── 色 ─────────────────────────────────────────────────────────────────────
   dataviz の validate_palette で light/dark とも全チェック合格を確認済み。
   light: #2a78d6 #eb6834 #1baf7a #8a63d2 / dark: #4a97e8 #e06f36 #1fa876 #8f6fd0
   系列は基本1本なので、色はアクセント1色＋状態色として使う。 */
const ACCENT = "var(--pk-accent)";

const yen = (n: number | null | undefined) =>
  n == null ? "—" : `¥${Math.round(n).toLocaleString("ja-JP")}`;
const num = (n: number | null | undefined) =>
  n == null ? "—" : n.toLocaleString("ja-JP");

/* ── 部品 ──────────────────────────────────────────────────────────────── */

function Card({ title, children, sub }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-[var(--pk-line)] bg-[var(--pk-card)] p-5">
      <h2 className="text-sm font-semibold text-[var(--pk-ink)]">{title}</h2>
      {sub && <p className="mt-1 text-xs text-[var(--pk-muted)]">{sub}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** 見出しの数字。単独で意味が立つのでチャートにしない。 */
function Hero({ label, value, tone, note }: { label: string; value: string; tone?: "good" | "bad"; note?: string }) {
  const color = tone === "bad" ? "var(--pk-critical)" : tone === "good" ? "var(--pk-good)" : "var(--pk-ink)";
  return (
    <div>
      <div className="text-xs text-[var(--pk-muted)]">{label}</div>
      <div className="mt-1 text-3xl font-semibold tabular-nums" style={{ color }}>{value}</div>
      {note && <div className="mt-1 text-xs text-[var(--pk-muted)]">{note}</div>}
    </div>
  );
}

/**
 * ファネル。段ごとの絶対数と、前段からの通過率を横棒で出す。
 * 幅は最大段を基準にした比率。数値は全段に直接ラベルするので色に頼らない。
 */
function Funnel({ steps, leak }: { steps: FunnelStep[]; leak: string | null }) {
  const max = Math.max(...steps.map((s) => s.value), 1);
  return (
    <div>
      <ul className="space-y-3">
        {steps.map((s) => (
          <li key={s.key}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm text-[var(--pk-ink)]">{s.label}</span>
              <span className="tabular-nums text-sm font-semibold text-[var(--pk-ink)]">
                {num(s.value)}
                {s.rateFromPrev != null && (
                  <span className="ml-2 font-normal text-[var(--pk-muted)]">前段の {s.rateFromPrev}%</span>
                )}
              </span>
            </div>
            <div className="mt-1 h-2.5 w-full rounded-full bg-[var(--pk-track)]">
              <div
                className="h-2.5 rounded-full"
                style={{ width: `${Math.max((s.value / max) * 100, s.value > 0 ? 1.5 : 0)}%`, background: ACCENT }}
              />
            </div>
            {s.note && <p className="mt-1 text-xs text-[var(--pk-muted)]">{s.note}</p>}
          </li>
        ))}
      </ul>
      {leak && (
        <p className="mt-4 rounded-lg border border-[var(--pk-warn)] bg-[var(--pk-warn-bg)] p-3 text-xs leading-relaxed text-[var(--pk-ink)]">
          ⚠ {leak}
        </p>
      )}
    </div>
  );
}

/** 日次セッションの折れ線。系列1本なので凡例は置かず、見出しが系列名を兼ねる。 */
function Sessions({ daily }: { daily: { date: string; sessions: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 720, H = 180, PAD = { t: 12, r: 12, b: 24, l: 40 };
  if (daily.length < 2) return <p className="text-sm text-[var(--pk-muted)]">データが足りません。</p>;

  const first = daily[0]!;
  const last = daily[daily.length - 1]!;
  const max = Math.max(...daily.map((d) => d.sessions), 1);
  // 1/2/5×10^n で切りのいい上限にする。軸が読める数字になる。
  const nice = (v: number) => {
    const e = 10 ** Math.floor(Math.log10(v));
    return [1, 2, 5, 10].map((m) => m * e).find((c) => c >= v) ?? 10 * e;
  };
  const top = nice(max);
  const x = (i: number) => PAD.l + (i / (daily.length - 1)) * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + (1 - v / top) * (H - PAD.t - PAD.b);
  const path = daily.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.sessions).toFixed(1)}`).join(" ");
  const active = hover != null ? daily[hover] : null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="日次セッション">
        {[0, top / 2, top].map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke="var(--pk-grid)" strokeWidth="1" />
            <text x={PAD.l - 6} y={y(v) + 4} textAnchor="end" fontSize="11" fill="var(--pk-muted)">{v}</text>
          </g>
        ))}
        <path d={path} fill="none" stroke={ACCENT} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {active && <circle cx={x(hover!)} cy={y(active.sessions)} r="4.5" fill={ACCENT} stroke="var(--pk-card)" strokeWidth="2" />}
        <text x={PAD.l} y={H - 6} fontSize="11" fill="var(--pk-muted)">{first.date}</text>
        <text x={W - PAD.r} y={H - 6} textAnchor="end" fontSize="11" fill="var(--pk-muted)">{last.date}</text>
        {/* 当たり判定はマークより大きく取る */}
        {daily.map((d, i) => (
          <rect
            key={d.date} x={x(i) - 8} y={PAD.t} width="16" height={H - PAD.t - PAD.b}
            fill="transparent" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>
      <p className="mt-1 h-4 text-xs text-[var(--pk-muted)]">
        {active ? `${active.date} — ${num(active.sessions)} セッション` : "点にカーソルを合わせると日付ごとの数字が出ます"}
      </p>
    </div>
  );
}

/** 大きさ比較の横棒。単一の量なので1色。 */
function BarList({ rows }: { rows: { label: string; value: number; note?: string; dead?: boolean }[] }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[minmax(0,11rem)_1fr_auto] items-center gap-3">
          <span className="truncate text-sm text-[var(--pk-ink)]" title={r.label}>
            {r.label}
            {/* 1円にならない行き先は棒の長さだけでは分からない。上位に居ると「よく押されている＝良い」と読み違える。 */}
            {r.note && (
              <span className={`ml-2 rounded px-1.5 py-0.5 text-[10px] ${r.dead ? "text-[var(--pk-critical)]" : "text-[var(--pk-muted)]"} bg-[var(--pk-track)]`}>
                {r.note}
              </span>
            )}
          </span>
          <span className="h-2.5 rounded-full bg-[var(--pk-track)]">
            <span
              className="block h-2.5 rounded-full"
              style={{ width: `${(r.value / max) * 100}%`, background: r.dead ? "var(--pk-critical)" : ACCENT }}
            />
          </span>
          <span className="tabular-nums text-sm text-[var(--pk-ink)]">{num(r.value)}</span>
        </li>
      ))}
    </ul>
  );
}

/* ── 本体 ──────────────────────────────────────────────────────────────── */

export default function Dashboard() {
  const [data, setData] = useState<Metrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/admin/data", { cache: "no-store" })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`);
        return j as Metrics;
      })
      .then(setData)
      .catch((e) => setError(String(e.message)));
  }, []);

  /**
   * クリック先を「1円になるか」で色分けする。
   * 撤去済みの Skimlinks が28日窓では今も最多(全クリックの4割)で、素の棒グラフだと
   * 一番稼いでいる行き先に見えてしまう。実際は無効化されたアカウントへの垂れ流し。
   */
  const DEAD_DOMAINS: Record<string, string> = {
    "go.skimresources.com": "無効(2026-08-04撤去)",
  };
  const UNMEASURED_DOMAINS = ["rakuten.co.jp", "moshimo.com", "a8.net"];
  const domainRows = useMemo(
    () =>
      (data?.localeClicks ?? []).slice(0, 10).map((d) => {
        const dead = DEAD_DOMAINS[d.domain];
        if (dead) return { label: d.domain, value: d.clicks, note: dead, dead: true };
        if (d.market) return { label: d.domain, value: d.clicks };
        if (UNMEASURED_DOMAINS.some((h) => d.domain.includes(h)))
          return { label: d.domain, value: d.clicks, note: "報酬あり・売上未計測" };
        return { label: d.domain, value: d.clicks, note: "タグ無し=無報酬", dead: true };
      }),
    [data],
  );

  if (error) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <h1 className="text-lg font-semibold">データを読み込めませんでした</h1>
        <p className="mt-3 rounded-lg border border-[var(--pk-line)] p-4 text-sm">{error}</p>
      </main>
    );
  }
  if (!data) return <main className="p-8 text-sm text-[var(--pk-muted)]">読み込み中…</main>;

  const { profit, period } = data;
  const unknownSources = data.revenue.filter((r) => !r.connected).length;

  return (
    <main className="mx-auto max-w-6xl p-6 sm:p-8">
      <Style />
      <header className="mb-6">
        <h1 className="text-xl font-semibold">Pickly 利益ダッシュボード</h1>
        <p className="mt-1 text-xs text-[var(--pk-muted)]">
          集計期間 {period.start} 〜 {period.end}（{period.days}日） / 更新 {new Date(data.generatedAt).toLocaleString("ja-JP")}
          {" / "}為替 {data.fx.source}{data.fx.date ? ` (${data.fx.date})` : ""}
        </p>
      </header>

      {/* 見えていないものを最初に言う。数字を実態より良く見せないため。 */}
      {data.warnings.length > 0 && (
        <div className="mb-6 rounded-xl border border-[var(--pk-warn)] bg-[var(--pk-warn-bg)] p-4">
          <h2 className="text-sm font-semibold">この数字の穴（{data.warnings.length}件）</h2>
          <ul className="mt-2 space-y-1 text-xs leading-relaxed text-[var(--pk-ink)]">
            {data.warnings.map((w) => <li key={w}>・{w}</li>)}
          </ul>
        </div>
      )}

      {/* 固定費(ドメイン代のみ)は誤差なので表示しない。ここの「利益」= アフィリ報酬の合計。 */}
      <div className="mb-6 rounded-xl border border-[var(--pk-line)] bg-[var(--pk-card)] p-5">
        <Hero label={`利益（${period.days}日）`} value={yen(profit.profitJpy)}
          tone={profit.profitJpy > 0 ? "good" : undefined}
          note={unknownSources > 0
            ? `接続できている収益源 ${profit.connectedSources}/${profit.totalSources}・残り${unknownSources}件は「不明」であって0ではない`
            : `接続できている収益源 ${profit.connectedSources}/${profit.totalSources}`} />
      </div>

      {data.logins && data.logins.length > 0 && (
        <div className="mb-4">
          <Card title="データ元へのログイン" sub="収益APIは存在せず、専用プロファイルのChromeでダッシュボードを読んでいる。切れたらここから入り直す。">
            <ul className="flex flex-wrap gap-2 text-sm">
              {data.logins.map((l) => (
                <li key={l.key}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--pk-line)] px-3 py-2 hover:border-[var(--pk-accent)]"
                  >
                    <span aria-hidden className={`h-2 w-2 rounded-full ${l.state === "ok" ? "bg-[var(--pk-good)]" : l.state === "login-required" ? "bg-[var(--pk-critical)]" : "bg-[var(--pk-muted)]"}`} />
                    <span>{l.label}</span>
                    <span className="text-[11px] text-[var(--pk-muted)]">
                      {l.state === "ok" ? "ログイン中" : l.state === "login-required" ? "要ログイン" : l.state === "error" ? "取得エラー" : "状態不明"}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] leading-snug text-[var(--pk-muted)]">
              ★ここのリンクは普段のブラウザで開く。スクレイプが使うのは専用プロファイル
              <code className="mx-1">~/.chrome-amazon</code>
              なので、そこでサインインしないと数字は戻らない:
              <code className="ml-1 break-all">{'"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --user-data-dir=$HOME/.chrome-amazon <URL>'}</code>
            </p>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="アフィリエイトファネル" sub="どこで落ちているか。段の下ほど実際のお金に近い。">
          <Funnel steps={data.funnel.steps} leak={data.funnel.leak} />
        </Card>

        <Card title="収益源ごとの売上" sub="「未接続」は売上0ではなく取得できていないという意味。「休眠」はリンクを貼っていないので売上が本当に0。">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--pk-line)] text-left text-xs text-[var(--pk-muted)]">
                  <th className="py-2 pr-3 font-medium">収益源</th>
                  <th className="py-2 pr-3 font-medium">通貨</th>
                  <th className="py-2 pr-3 text-right font-medium">売上</th>
                  <th className="py-2 pr-3 text-right font-medium">円換算</th>
                  <th className="py-2 pr-3 text-right font-medium">クリック</th>
                  <th className="py-2 text-right font-medium">注文</th>
                </tr>
              </thead>
              <tbody>
                {data.revenue.map((r) => (
                  <tr key={r.source} className="border-b border-[var(--pk-line)] last:border-0 align-top">
                    <td className="py-2 pr-3">
                      <span className={r.connected ? "" : "text-[var(--pk-muted)]"}>{r.source}</span>
                      {!r.connected && (
                        <span className="ml-2 rounded bg-[var(--pk-track)] px-1.5 py-0.5 text-[10px] text-[var(--pk-muted)]">
                          {r.dormant ? "休眠" : "未接続"}
                        </span>
                      )}
                      {r.note && <div className="mt-0.5 text-[11px] leading-snug text-[var(--pk-muted)]">{r.note}</div>}
                    </td>
                    {/* 通貨は別列。売上は数字だけにして、円換算列と桁を見比べられるようにする。 */}
                    <td className="py-2 pr-3 text-[var(--pk-muted)]">{r.revenue == null ? "—" : r.currency}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">
                      {r.revenue == null ? "—" : r.revenue}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums">{yen(r.revenueJpy)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{num(r.clicks)}</td>
                    <td className="py-2 text-right tabular-nums">{num(r.orders)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="クリックの行き先" sub="赤い棒は1円にもならない行き先。棒の長さだけ見ると、無報酬の先が一番稼いでいるように見える。">
          <BarList rows={domainRows} />
        </Card>

        <Card title="日次セッション" sub={`実流入 ${num(data.traffic.realSessions)}（本人分 ${num(data.traffic.selfSessions)} を除外）・平均滞在 ${data.traffic.avgEngagementSec}秒`}>
          <Sessions daily={data.traffic.daily} />
        </Card>
      </div>

      <div className="mt-4">
        <Card
          title="記事別の収益貢献"
          sub="★売上は推定。Amazon は成果を商品単位でしか返さず記事を特定できないため、確定報酬をクリック数で按分している。順位の参考であって実額ではない。"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--pk-line)] text-left text-xs text-[var(--pk-muted)]">
                  <th className="py-2 pr-3 font-medium">記事</th>
                  <th className="py-2 pr-3 font-medium">言語</th>
                  <th className="py-2 pr-3 text-right font-medium">閲覧</th>
                  <th className="py-2 pr-3 text-right font-medium">クリック</th>
                  <th className="py-2 pr-3 text-right font-medium">1閲覧あたり</th>
                  <th className="py-2 text-right font-medium">推定売上</th>
                </tr>
              </thead>
              <tbody>
                {data.articles.map((a) => (
                  <tr key={a.path} className="border-b border-[var(--pk-line)] last:border-0">
                    <td className="max-w-[26rem] truncate py-2 pr-3" title={a.path}>
                      <a href={`https://pickly.blog${a.path}`} target="_blank" rel="noreferrer" className="hover:underline">{a.path}</a>
                    </td>
                    <td className="py-2 pr-3 text-[var(--pk-muted)]">{a.locale}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{num(a.views)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{num(a.clicks)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{a.clicksPerView ?? "—"}</td>
                    <td className="py-2 text-right tabular-nums">{yen(a.estRevenueJpy)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

    </main>
  );
}

/** テーマトークン。light/dark とも dataviz の検証を通した値。 */
function Style() {
  return (
    <style>{`
      :root{
        --pk-accent:#2a78d6; --pk-good:#0f7a56; --pk-critical:#b3261e;
        --pk-ink:#1b1f24; --pk-muted:#5b6570; --pk-line:#e3e6ea;
        --pk-card:#ffffff; --pk-track:#eceff3; --pk-grid:#e8ebef;
        --pk-warn:#eb6834; --pk-warn-bg:#fdf2ec;
      }
      @media (prefers-color-scheme: dark){
        :root{
          --pk-accent:#4a97e8; --pk-good:#1fa876; --pk-critical:#f07a72;
          --pk-ink:#e8ecf1; --pk-muted:#9aa5b1; --pk-line:#262d38;
          --pk-card:#1a202a; --pk-track:#262d38; --pk-grid:#242b35;
          --pk-warn:#e06f36; --pk-warn-bg:#2a1f18;
        }
      }
    `}</style>
  );
}
