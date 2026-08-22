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
  /** 「直近30日累計」のスナップショット系列。日次売上ではない。 */
  revenueDaily?: { date: string; cumulativeJpy: number; deltaJpy: number | null; markets: string[]; byMarket?: Record<string, number> }[];
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

// 浮動小数の桁ノイズを落とすだけ。表示は yen() が Math.round するので実質丸め二重だが、
// 差分を先に丸めておかないと -0.0000001 が「減った」扱いで赤くなる。
const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * 増減の表示。null は「比較できるだけの観測がまだない」で、0(横ばい)とは意味が違う。
 * 混同すると「稼げていない」と読み違えるので、必ず — と ±¥0 を描き分ける。
 */
function Delta({ v }: { v: number | null }) {
  if (v == null) return <span className="text-[var(--pk-muted)]">—</span>;
  if (Math.round(v) === 0) return <span className="text-[var(--pk-muted)]">±¥0</span>;
  const up = v > 0;
  return (
    <span style={{ color: up ? "#2f8f4e" : "#c0392b" }}>
      {up ? "+" : "−"}{yen(Math.abs(v))}
    </span>
  );
}

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

/**
 * 収益の推移。累計の折れ線＋日ごとの増分の棒を重ねる。
 *
 * ★縦軸は累計のみ。増分の棒は同じ軸で描くと1本も見えないので、
 *   自分の最大値でスケールし、軸の目盛りは付けない(付けると累計と読み違える)。
 * ★取得は市場ごとの日替わりローテーションなので、増分0の日は
 *   「稼げなかった」ではなく「その国を見ていない」ことがある。棒は0でも欠測扱いにしない。
 * ★Amazon は遡って取り消すので増分は負になりうる。0基準線を必ず描く。
 */
function RevenueTrend({ daily }: { daily: { date: string; cumulativeJpy: number; deltaJpy: number | null; markets: string[] }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 720, H = 200, PAD = { t: 12, r: 12, b: 24, l: 52 };
  if (daily.length < 2) return <p className="text-sm text-[var(--pk-muted)]">推移を描くにはスナップショットが2日分以上要ります。</p>;

  const nice = (v: number) => {
    const e = 10 ** Math.floor(Math.log10(Math.max(v, 1)));
    return [1, 2, 5, 10].map((m) => m * e).find((c) => c >= v) ?? 10 * e;
  };
  const top = nice(Math.max(...daily.map((d) => d.cumulativeJpy), 1));
  const deltas = daily.map((d) => d.deltaJpy ?? 0);
  const dMax = Math.max(...deltas.map(Math.abs), 1);

  const plotW = W - PAD.l - PAD.r, plotH = H - PAD.t - PAD.b;
  const x = (i: number) => PAD.l + (i / (daily.length - 1)) * plotW;
  const y = (v: number) => PAD.t + (1 - v / top) * plotH;
  // 棒は下半分だけを使う。折れ線と食い合わないようにする。
  const barBase = PAD.t + plotH;
  const barH = (v: number) => (Math.abs(v) / dMax) * (plotH * 0.45);
  const bw = Math.max(4, Math.min(22, (plotW / daily.length) * 0.5));

  const path = daily.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.cumulativeJpy).toFixed(1)}`).join(" ");
  const active = hover != null ? daily[hover] : null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="収益の推移">
        {[0, top / 2, top].map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke="var(--pk-grid)" strokeWidth="1" />
            <text x={PAD.l - 6} y={y(v) + 4} textAnchor="end" fontSize="11" fill="var(--pk-muted)">{yen(v)}</text>
          </g>
        ))}
        {daily.map((d, i) => {
          const v = d.deltaJpy;
          if (v == null || v === 0) return null;
          const h = barH(v);
          return (
            <rect
              key={d.date} x={x(i) - bw / 2} y={v >= 0 ? barBase - h : barBase} width={bw} height={h}
              fill={v >= 0 ? "var(--pk-accent)" : "var(--pk-critical)"} opacity={hover == null || hover === i ? 0.28 : 0.14}
            />
          );
        })}
        <path d={path} fill="none" stroke={ACCENT} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {active && <circle cx={x(hover!)} cy={y(active.cumulativeJpy)} r="4.5" fill={ACCENT} stroke="var(--pk-card)" strokeWidth="2" />}
        <text x={PAD.l} y={H - 6} fontSize="11" fill="var(--pk-muted)">{daily[0]!.date}</text>
        <text x={W - PAD.r} y={H - 6} textAnchor="end" fontSize="11" fill="var(--pk-muted)">{daily[daily.length - 1]!.date}</text>
        {daily.map((d, i) => (
          <rect
            key={`hit-${d.date}`} x={x(i) - 10} y={PAD.t} width="20" height={plotH}
            fill="transparent" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>
      <p className="mt-1 h-4 text-xs text-[var(--pk-muted)]">
        {active
          ? `${active.date} — 累計 ${yen(active.cumulativeJpy)}${active.deltaJpy == null ? "" : ` / 前回比 ${active.deltaJpy >= 0 ? "+" : ""}${yen(active.deltaJpy)}`}・この日取得した market: ${active.markets.join(", ").toUpperCase()}`
          : "薄い棒は前回スナップショットからの増分。赤は取り消しによる減少。"}
      </p>
    </div>
  );
}

/**
 * 国別(Amazon marketplace 別)の収益推移。合計だけだと1国が牽引しているのか
 * 全体が伸びているのかが分からないので、market ごとに折れ線を分ける。
 *
 * ★縦軸は合計と同じく「直近30日累計の円換算」。日々の売上ではない。
 * ★取得は国ごとの持ち回りなので、ある国が初めて取れた日は0から跳ね上がる。
 *   これは実績ではなく観測の開始。まだ一度も取れていない国は線を引かない(0で埋めない)。
 * ★凡例は最終日の金額の降順。伸びている国を上から読めるようにする。
 *
 * ★前日比 / 7日前比 / 1ヶ月前比は「暦の日付」ではなく**その国が実際に取得された日**を
 *   基準に取る。取得は国ごとの持ち回りなので、暦どおりに1日前と比べると、
 *   再取得していない国は必ず ±¥0 になり「伸びていない」と誤読させる。
 *   n本前の実観測値と比べ、そこまで遡れない国は数字を作らず「—」を出す。
 * ★縦軸が30日累計なので、この差分は「新規に発生した収益 − 30日窓から抜けた収益」。
 *   純粋な期間売上ではない。
 */
function RevenueByMarket({ daily }: { daily: { date: string; markets: string[]; byMarket?: Record<string, number> }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 720, H = 220, PAD = { t: 12, r: 12, b: 24, l: 52 };

  const markets = [...new Set(daily.flatMap((d) => Object.keys(d.byMarket ?? {})))];
  if (markets.length === 0) {
    return <p className="text-sm text-[var(--pk-muted)]">国別の内訳はまだスナップショットにありません。</p>;
  }

  const lastOf = (m: string) => {
    for (let i = daily.length - 1; i >= 0; i--) {
      const v = daily[i]!.byMarket?.[m];
      if (v != null) return v;
    }
    return 0;
  };
  const ordered = markets.sort((a, b) => lastOf(b) - lastOf(a));

  // その market が実際に取得された日だけを、新しい順に並べた実観測値の列。
  // byMarket は持ち越し値なので使えない。markets[] がその日の実取得を示す唯一の証拠。
  const observedOf = (m: string) => {
    const vals: { date: string; v: number }[] = [];
    for (let i = daily.length - 1; i >= 0; i--) {
      const d = daily[i]!;
      if (!d.markets?.includes(m)) continue;
      const v = d.byMarket?.[m];
      if (v != null) vals.push({ date: d.date, v });
    }
    return vals;
  };

  // 直近の実観測値と、そこから n 本前の実観測値の差。遡れなければ null(「—」)。
  const deltaOf = (m: string, back: number) => {
    const o = observedOf(m);
    if (o.length <= back) return null;
    return round1(o[0]!.v - o[back]!.v);
  };

  const nice = (v: number) => {
    const e = 10 ** Math.floor(Math.log10(Math.max(v, 1)));
    return [1, 2, 5, 10].map((m) => m * e).find((c) => c >= v) ?? 10 * e;
  };
  const top = nice(Math.max(...daily.flatMap((d) => Object.values(d.byMarket ?? {})), 1));

  const plotW = W - PAD.l - PAD.r, plotH = H - PAD.t - PAD.b;
  const x = (i: number) => PAD.l + (i / Math.max(daily.length - 1, 1)) * plotW;
  const y = (v: number) => PAD.t + (1 - v / top) * plotH;

  // 色は8市場ぶん。凡例と線で同じ色を引くためのただの固定パレット。
  const COLORS = ["#e0724f", "#4f8fe0", "#5aa96b", "#c05fb0", "#c9a227", "#4fb8c0", "#8d7be0", "#9a6b52"];
  const colorOf = (m: string) => COLORS[ordered.indexOf(m) % COLORS.length]!;

  // 欠測日は線をつなぐ(観測していないだけで、値が0に落ちたわけではない)。
  const pathOf = (m: string) => {
    const pts: string[] = [];
    daily.forEach((d, i) => {
      const v = d.byMarket?.[m];
      if (v == null) return;
      pts.push(`${pts.length ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`);
    });
    return pts.join(" ");
  };

  const active = hover != null ? daily[hover] : null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="国別の収益推移">
        {[0, top / 2, top].map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke="var(--pk-grid)" strokeWidth="1" />
            <text x={PAD.l - 6} y={y(v) + 4} textAnchor="end" fontSize="11" fill="var(--pk-muted)">{yen(v)}</text>
          </g>
        ))}
        {ordered.map((m) => (
          <path
            key={m} d={pathOf(m)} fill="none" stroke={colorOf(m)} strokeWidth="2"
            strokeLinejoin="round" strokeLinecap="round"
            opacity={hover == null ? 1 : 0.85}
          />
        ))}
        {active && ordered.map((m) => {
          const v = active.byMarket?.[m];
          if (v == null) return null;
          return <circle key={m} cx={x(hover!)} cy={y(v)} r="3.5" fill={colorOf(m)} stroke="var(--pk-card)" strokeWidth="1.5" />;
        })}
        <text x={PAD.l} y={H - 6} fontSize="11" fill="var(--pk-muted)">{daily[0]!.date}</text>
        <text x={W - PAD.r} y={H - 6} textAnchor="end" fontSize="11" fill="var(--pk-muted)">{daily[daily.length - 1]!.date}</text>
        {daily.map((d, i) => (
          <rect
            key={`hit-${d.date}`} x={x(i) - 10} y={PAD.t} width="20" height={plotH}
            fill="transparent" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>
      <table className="mt-3 w-full text-xs">
        <thead>
          <tr className="text-[var(--pk-muted)]">
            <th className="py-1 text-left font-normal">国</th>
            <th className="py-1 text-right font-normal">30日累計</th>
            <th className="py-1 text-right font-normal">前回取得比</th>
            <th className="py-1 text-right font-normal">7回前比</th>
            <th className="py-1 text-right font-normal">1ヶ月前比</th>
          </tr>
        </thead>
        <tbody>
          {ordered.map((m) => (
              <tr key={m} className="border-t border-[var(--pk-grid)]">
                <td className="py-1">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: colorOf(m) }} />
                    <span className="text-[var(--pk-ink)]">{m.toUpperCase()}</span>
                  </span>
                </td>
                <td className="py-1 text-right text-[var(--pk-ink)] tabular-nums">
                  {yen(active?.byMarket?.[m] ?? lastOf(m))}
                </td>
                <td className="py-1 text-right tabular-nums"><Delta v={deltaOf(m, 1)} /></td>
                <td className="py-1 text-right tabular-nums"><Delta v={deltaOf(m, 7)} /></td>
                <td className="py-1 text-right tabular-nums"><Delta v={deltaOf(m, 30)} /></td>
              </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-1 text-xs text-[var(--pk-muted)]">
        {active
          ? `${active.date} 時点の各国の直近30日累計`
          : "金額は最終日の値。比較は暦日ではなく「その国が実際に取得された回」を基準にした差分で、遡れない国は — と出す(0とは意味が違う)。"}
      </p>
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

        <Card
          title="収益の推移"
          sub="縦軸は『直近30日累計』の円換算で、日々の売上ではない。取得は国ごとの持ち回りなので、新しい国が初めて取れた日は跳ね上がる（本当にその日稼いだわけではない）。"
        >
          {data.revenueDaily && data.revenueDaily.length >= 2
            ? <RevenueTrend daily={data.revenueDaily} />
            : <p className="text-sm text-[var(--pk-muted)]">推移を描くにはスナップショットが2日分以上要ります。</p>}
        </Card>

        <Card title="日次セッション" sub={`実流入 ${num(data.traffic.realSessions)}（本人分 ${num(data.traffic.selfSessions)} を除外）・平均滞在 ${data.traffic.avgEngagementSec}秒`}>
          <Sessions daily={data.traffic.daily} />
        </Card>
      </div>

      <div className="mt-4">
        <Card
          title="国別（Amazon marketplace 別）の収益"
          sub="どの国が伸びているのかを見る。縦軸は合計と同じく『直近30日累計』の円換算。まだ一度も取得できていない国は線を引かない（0で埋めると「稼げていない」と読み違えるため）。"
        >
          {data.revenueDaily && data.revenueDaily.length >= 2
            ? <RevenueByMarket daily={data.revenueDaily} />
            : <p className="text-sm text-[var(--pk-muted)]">推移を描くにはスナップショットが2日分以上要ります。</p>}
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
