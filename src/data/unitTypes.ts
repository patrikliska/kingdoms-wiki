import type { Resources, Tribe } from '../domain/types';

export type UnitType = 'infantry' | 'cavalry' | 'siege' | 'scout' | 'chief' | 'settler';

export interface UnitRequirement {
  /** Building slug, e.g. 'academy'. */
  readonly building: string;
  readonly level: number;
}

export interface Unit {
  /** Stable slug — used in URLs, never change it. */
  readonly id: string;
  readonly tribe: Tribe;
  /** In-game English name. */
  readonly name: string;
  readonly type: UnitType;
  readonly attack: number;
  readonly defInf: number;
  readonly defCav: number;
  /** Training cost. Kingdoms units cost no crop to train (crop is always 0). */
  readonly cost: Resources;
  /** Fields per hour on a speed 1× world. */
  readonly speed: number;
  readonly carry: number;
  /** Crop consumed per hour. */
  readonly upkeep: number;
  readonly building: string;
  readonly requires: readonly UnitRequirement[];
  /** null = available without research. `time` in seconds — see note on research times. */
  readonly research: { readonly cost: Resources; readonly time: number } | null;
  readonly source: string;
}
