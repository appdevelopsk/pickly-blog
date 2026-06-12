"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/lib/i18n/navigation";

/**
 * メール捕捉フォーム（統合集客フェーズ1）。
 * 3製品で共有する fxea365 の leads エンドポイントへ直接 POST する（CORS 対応済み）。
 * source="pickly..." のリードは FX ステップメールの対象外として保存される（誤送信防止はサーバ側で実施）。
 */
const ENDPOINT = "https://fxea365.com/api/leads/subscribe";

export function NewsletterForm({ source = "pickly" }: { source?: string }) {
  const t = useTranslations("newsletter");
  const tn = useTranslations("nav");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "ok" | "err">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, locale }),
      });
      if (res.ok) {
        setState("ok");
        (window as { gtag?: (...args: unknown[]) => void }).gtag?.("event", "newsletter_signup", { source, locale });
      } else {
        setState("err");
      }
    } catch {
      setState("err");
    }
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
      <p className="font-bold text-white">{t("title")}</p>
      <p className="mt-1 text-xs text-slate-400">{t("desc")}</p>
      {state === "ok" ? (
        <p className="mt-3 text-sm font-medium text-emerald-400">{t("success")}</p>
      ) : (
        <form onSubmit={onSubmit} className="mt-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("placeholder")}
              aria-label={t("placeholder")}
              className="min-w-0 flex-1 rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={state === "sending"}
              className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-60"
            >
              {state === "sending" ? t("sending") : t("button")}
            </button>
          </div>
          {state === "err" && <p className="mt-2 text-xs text-red-400">{t("error")}</p>}
          <p className="mt-2 text-[11px] text-slate-400">
            {t("privacy")}{" "}
            <Link href="/privacy" className="underline hover:text-slate-300">
              {tn("privacy")}
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
