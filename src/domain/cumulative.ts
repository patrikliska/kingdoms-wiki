import { totalResources } from './resources';
import type { Resources } from './types';

/** Running total of resources per level: result[i] = Σ cost of levels 1..i+1. */
export function cumulativeTotals(levels: readonly { readonly cost: Resources }[]): number[] {
  const out: number[] = [];
  let sum = 0;
  for (const l of levels) {
    sum += totalResources(l.cost);
    out.push(sum);
  }
  return out;
}
