import type { Quest, QuestGiver } from '../data/questTypes';
import { normalize } from '../lib/search';
import { descendants, type QuestIndex } from './questGraph';
import { rewardFor, sumResources } from './resources';
import type { Resources, Role, Tribe } from './types';

export interface QuestFilter {
  readonly giver: QuestGiver | 'all';
  readonly query: string;
  readonly tribe: Tribe;
  readonly role: Role;
  /** Also show quests meant for the other role (king vs governor). */
  readonly allRoles: boolean;
}

export function questVisibleFor(q: Quest, tribe: Tribe, role: Role, allRoles: boolean): boolean {
  if (q.tribe && q.tribe !== tribe) return false;
  return allRoles || q.role === 'all' || q.role === role;
}

export function filterQuests<Q extends Quest>(list: readonly Q[], f: QuestFilter): Q[] {
  const words = normalize(f.query).split(/\s+/).filter(Boolean);
  return list.filter((q) => {
    if (f.giver !== 'all' && q.giver !== f.giver) return false;
    if (!questVisibleFor(q, f.tribe, f.role, f.allRoles)) return false;
    if (words.length === 0) return true;
    // Match the title in every language plus aliases, so Czech and English searches both work.
    const hay = normalize([q.name.cs, q.name.en, ...(q.aliases ?? []), q.task, q.id].join(' '));
    return words.every((w) => hay.includes(w));
  });
}

export interface BranchSummary {
  /** Quests counted: the quest itself + everything it unlocks (visible for this tribe/role). */
  readonly count: number;
  readonly total: Resources;
  /** Quests in the branch whose reward is unknown (not in the official table). */
  readonly unknown: number;
  /** Quests with an extra non-resource reward (XP, items…) that the total can't include. */
  readonly withOther: number;
}

/** Sum of rewards for a quest and every quest it (transitively) unlocks. */
export function branchSummary<Q extends Quest>(
  index: QuestIndex<Q>,
  id: string,
  tribe: Tribe,
  role: Role,
  allRoles = false,
): BranchSummary {
  const ids = [id, ...descendants(index, id)];
  const items = ids
    .map((x) => index.byId.get(x))
    .filter((q): q is Q => q !== undefined && questVisibleFor(q, tribe, role, allRoles));
  const rewards = items.flatMap((q) => (q.reward ? [rewardFor(q.reward, tribe)] : []));
  return {
    count: items.length,
    total: sumResources(rewards),
    unknown: items.length - rewards.length,
    withOther: rewards.filter((r) => r.other).length,
  };
}
