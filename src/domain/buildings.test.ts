import { describe, expect, it } from 'vitest';
import type { BuildingLevel } from '../data/buildingTypes';
import { buildTime, roundBuildTime, upgradeRange } from './buildings';

const lvl = (n: number, wood: number, pop: number, cp: number, timeBase: number): BuildingLevel => ({
  lvl: n,
  cost: { wood, clay: 0, iron: 0, crop: 0 },
  pop,
  cp,
  timeBase,
  effects: {},
});

const levels = [lvl(1, 100, 1, 1, 100), lvl(2, 200, 3, 2, 1000), lvl(3, 300, 6, 4, 4000)];

describe('roundBuildTime', () => {
  it('rounds to 5 s under 10 min', () => expect(roundBuildTime(123)).toBe(125));
  it('rounds to 30 s under 30 min', () => expect(roundBuildTime(1000)).toBe(990));
  it('rounds to 1 min under 2 h', () => expect(roundBuildTime(3631)).toBe(3660));
  it('rounds to 5 min above', () => expect(roundBuildTime(10_000)).toBe(9900));
});

describe('buildTime', () => {
  it('applies the main building factor and world speed', () => {
    expect(buildTime(1000, 0.5, 1)).toBe(500);
    expect(buildTime(1000, 1, 2)).toBe(500);
  });
});

describe('upgradeRange', () => {
  const one = () => 1;
  it('sums cost and time over the range', () => {
    const r = upgradeRange(levels, 0, 3, one, 1);
    expect(r.cost.wood).toBe(600);
    expect(r.time).toBe(100 + 990 + 4020);
    expect(r.levels).toBe(3);
  });
  it('counts population and CP as the difference', () => {
    const r = upgradeRange(levels, 1, 3, one, 1);
    expect(r.pop).toBe(5);
    expect(r.cp).toBe(3);
    expect(r.cost.wood).toBe(500);
  });
  it('clamps to the available levels', () => {
    expect(upgradeRange(levels, 2, 99, one, 1).levels).toBe(1);
    expect(upgradeRange(levels, 3, 1, one, 1).levels).toBe(0);
  });
});
