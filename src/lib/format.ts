import type { Lang } from '../domain/types';

/** Number/date formatting that follows the UI language (Czech: space as thousands separator). */
export interface Formatter {
  /** Full number with grouping. Use in tables — never abbreviate there. */
  readonly number: (n: number) => string;
  /** Short form (12 tis. / 12K) — only for summaries, never tables. */
  readonly compact: (n: number) => string;
  readonly decimal: (n: number, digits?: number) => string;
  readonly percent: (n: number, digits?: number) => string;
  /** ISO date (YYYY-MM-DD) → 27.10.2026 / 27 Oct 2026 */
  readonly date: (iso: string) => string;
  readonly duration: (seconds: number) => string;
}

const LOCALES: Record<Lang, string> = { cs: 'cs-CZ', en: 'en-GB' };

/** Seconds → h:mm:ss (same in every language). */
export function formatDuration(totalSeconds: number): string {
  const s = Math.round(totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function createFormatter(lang: Lang): Formatter {
  const locale = LOCALES[lang];
  const integer = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  const compact = new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 });
  const decimals = new Map<number, Intl.NumberFormat>();
  const decimal = (n: number, digits = 1) => {
    let f = decimals.get(digits);
    if (!f) {
      f = new Intl.NumberFormat(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits });
      decimals.set(digits, f);
    }
    return f.format(n);
  };
  const longDate = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return {
    number: (n) => integer.format(n),
    compact: (n) => compact.format(n),
    decimal,
    // Czech typography puts a space before %, English doesn't.
    percent: (n, digits = 1) => (lang === 'cs' ? `${decimal(n, digits)} %` : `${decimal(n, digits)}%`),
    date: (iso) => {
      const [y, m, d] = iso.split('-');
      if (!y || !m || !d) return iso;
      return lang === 'cs' ? `${d}.${m}.${y}` : longDate.format(new Date(`${iso}T00:00:00Z`));
    },
    duration: formatDuration,
  };
}

const cache = new Map<Lang, Formatter>();

export function getFormatter(lang: Lang): Formatter {
  let f = cache.get(lang);
  if (!f) {
    f = createFormatter(lang);
    cache.set(lang, f);
  }
  return f;
}
