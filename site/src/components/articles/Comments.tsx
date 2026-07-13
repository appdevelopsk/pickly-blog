"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 記事コメント欄 — nattzy.com (Discourse) の埋め込みコメント。
 * コメントは nattzy 側にトピックとして作られ、返信すると nattzy の
 * 実コンテンツ/登録ユーザーになる（フォーラムへの変換導線）。
 *
 * - スレッドは全ロケールで共有: discourseEmbedUrl は常に /en/ の canonical
 *   （ロケールごとに17個のトピックが乱立するのを防ぐ。nattzy 側は多言語前提）
 * - iframe はビューポート到達時に遅延ロード（LCP/転送量に影響させない）
 */
const HEADING: Record<string, string> = {
  en: "Comments & questions",
  ja: "コメント・質問",
  "zh-CN": "评论与提问",
  "zh-TW": "留言與提問",
  ko: "댓글 및 질문",
  es: "Comentarios y preguntas",
  "pt-BR": "Comentários e perguntas",
  fr: "Commentaires et questions",
  de: "Kommentare & Fragen",
  it: "Commenti e domande",
  ru: "Комментарии и вопросы",
  ar: "التعليقات والأسئلة",
  hi: "टिप्पणियाँ और प्रश्न",
  id: "Komentar & pertanyaan",
  th: "ความคิดเห็นและคำถาม",
  vi: "Bình luận & câu hỏi",
  tr: "Yorumlar ve sorular",
};

const FORUM_URL = "https://nattzy.com/";
const SITE_URL = "https://pickly.blog";

interface Props {
  slug: string;
  locale: string;
}

export function Comments({ slug, locale }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const w = window as typeof window & {
      DiscourseEmbed?: { discourseUrl: string; discourseEmbedUrl: string };
    };
    w.DiscourseEmbed = {
      discourseUrl: FORUM_URL,
      // 全ロケール共通スレッド（en canonical）
      discourseEmbedUrl: `${SITE_URL}/en/articles/${slug}/`,
    };
    const s = document.createElement("script");
    s.src = `${FORUM_URL}javascripts/embed.js`;
    s.async = true;
    document.body.appendChild(s);
    return () => {
      s.remove();
    };
  }, [visible, slug]);

  return (
    <section ref={ref} className="my-10">
      <h2 className="mb-4 text-lg font-bold text-slate-900">
        {HEADING[locale] ?? HEADING.en}
      </h2>
      <div id="discourse-comments" />
      <noscript>
        <a href={FORUM_URL} rel="noopener">
          {HEADING[locale] ?? HEADING.en} → nattzy.com
        </a>
      </noscript>
    </section>
  );
}
