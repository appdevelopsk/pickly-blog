"use client";

import { useEffect, useState } from "react";

/**
 * `?sub=` によるカテゴリ内の絞り込み(価格.com 型の中間層)。
 *
 * ★output: export のため useSearchParams は使えない(Suspense 境界が要るが
 *   静的ページには無い)。ArticleFacets と同じく useEffect 内で
 *   window.location.search を読む。
 *
 * ★カードの再シリアライズはしない。記事カードはサーバ側で描き切り、各 <li> に
 *   data-sub="dog cat" を刻んでおいて、ここでは DOM の hidden を切り替えるだけ。
 *   articles ページ(790件4.1MB)で見たとおり、カード一式を client に渡すと
 *   ページ重量が跳ねる。JS が動かない場合は全件が出たままになる(劣化しない)。
 *
 * 対象は listId で受けた <ul> 配下の <li>。マッチしない記事は絞り込み時に隠す
 * (ken 承認 2026-09-13: 親ページでは従来どおり全件出るので到達性は保たれる)。
 */

interface Props {
  /** 絞り込み対象の <ul> の id。 */
  listId: string;
  /** このカテゴリが持つサブカテゴリの slug 一覧。未知の ?sub= は無視する。 */
  knownSlugs: string[];
  /** 「すべて」に戻すリンクの文言。 */
  allLabel: string;
  /**
   * slug → 絞り込み中の見出し(サブカテゴリ名を差し込み済み)。
   * ★{label} は ICU 引数なので、テンプレートのまま受け取って .replace() すると
   *   サーバ側で値を渡せず全ロケールが英語にフォールバックする。解決済みで受ける。
   */
  filteredLabels: Record<string, string>;
  /** slug → 表示名。 */
  labels: Record<string, string>;
  /** 0件になったときの文言。 */
  emptyLabel: string;
}

export function SubcategoryFilter({
  listId,
  knownSlugs,
  allLabel,
  filteredLabels,
  labels,
  emptyLabel,
}: Props) {
  const [sub, setSub] = useState<string | null>(null);
  const [shown, setShown] = useState<number | null>(null);

  // 初回とブラウザ履歴移動の両方で読む(戻るで絞り込みが解けないと不自然)。
  useEffect(() => {
    const read = () => {
      try {
        const v = new URLSearchParams(window.location.search).get("sub");
        setSub(v && knownSlugs.includes(v) ? v : null);
      } catch {
        setSub(null);
      }
    };
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, [knownSlugs]);

  // DOM を直接切り替える。カードの再描画はしない。
  useEffect(() => {
    const list = document.getElementById(listId);
    if (!list) return;
    let visible = 0;
    for (const li of Array.from(list.children)) {
      if (!(li instanceof HTMLElement)) continue;
      const subs = (li.dataset.sub ?? "").split(" ").filter(Boolean);
      const hit = sub === null || subs.includes(sub);
      li.hidden = !hit;
      if (hit) visible += 1;
    }
    setShown(sub === null ? null : visible);
  }, [sub, listId]);

  if (sub === null) return null;

  const clear = (e: React.MouseEvent) => {
    e.preventDefault();
    const url = window.location.pathname;
    window.history.pushState({}, "", url);
    setSub(null);
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
      <span className="rounded-full bg-brand-50 px-3 py-1 font-semibold text-brand-700">
        {filteredLabels[sub] ?? labels[sub] ?? sub}
        {typeof shown === "number" && <span className="ml-1.5 font-normal text-brand-500">{shown}</span>}
      </span>
      <a
        href={typeof window === "undefined" ? "#" : window.location.pathname}
        onClick={clear}
        data-related="subcategory-clear"
        className="text-slate-500 underline underline-offset-2 transition-colors hover:text-brand-700"
      >
        {allLabel}
      </a>
      {shown === 0 && <span className="text-slate-400">{emptyLabel}</span>}
    </div>
  );
}
