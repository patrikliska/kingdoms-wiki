import { describe, expect, it } from 'vitest';
import { ancestors, buildIndex, descendants, lineage, roots } from './questGraph';
import { rewardFor, sumResources, totalResources } from './resources';
import { wallBonus, wallBonusPercent } from './walls';

describe('wallBonus', () => {
  it('is 1 at level 0', () => expect(wallBonus(1.03, 0)).toBe(1));
  it('compounds per level', () => expect(wallBonus(1.03, 20)).toBeCloseTo(1.8061, 4));
  it('percent form', () => expect(wallBonusPercent(1.02, 20)).toBeCloseTo(48.59, 2));
});

//   a ─┬─ b ─┐
//      └─ c ─┴─ d      e (standalone)
const nodes = [
  { id: 'a', requires: [] },
  { id: 'b', requires: ['a'] },
  { id: 'c', requires: ['a'] },
  { id: 'd', requires: ['b', 'c'] },
  { id: 'e', requires: [] },
];
const index = buildIndex(nodes);

describe('quest graph', () => {
  it('finds roots', () => expect(roots(nodes).map((n) => n.id)).toEqual(['a', 'e']));
  it('ancestors are transitive and unique', () =>
    expect(ancestors(index, 'd').sort()).toEqual(['a', 'b', 'c']));
  it('descendants are transitive and unique', () =>
    expect(descendants(index, 'a').sort()).toEqual(['b', 'c', 'd']));
  it('lineage includes self', () => expect([...lineage(index, 'b')].sort()).toEqual(['a', 'b', 'd']));
  it('standalone quest has only itself', () => expect([...lineage(index, 'e')]).toEqual(['e']));
  it('rejects unknown prerequisites', () =>
    expect(() => buildIndex([{ id: 'x', requires: ['nope'] }])).toThrow(/unknown quest/));
  it('rejects duplicate ids', () =>
    expect(() =>
      buildIndex([
        { id: 'x', requires: [] },
        { id: 'x', requires: [] },
      ]),
    ).toThrow(/duplicate/));
});

describe('resources', () => {
  it('sums', () =>
    expect(
      sumResources([
        { wood: 1, clay: 2, iron: 3, crop: 4 },
        { wood: 10, clay: 20, iron: 30, crop: 40 },
      ]),
    ).toEqual({ wood: 11, clay: 22, iron: 33, crop: 44 }));
  it('totals', () => expect(totalResources({ wood: 1, clay: 2, iron: 3, crop: 4 })).toBe(10));
  it('resolves per-tribe rewards', () => {
    const one = (wood: number) => ({ wood, clay: 0, iron: 0, crop: 0 });
    const r = { rt: { roman: one(1), gaul: one(2), teuton: one(3) } };
    expect(rewardFor(r, 'gaul').wood).toBe(2);
    expect(rewardFor(one(5), 'teuton').wood).toBe(5);
  });
});
