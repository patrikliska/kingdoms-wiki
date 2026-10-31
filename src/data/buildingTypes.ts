import type { Localized, Resources, Tribe } from '../domain/types';

export type BuildingCategory = 'resources' | 'infrastructure' | 'military';
/** Where a building may stand. `capital` = the player's capital village. */
export type BuildingSite = 'village' | 'city' | 'capital' | 'ww-village';

export interface BuildingLevel {
  readonly lvl: number;
  readonly cost: Resources;
  /** Total population at this level (not the increment). */
  readonly pop: number;
  /** Total culture points per day at this level (speed 1×). */
  readonly cp: number;
  /** Seconds on a 1× world before the Main Building factor. */
  readonly timeBase: number;
  readonly effects: Readonly<Record<string, number>>;
}

export interface BuildingRequirement {
  readonly id: string;
  readonly level: number;
  /** Alternative buildings that satisfy the same requirement. */
  readonly alt?: readonly string[];
}

export interface Building {
  /** Stable slug — used in URLs, never change it. */
  readonly id: string;
  /** Name exactly as the game shows it, per UI language. */
  readonly name: Localized;
  readonly category: BuildingCategory;
  readonly maxLevel: number;
  readonly tribe: Tribe | null;
  readonly where: readonly BuildingSite[];
  readonly requires: readonly BuildingRequirement[];
  /** Max level per site, when it differs (resource fields). */
  readonly levelCaps?: Readonly<Partial<Record<BuildingSite, number>>>;
  readonly notes: readonly Localized[];
  /** Official help-center article, if there is one. */
  readonly article?: string;
  readonly levels: readonly BuildingLevel[];
}
