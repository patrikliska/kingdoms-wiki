/** Lowercase and strip diacritics so "budovy" matches "Budovy" and "zed" matches "zeď". */
export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

export interface Searchable {
  readonly id: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly keywords?: readonly string[];
}

/**
 * Every query word must appear somewhere; hits in the title rank higher,
 * and a title that starts with the query ranks highest.
 */
export function search<T extends Searchable>(items: readonly T[], query: string, limit = 20): T[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const scored: { item: T; score: number }[] = [];
  for (const item of items) {
    const title = normalize(item.title);
    const rest = normalize([item.subtitle ?? '', ...(item.keywords ?? [])].join(' '));
    let score = 0;
    let ok = true;
    for (const w of words) {
      if (title.includes(w)) score += title.startsWith(w) ? 3 : 2;
      else if (rest.includes(w)) score += 1;
      else {
        ok = false;
        break;
      }
    }
    if (ok) scored.push({ item, score });
  }
  return scored
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .slice(0, limit)
    .map((s) => s.item);
}
