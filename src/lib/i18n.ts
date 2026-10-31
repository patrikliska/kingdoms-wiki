import { useAtomValue } from 'jotai';
import { useCallback } from 'react';
import { langAtom } from '../app/state';
import { LANGS, type Lang, type Localized } from '../domain/types';
import { getFormatter, type Formatter } from './format';
import { cs, type MessageKey, type Messages } from './messages/cs';
import { en } from './messages/en';

export type { MessageKey };

const dictionaries: Record<Lang, Messages> = { cs, en };

export type Params = Record<string, string | number>;

export function translate(lang: Lang, key: MessageKey, params?: Params): string {
  let msg = dictionaries[lang][key];
  if (params) for (const [k, v] of Object.entries(params)) msg = msg.replaceAll(`{${k}}`, String(v));
  return msg;
}

export type TFunction = (key: MessageKey, params?: Params) => string;

export function useLang(): Lang {
  const lang = useAtomValue(langAtom);
  // Guard against a hand-edited / outdated value in localStorage.
  return (LANGS as readonly string[]).includes(lang) ? lang : 'en';
}

/** UI strings in the current language. */
export function useT(): TFunction {
  const lang = useLang();
  return useCallback<TFunction>((key, params) => translate(lang, key, params), [lang]);
}

/** Picks the current language from a `Localized` text in game data. */
export function useL(): (text: Localized) => string {
  const lang = useLang();
  return useCallback((text: Localized) => text[lang], [lang]);
}

/** Number/date formatting for the current language. */
export function useFormat(): Formatter {
  return getFormatter(useLang());
}
