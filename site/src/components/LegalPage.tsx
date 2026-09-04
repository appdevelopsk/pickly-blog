import { useTranslations } from "next-intl";

interface Section {
  heading: string;
  paragraphs: string[];
}

interface Props {
  /** i18n key prefix, e.g. "legal.about" */
  baseKey: string;
}

/**
 * Renders a legal/info page from i18n keys at <baseKey>:
 *   - heading
 *   - lede (optional)
 *   - lastUpdated (optional, ISO date)
 *   - sections[] of {heading, paragraphs[]}
 *   - footer (optional)
 *
 * Uses t.raw to read sections array from messages JSON.
 */
export function LegalPage({ baseKey }: Props) {
  const t = useTranslations();
  const lede = tryRead(t, `${baseKey}.lede`);
  const lastUpdated = tryRead(t, `${baseKey}.lastUpdated`);
  const sections = (t.raw(`${baseKey}.sections`) as Section[] | undefined) ?? [];
  const footer = tryRead(t, `${baseKey}.footer`);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-3 text-3xl font-bold md:text-4xl">{t(`${baseKey}.heading`)}</h1>
      {lede && <p className="mb-3 text-lg text-slate-600">{lede}</p>}
      {lastUpdated && (
        <p className="mb-8 text-xs text-slate-500">
          {t("legal.lastUpdatedLabel", { date: lastUpdated })}
        </p>
      )}
      {sections.map((s, i) => (
        <section key={i} className="mb-8">
          <h2 className="mb-3 text-xl font-bold">{s.heading}</h2>
          {s.paragraphs.map((p, j) =>
            EMAIL_RE.test(p) ? (
              // Cloudflare Scrape Shield が生テキストのメールアドレスを
              // /cdn-cgi/l/email-protection リンクに書き換え、クローラーには 404 として見える。
              // contact ページと同じく <!--email_off--> で難読化を抑止する (2026-09-04)。
              <p
                key={j}
                className="mb-3 leading-relaxed text-slate-700"
                dangerouslySetInnerHTML={{ __html: `<!--email_off-->${linkifyEmail(p)}<!--/email_off-->` }}
              />
            ) : (
              <p key={j} className="mb-3 leading-relaxed text-slate-700">
                {p}
              </p>
            ),
          )}
        </section>
      ))}
      {footer && <p className="mt-10 text-sm text-slate-500">{footer}</p>}
    </article>
  );
}

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;

function escapeHtml(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** 段落を HTML エスケープしつつ、メールアドレスだけ mailto リンクにする。 */
function linkifyEmail(v: string): string {
  return escapeHtml(v).replace(
    new RegExp(EMAIL_RE.source, "g"),
    (m) => `<a href="mailto:${m}" class="text-brand-600 hover:underline">${m}</a>`,
  );
}

function tryRead(t: ReturnType<typeof useTranslations>, key: string): string | undefined {
  try {
    const v = t(key);
    return v === key ? undefined : v;
  } catch {
    return undefined;
  }
}
