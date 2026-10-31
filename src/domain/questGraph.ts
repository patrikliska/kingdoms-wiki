/**
 * Quest chain traversal. Pure graph logic over `{ id, requires }` nodes,
 * so it works for any data shape that carries prerequisites.
 */
export interface ChainNode {
  readonly id: string;
  readonly requires: readonly string[];
}

export interface QuestIndex<T extends ChainNode> {
  readonly byId: ReadonlyMap<string, T>;
  /** id → ids of quests that list it as a prerequisite */
  readonly unlocks: ReadonlyMap<string, readonly string[]>;
}

export function buildIndex<T extends ChainNode>(nodes: readonly T[]): QuestIndex<T> {
  const byId = new Map<string, T>();
  const unlocks = new Map<string, string[]>();
  for (const n of nodes) {
    if (byId.has(n.id)) throw new Error(`duplicate quest id "${n.id}"`);
    byId.set(n.id, n);
  }
  for (const n of nodes) {
    for (const req of n.requires) {
      if (!byId.has(req)) throw new Error(`quest "${n.id}" requires unknown quest "${req}"`);
      const list = unlocks.get(req) ?? [];
      list.push(n.id);
      unlocks.set(req, list);
    }
  }
  return { byId, unlocks };
}

function walk(start: string, next: (id: string) => readonly string[]): string[] {
  const seen = new Set<string>();
  const order: string[] = [];
  const stack = [...next(start)];
  for (let id = stack.pop(); id !== undefined; id = stack.pop()) {
    if (seen.has(id)) continue;
    seen.add(id);
    order.push(id);
    stack.push(...next(id));
  }
  return order;
}

/** All quests that must be done before `id` (transitive prerequisites). */
export function ancestors<T extends ChainNode>(index: QuestIndex<T>, id: string): string[] {
  return walk(id, (q) => index.byId.get(q)?.requires ?? []);
}

/** All quests that become reachable after `id` (transitive). */
export function descendants<T extends ChainNode>(index: QuestIndex<T>, id: string): string[] {
  return walk(id, (q) => index.unlocks.get(q) ?? []);
}

/** The whole line a quest belongs to: ancestors + itself + descendants. */
export function lineage<T extends ChainNode>(index: QuestIndex<T>, id: string): Set<string> {
  return new Set([...ancestors(index, id), id, ...descendants(index, id)]);
}

/** Quests with no prerequisites — the entry points of the tree. */
export function roots<T extends ChainNode>(nodes: readonly T[]): T[] {
  return nodes.filter((n) => n.requires.length === 0);
}
