import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { Lang, Role, Tribe } from '../domain/types';
import { detectBrowserLang } from '../lib/locale';

export type ThemeChoice = 'system' | 'light' | 'dark';

const opts = { getOnInit: true } as const;

/** The player's tribe — every table follows it. */
export const tribeAtom = atomWithStorage<Tribe>('kc.tribe', 'roman', undefined, opts);
export const roleAtom = atomWithStorage<Role>('kc.role', 'governor', undefined, opts);
export const themeAtom = atomWithStorage<ThemeChoice>('kc.theme', 'system', undefined, opts);
/**
 * UI language. Until the player picks one, it's detected from the browser (Czech for Czech
 * players, English otherwise); the detected value isn't stored, only an explicit choice is.
 */
export const langAtom = atomWithStorage<Lang>('kc.lang', detectBrowserLang(), undefined, opts);

/** Whether the global search dialog is open (not persisted). */
export const searchOpenAtom = atom(false);

/** Whether the settings sheet is open (not persisted). */
export const settingsOpenAtom = atom(false);

/** Whether the "suggest a correction" form is open (not persisted). */
export const reportOpenAtom = atom(false);

export interface RecentItem {
  readonly path: string;
  readonly title: string;
  readonly kind: 'quest' | 'building' | 'unit';
}

/** Recently opened details, newest first — shown on the home page. */
export const recentAtom = atomWithStorage<readonly RecentItem[]>('kc.recent', [], undefined, opts);

export const RECENT_LIMIT = 6;
