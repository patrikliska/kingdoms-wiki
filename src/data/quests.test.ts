import { describe, expect, it } from 'vitest';
import { ancestors, buildIndex } from '../domain/questGraph';
import { quests } from './quests';
import { QUEST_GIVERS } from './questTypes';

describe('quest data', () => {
  it('has unique ids and every prerequisite resolves', () => {
    expect(() => buildIndex(quests)).not.toThrow();
  });

  it('has no cycles', () => {
    const index = buildIndex(quests);
    for (const q of quests) expect(ancestors(index, q.id)).not.toContain(q.id);
  });

  it('uses URL-safe ids that do not clash with sub-routes', () => {
    for (const q of quests) {
      expect(q.id).toMatch(/^[a-z0-9]+$/);
      expect(q.id).not.toBe('daily');
    }
  });

  it('only uses known givers', () => {
    for (const q of quests) expect(QUEST_GIVERS).toContain(q.giver);
  });

  it('has non-negative rewards', () => {
    for (const q of quests) {
      if (!q.reward) continue;
      const list = 'rt' in q.reward ? Object.values(q.reward.rt) : [q.reward];
      for (const r of list)
        for (const v of [r.wood, r.clay, r.iron, r.crop]) expect(v).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('official in-game quest titles', () => {
  const byId = new Map(quests.map((q) => [q.id as string, q]));
  const NBSP = ' ';

  it('every quest has a Czech and English title and a unique game key', () => {
    const keys = new Set<string>();
    for (const q of quests) {
      expect(q.name.cs.trim(), q.id).not.toBe('');
      expect(q.name.en.trim(), q.id).not.toBe('');
      expect(keys.has(q.gameKey), q.gameKey).toBe(false);
      keys.add(q.gameKey);
    }
  });

  // Exactly as shown in the Czech game client (quest book screenshot).
  it.each([
    ['units1000', `1${NBSP}000 jednotek`],
    ['stolen50', 'Prodej 50 pytlů kradeného zboží'],
    ['ws1', 'Postav dílnu'],
    ['allrf7', 'Všechny doly na 7'],
    ['bk1', 'Postav pekárnu'],
    ['allcf10', 'Obilná pole 10'],
    ['cityorvil', 'Město nebo nová vesnice'],
  ])('%s is "%s" in Czech', (id, cs) => {
    expect(byId.get(id)?.name.cs).toBe(cs);
  });
});
