import type { Localized } from '../domain/types';
import type { QuestGiver } from './questTypes';

/** Quest giver names as the game shows them (client localization: QuestGiver_1, _3, _9). */
export const questGiverNames: Readonly<Record<QuestGiver, Localized>> = {
  wren: { cs: 'Wren', en: 'Wren' },
  markus: { cs: 'Marcus', en: 'Marcus' },
  chieftain: { cs: 'Náčelník', en: 'Chieftain' },
};
