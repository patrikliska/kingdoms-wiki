import type { Localized, Tribe, TribeReward } from '../domain/types';

export const QUEST_GIVERS = ['wren', 'markus', 'chieftain'] as const;
export type QuestGiver = (typeof QUEST_GIVERS)[number];

export type QuestRole = 'all' | 'king' | 'governor';

export interface Quest {
  /** Stable slug — used in URLs, never change it. */
  readonly id: string;
  readonly giver: QuestGiver;
  /** Title exactly as the game shows it, per language (official client localization). */
  readonly name: Localized;
  /** Key of the title in the game client (QuestHeader_<key>) — lets us re-sync titles. */
  readonly gameKey: string;
  /** Other names players may search for (e.g. the help center wording). */
  readonly aliases?: readonly string[];
  /** Short description of what to do (our own wording). */
  readonly task: string;
  readonly requires: readonly string[];
  readonly role: QuestRole;
  /** null = the official table has no reward for this quest. */
  readonly reward: TribeReward | null;
  /** Quest exists only for this tribe (e.g. scout research). */
  readonly tribe?: Tribe;
  readonly note?: Localized;
  /** Inferred from context, not a row in the official table. */
  readonly unverified?: boolean;
}
