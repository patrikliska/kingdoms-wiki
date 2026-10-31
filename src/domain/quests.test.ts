import { describe, expect, it } from 'vitest';
import type { Quest } from '../data/questTypes';
import { buildIndex } from './questGraph';
import { branchSummary, filterQuests } from './quests';

const r = (wood: number, other?: string) => ({
  wood,
  clay: 0,
  iron: 0,
  crop: 0,
  ...(other ? { other } : {}),
});

const list: Quest[] = [
  {
    id: 'a',
    giver: 'wren',
    name: { cs: 'Build a Granary (cs)', en: 'Build a Granary' },
    gameKey: 'x',
    task: 'Granary',
    requires: [],
    role: 'all',
    reward: r(10),
  },
  {
    id: 'b',
    giver: 'wren',
    name: { cs: 'Granary to 5 (cs)', en: 'Granary to 5' },
    gameKey: 'x',
    task: 'Granary',
    requires: ['a'],
    role: 'all',
    reward: r(20, '50 XP'),
  },
  {
    id: 'c',
    giver: 'markus',
    name: { cs: 'Collect tributes (cs)', en: 'Collect tributes' },
    gameKey: 'x',
    task: 'Tributes',
    requires: ['a'],
    role: 'king',
    reward: null,
  },
  {
    id: 'd',
    giver: 'markus',
    name: { cs: 'Research Pathfinder (cs)', en: 'Research Pathfinder' },
    gameKey: 'x',
    task: 'Scout',
    requires: ['b'],
    role: 'all',
    reward: r(5),
    tribe: 'gaul',
  },
  {
    id: 'e',
    giver: 'chieftain',
    name: { cs: '5 units (cs)', en: '5 units' },
    gameKey: 'x',
    task: 'Train',
    requires: [],
    role: 'governor',
    reward: { rt: { roman: r(1), gaul: r(2), teuton: r(3) } },
  },
];

const base = { giver: 'all', query: '', tribe: 'roman', role: 'governor', allRoles: false } as const;

describe('filterQuests', () => {
  it('hides other roles and other tribes by default', () =>
    expect(filterQuests(list, base).map((q) => q.id)).toEqual(['a', 'b', 'e']));
  it('shows all roles on request', () =>
    expect(filterQuests(list, { ...base, allRoles: true }).map((q) => q.id)).toEqual(['a', 'b', 'c', 'e']));
  it('filters by giver', () => expect(filterQuests(list, { ...base, giver: 'wren' }).length).toBe(2));
  it('full-text matches all words', () =>
    expect(filterQuests(list, { ...base, query: 'granary 5' }).map((q) => q.id)).toEqual(['b']));
  it('matches Czech titles and aliases', () => {
    expect(filterQuests(list, { ...base, query: 'granary 5 (cs)' }).map((q) => q.id)).toEqual(['b']);
    const aliased = list.slice(0, 1).map((q) => ({ ...q, aliases: ['Construct a Granary'] }));
    expect(filterQuests(aliased, { ...base, query: 'construct' }).length).toBe(1);
  });
  it('shows tribe-specific quests to that tribe', () =>
    expect(filterQuests(list, { ...base, tribe: 'gaul' }).map((q) => q.id)).toContain('d'));
});

describe('branchSummary', () => {
  const index = buildIndex(list);
  it('sums the quest and its descendants for the tribe/role', () => {
    const s = branchSummary(index, 'a', 'gaul', 'king');
    // a(10) + b(20) + c(unknown, king) + d(5, gaul)
    expect(s).toEqual({ count: 4, total: { wood: 35, clay: 0, iron: 0, crop: 0 }, unknown: 1, withOther: 1 });
  });
  it('skips quests not visible for the tribe/role', () => {
    const s = branchSummary(index, 'a', 'roman', 'governor');
    expect(s.count).toBe(2);
    expect(s.total.wood).toBe(30);
  });
  it('resolves per-tribe rewards', () =>
    expect(branchSummary(index, 'e', 'teuton', 'governor').total.wood).toBe(3));
});
