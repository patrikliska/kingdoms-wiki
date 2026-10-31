export const TRIBES = ['roman', 'gaul', 'teuton'] as const;
export type Tribe = (typeof TRIBES)[number];

export const ROLES = ['king', 'governor'] as const;
export type Role = (typeof ROLES)[number];

/** Order matches the game UI: wood, clay, iron, crop. */
export const RESOURCE_KEYS = ['wood', 'clay', 'iron', 'crop'] as const;
export type ResourceKey = (typeof RESOURCE_KEYS)[number];

export type Resources = Readonly<Record<ResourceKey, number>>;

export interface Reward extends Resources {
  readonly other?: string;
}

export type PerTribeReward = { readonly rt: Readonly<Record<Tribe, Reward>> };

/** A reward that is either the same for everyone, or differs per tribe. */
export type TribeReward = Reward | PerTribeReward;

export const LANGS = ['cs', 'en'] as const;
export type Lang = (typeof LANGS)[number];

/** Text that exists in every UI language (used for notes and descriptions in game data). */
export type Localized = Readonly<Record<Lang, string>>;

/** Every data module carries provenance. */
export interface SourceInfo {
  readonly source: string;
  /** ISO date (YYYY-MM-DD) when the numbers were checked against the source. */
  readonly verifiedAt: string;
  /** True when values are computed from a formula rather than copied from a table. */
  readonly derived?: boolean;
  readonly formula?: string;
}
