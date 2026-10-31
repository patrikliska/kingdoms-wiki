import { describe, expect, it } from 'vitest';
import { wallBonus } from '../domain/walls';
import { buildings } from './buildings';

const byId = new Map(buildings.map((b) => [b.id, b]));

describe('building data', () => {
  it('has unique URL-safe ids', () => {
    expect(byId.size).toBe(buildings.length);
    for (const b of buildings) expect(b.id).toMatch(/^[a-z0-9-]+$/);
  });

  it('has a row for every level', () => {
    for (const b of buildings) {
      expect(b.levels).toHaveLength(b.maxLevel);
      b.levels.forEach((l, i) => expect(l.lvl).toBe(i + 1));
    }
  });

  it('only requires known buildings', () => {
    for (const b of buildings)
      for (const r of b.requires) {
        expect(byId.has(r.id), `${b.id} requires ${r.id}`).toBe(true);
        for (const a of r.alt ?? []) expect(byId.has(a)).toBe(true);
      }
  });

  it('wall bonuses match factor^level (City Wall 1.03, Palisade 1.025, Earth Wall 1.02)', () => {
    for (const [id, factor] of [
      ['city-wall', 1.03],
      ['palisade', 1.025],
      ['earth-wall', 1.02],
    ] as const) {
      for (const l of byId.get(id)?.levels ?? []) {
        expect(l.effects.defBonus).toBeCloseTo(wallBonus(factor, l.lvl) - 1, 3);
      }
    }
  });

  it('has the Kingdoms tribe walls and no Legends-only buildings', () => {
    expect(byId.get('city-wall')?.tribe).toBe('roman');
    expect(byId.get('palisade')?.tribe).toBe('gaul');
    expect(byId.get('earth-wall')?.tribe).toBe('teuton');
    for (const legends of ['heros-mansion', 'hospital', 'stone-wall', 'makeshift-wall', 'command-center'])
      expect(byId.has(legends)).toBe(false);
  });
});
