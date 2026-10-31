import { totalResources } from './resources';
import type { Resources } from './types';

export interface UnitStats {
  readonly attack: number;
  readonly defInf: number;
  readonly defCav: number;
  readonly cost: Resources;
  readonly upkeep: number;
  readonly carry: number;
}

export interface UnitRatios {
  /** Attack per 100 resources of training cost. */
  readonly attackPerCost: number;
  readonly defInfPerCost: number;
  readonly defCavPerCost: number;
  /** Attack per 1 crop/h upkeep. */
  readonly attackPerCrop: number;
  /** (defInf + defCav) / 2 per 1 crop/h upkeep. */
  readonly defPerCrop: number;
  /** Carry per 100 resources of cost — raiding efficiency. */
  readonly carryPerCost: number;
}

export function unitRatios(u: UnitStats): UnitRatios {
  const cost = totalResources(u.cost);
  const per100 = (v: number) => (cost > 0 ? (v / cost) * 100 : 0);
  const perCrop = (v: number) => (u.upkeep > 0 ? v / u.upkeep : 0);
  return {
    attackPerCost: per100(u.attack),
    defInfPerCost: per100(u.defInf),
    defCavPerCost: per100(u.defCav),
    attackPerCrop: perCrop(u.attack),
    defPerCrop: perCrop((u.defInf + u.defCav) / 2),
    carryPerCost: per100(u.carry),
  };
}
