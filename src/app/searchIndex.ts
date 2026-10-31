import { buildings } from '../data/buildings';
import { quests as questData } from '../data/quests';
import type { Quest } from '../data/questTypes';
import { units } from '../data/units';
import type { TFunction } from '../lib/i18n';
import type { Searchable } from '../lib/search';

export type SearchKind = 'quest' | 'building' | 'unit' | 'tip' | 'page';

export interface SearchEntry extends Searchable {
  readonly kind: SearchKind;
  readonly path: string;
}

import type { Lang } from '../domain/types';
import { questGiverNames } from '../data/questGivers';

/**
 * Everything the global search can find, labelled in the current language.
 * Keywords include both Czech and English terms so either works regardless of the UI language.
 */
const quests: readonly Quest[] = questData;

export function buildSearchIndex(t: TFunction, lang: Lang): SearchEntry[] {
  return [
    ...quests.map((q): SearchEntry => ({
      id: `quest:${q.id}`,
      kind: 'quest',
      title: q.name[lang],
      subtitle: `${questGiverNames[q.giver][lang]} · ${q.task}`,
      // the other language and the help-center wording stay searchable
      keywords: ['quest', 'úkol', q.id, q.name.cs, q.name.en, ...(q.aliases ?? [])],
      path: `/quests/${q.id}`,
    })),
    ...buildings.map((b): SearchEntry => ({
      id: `building:${b.id}`,
      kind: 'building',
      title: b.name,
      subtitle: `${t(`buildingCategory.${b.category}`)} · ${t('buildings.maxLevel', { n: b.maxLevel })}`,
      keywords: ['budova', 'building', b.category],
      path: `/buildings/${b.id}`,
    })),
    ...units.map((u): SearchEntry => ({
      id: `unit:${u.id}`,
      kind: 'unit',
      title: u.name,
      subtitle: `${t(`tribe.${u.tribe}`)} · ${t(`unitType.${u.type}`)}`,
      keywords: ['jednotka', 'unit', u.type, u.tribe],
      path: `/units/${u.id}`,
    })),
    {
      id: 'page:walls',
      kind: 'page',
      title: t('nav.walls'),
      subtitle: t('search.page.walls'),
      keywords: ['walls', 'zdi', 'hradby', 'zed', 'berani', 'rams'],
      path: '/walls',
    },
    {
      id: 'page:tribes',
      kind: 'page',
      title: t('nav.tribes'),
      subtitle: t('search.page.tribes'),
      keywords: ['tribes', 'narody', 'romans', 'gauls', 'teutons', 'obchodnik', 'merchant'],
      path: '/tribes',
    },
    {
      id: 'page:daily',
      kind: 'page',
      title: 'Daily quests',
      subtitle: t('search.page.daily'),
      keywords: ['denni', 'daily'],
      path: '/quests/daily',
    },
  ];
}
