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
          {s.paragraphs.map((p, j) => (
            <p key={j} className="mb-3 leading-relaxed text-slate-700">
              {p}
            </p>
          ))}
        </section>
      ))}
      {footer && <p className="mt-10 text-sm text-slate-500">{footer}</p>}
    </article>
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
