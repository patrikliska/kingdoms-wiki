import type { Lang } from '../domain/types';

/**
 * Pick the default UI language without any network lookup:
 * Czech when the browser prefers Czech or the device clock runs on Czech time (Europe/Prague),
 * otherwise English. Only used until the player picks a language themselves.
 */
export function detectLang(languages: readonly string[], timeZone: string | undefined): Lang {
  if (languages.some((l) => l.toLowerCase().split('-')[0] === 'cs')) return 'cs';
  if (timeZone === 'Europe/Prague') return 'cs';
  return 'en';
}

/** detectLang() with the current browser's settings; English outside a browser. */
export function detectBrowserLang(): Lang {
  if (typeof navigator === 'undefined') return 'en';
  let timeZone: string | undefined;
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    timeZone = undefined;
  }
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  return detectLang(languages, timeZone);
}
