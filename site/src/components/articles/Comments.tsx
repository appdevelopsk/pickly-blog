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

/** 見出し下の一文: 飛び先(nattzy)とログインが要ることを事前に明示する */
const SUB: Record<string, string> = {
  en: "Discussion happens on nattzy, our community forum. Sign in with Google to post — it takes a second.",
  ja: "コメントはコミュニティフォーラム nattzy で受け付けています。Googleアカウントですぐ投稿できます。",
  "zh-CN": "讨论在我们的社区论坛 nattzy 进行。用 Google 账号登录即可发言。",
  "zh-TW": "討論在我們的社群論壇 nattzy 進行。用 Google 帳號登入即可發言。",
  ko: "토론은 커뮤니티 포럼 nattzy에서 진행됩니다. Google 계정으로 바로 참여할 수 있습니다.",
  es: "La conversación ocurre en nattzy, nuestro foro. Entra con Google para participar.",
  "pt-BR": "A conversa acontece no nattzy, nosso fórum. Entre com o Google para participar.",
  fr: "La discussion se passe sur nattzy, notre forum. Connectez-vous avec Google pour participer.",
  de: "Die Diskussion findet in unserem Forum nattzy statt. Mit Google anmelden und mitreden.",
  it: "La discussione avviene su nattzy, il nostro forum. Accedi con Google per partecipare.",
  ru: "Обсуждение идёт на нашем форуме nattzy. Войдите через Google, чтобы ответить.",
  ar: "تجري المناقشة في منتدانا nattzy. سجّل الدخول عبر Google للمشاركة.",
  hi: "चर्चा हमारे फ़ोरम nattzy पर होती है। भाग लेने के लिए Google से साइन इन करें।",
  id: "Diskusi berlangsung di nattzy, forum komunitas kami. Masuk dengan Google untuk ikut.",
  th: "การพูดคุยอยู่ที่ nattzy ฟอรัมชุมชนของเรา เข้าสู่ระบบด้วย Google เพื่อร่วมพูดคุย",
  vi: "Thảo luận diễn ra trên nattzy, diễn đàn của chúng tôi. Đăng nhập bằng Google để tham gia.",
  tr: "Tartışma topluluk forumumuz nattzy üzerinde. Katılmak için Google ile giriş yapın.",
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
      <h2 className="mb-1 text-lg font-bold text-slate-900">
        {HEADING[locale] ?? HEADING.en}
      </h2>
      <p className="mb-4 text-sm text-slate-500">{SUB[locale] ?? SUB.en}</p>
      <div id="discourse-comments" />
      <noscript>
        <a href={FORUM_URL} rel="noopener">
          {HEADING[locale] ?? HEADING.en} → nattzy.com
        </a>
      </noscript>
    </section>
  );
}
