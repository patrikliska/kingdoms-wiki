import {
  RESOURCE_KEYS,
  type PerTribeReward,
  type Resources,
  type Reward,
  type Tribe,
  type TribeReward,
} from './types';

export const ZERO: Resources = { wood: 0, clay: 0, iron: 0, crop: 0 };

export function addResources(a: Resources, b: Resources): Resources {
  return { wood: a.wood + b.wood, clay: a.clay + b.clay, iron: a.iron + b.iron, crop: a.crop + b.crop };
}

export function sumResources(items: Iterable<Resources>): Resources {
  let acc = ZERO;
  for (const r of items) acc = addResources(acc, r);
  return acc;
}

export function totalResources(r: Resources): number {
  return RESOURCE_KEYS.reduce((n, k) => n + r[k], 0);
}

export function isTribeSpecific(r: TribeReward): r is PerTribeReward {
  return 'rt' in r;
}

/** Resolve a (possibly per-tribe) reward for the given tribe. */
export function rewardFor(r: TribeReward, tribe: Tribe): Reward {
  return isTribeSpecific(r) ? r.rt[tribe] : r;
}
