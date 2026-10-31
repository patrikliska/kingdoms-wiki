import { quests } from '../../data/quests';
import type { Quest } from '../../data/questTypes';
import { buildIndex } from '../../domain/questGraph';

export const questIndex = buildIndex<Quest>(quests);
