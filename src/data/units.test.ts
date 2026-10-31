import { describe, expect, it } from 'vitest';
import { TRIBES } from '../domain/types';
import { units } from './units';

describe('unit data', () => {
  it('has 10 units per tribe', () => {
    for (const t of TRIBES) expect(units.filter((u) => u.tribe === t)).toHaveLength(10);
  });

  it('has unique URL-safe ids', () => {
    const ids = units.map((u) => u.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  });

  it('has sane stats', () => {
    for (const u of units) {
      expect(u.speed).toBeGreaterThan(0);
      expect(u.upkeep).toBeGreaterThan(0);
      expect(u.cost.crop).toBe(0); // Kingdoms units cost no crop to train
    }
  });
});
