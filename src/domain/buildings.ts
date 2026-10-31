import type { BuildingLevel } from '../data/buildingTypes';
import { addResources, ZERO } from './resources';
import type { Resources } from './types';

/** World speeds Kingdoms runs on. */
export const WORLD_SPEEDS = [1, 2, 3, 5] as const;
export type WorldSpeed = (typeof WORLD_SPEEDS)[number];

/** Main Building factor when there is no Main Building yet (only relevant for building the MB itself). */
export const NO_MAIN_BUILDING_FACTOR = 5;

/**
 * The game rounds displayed build times in steps that grow with the duration:
 * 5 s under 10 min, 30 s under 30 min, 1 min under 2 h, 5 min above.
 */
export function roundBuildTime(seconds: number): number {
  const step = seconds < 600 ? 5 : seconds < 1800 ? 30 : seconds < 7200 ? 60 : 300;
  return Math.round(seconds / step) * step;
}

/** Build time in seconds for one level (without fealty/prestige bonuses). */
export function buildTime(timeBase: number, mainBuildingFactor: number, speed: number): number {
  return roundBuildTime((timeBase * mainBuildingFactor) / speed);
}

export interface RangeSummary {
  readonly cost: Resources;
  /** Seconds, sum of the individually rounded level times. */
  readonly time: number;
  /** Population added by the upgrade. */
  readonly pop: number;
  /** Culture points per day added by the upgrade (speed 1×). */
  readonly cp: number;
  readonly levels: number;
}

/**
 * Totals for upgrading from `fromLevel` (already built; 0 = nothing) to `toLevel`.
 * `mbFactorFor(lvl)` returns the Main Building factor that applies while building level `lvl`.
 */
export function upgradeRange(
  levels: readonly BuildingLevel[],
  fromLevel: number,
  toLevel: number,
  mbFactorFor: (lvl: number) => number,
  speed: number,
): RangeSummary {
  const from = Math.max(0, Math.min(fromLevel, levels.length));
  const to = Math.max(from, Math.min(toLevel, levels.length));
  let cost = ZERO;
  let time = 0;
  for (const l of levels.slice(from, to)) {
    cost = addResources(cost, l.cost);
    time += buildTime(l.timeBase, mbFactorFor(l.lvl), speed);
  }
  const before = from > 0 ? levels[from - 1] : undefined;
  const after = to > 0 ? levels[to - 1] : undefined;
  return {
    cost,
    time,
    pop: (after?.pop ?? 0) - (before?.pop ?? 0),
    cp: (after?.cp ?? 0) - (before?.cp ?? 0),
    levels: to - from,
  };
}
