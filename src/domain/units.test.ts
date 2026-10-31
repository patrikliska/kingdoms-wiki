import { describe, expect, it } from 'vitest';
import { unitRatios } from './units';

describe('unitRatios', () => {
  const u = {
    attack: 40,
    defInf: 35,
    defCav: 50,
    cost: { wood: 75, clay: 50, iron: 100, crop: 0 },
    upkeep: 1,
    carry: 50,
  };

  it('computes per-100-resources ratios', () => {
    const r = unitRatios(u);
    expect(r.attackPerCost).toBeCloseTo((40 / 225) * 100);
    expect(r.carryPerCost).toBeCloseTo((50 / 225) * 100);
  });

  it('computes per-crop ratios', () => {
    const r = unitRatios({ ...u, upkeep: 2 });
    expect(r.attackPerCrop).toBe(20);
    expect(r.defPerCrop).toBe(21.25);
  });

  it('does not divide by zero', () => {
    const r = unitRatios({ ...u, cost: { wood: 0, clay: 0, iron: 0, crop: 0 }, upkeep: 0 });
    expect(r.attackPerCost).toBe(0);
    expect(r.attackPerCrop).toBe(0);
  });
});
