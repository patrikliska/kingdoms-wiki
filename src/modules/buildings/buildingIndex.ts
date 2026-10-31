import { buildings } from '../../data/buildings';
import type { Building, BuildingCategory } from '../../data/buildingTypes';
import { NO_MAIN_BUILDING_FACTOR } from '../../domain/buildings';
import type { Localized, Tribe } from '../../domain/types';
import type { Formatter } from '../../lib/format';
import type { MessageKey, TFunction } from '../../lib/i18n';

export const buildingById: ReadonlyMap<string, Building> = new Map(buildings.map((b) => [b.id, b]));

/** In-game name in every UI language; `residence-palace` means either of the two. */
export function buildingName(id: string): Localized {
  if (id === 'residence-palace') {
    const r = buildingName('residence');
    const p = buildingName('palace');
    return { cs: `${r.cs} / ${p.cs}`, en: `${r.en} / ${p.en}` };
  }
  return buildingById.get(id)?.name ?? { cs: id, en: id };
}

/** Main Building factor that applies while building `lvl` of `building`, with the village's MB at `mbLevel`. */
export function mbFactorFor(building: Building, mbLevel: number): (lvl: number) => number {
  const mb = buildingById.get('main-building');
  const factorAt = (m: number) =>
    m <= 0 ? NO_MAIN_BUILDING_FACTOR : (mb?.levels[m - 1]?.effects.buildingTime ?? 1);
  // Upgrading the Main Building itself uses the level it currently has.
  return building.id === 'main-building' ? (lvl) => factorAt(lvl - 1) : () => factorAt(mbLevel);
}

export const CATEGORIES: readonly BuildingCategory[] = ['resources', 'infrastructure', 'military'];

/** Buildings this tribe can build (general ones + its own). */
export function availableFor(tribe: Tribe): Building[] {
  return buildings.filter((b) => b.tribe === null || b.tribe === tribe);
}

// ---------- Effects ----------

type EffectFormat = 'int' | 'percentBonus' | 'factor' | 'duration';

interface EffectSpec {
  readonly label: MessageKey;
  readonly format: EffectFormat;
  /** Capacity effects grow with world speed. */
  readonly scalesWithSpeed?: boolean;
  /** Show only for this tribe / hide for this tribe. */
  readonly onlyTribe?: Tribe;
  readonly exceptTribe?: Tribe;
}

/** Only effects whose meaning we're sure about are shown; the rest stay hidden. */
export const EFFECTS: Readonly<Record<string, EffectSpec>> = {
  production1: { label: 'effect.production', format: 'int' },
  production2: { label: 'effect.production', format: 'int' },
  production3: { label: 'effect.production', format: 'int' },
  production4: { label: 'effect.production', format: 'int' },
  productionBoost1: { label: 'effect.productionBoost', format: 'percentBonus' },
  productionBoost2: { label: 'effect.productionBoost', format: 'percentBonus' },
  productionBoost3: { label: 'effect.productionBoost', format: 'percentBonus' },
  productionBoost4: { label: 'effect.productionBoost', format: 'percentBonus' },
  storageWarehouse: { label: 'effect.capacity', format: 'int', scalesWithSpeed: true },
  storageGranary: { label: 'effect.capacity', format: 'int', scalesWithSpeed: true },
  storageCranny: { label: 'effect.hides', format: 'int', scalesWithSpeed: true, exceptTribe: 'gaul' },
  storageCrannyGaul: { label: 'effect.hides', format: 'int', scalesWithSpeed: true, onlyTribe: 'gaul' },
  buildingTime: { label: 'effect.buildingTime', format: 'factor' },
  merchants: { label: 'effect.merchants', format: 'int' },
  oases: { label: 'effect.oases', format: 'int' },
  trainingTimeBarracks: { label: 'effect.trainingTime', format: 'factor' },
  trainingTimeStable: { label: 'effect.trainingTime', format: 'factor' },
  trainingTimeWorkshop: { label: 'effect.trainingTime', format: 'factor' },
  trainingTimeResidence: { label: 'effect.trainingTime', format: 'factor' },
  slots: { label: 'effect.slots', format: 'int' },
  smallPartyTime: { label: 'effect.smallParty', format: 'duration' },
  largePartyTime: { label: 'effect.largeParty', format: 'duration' },
  merchantBoost: { label: 'effect.merchantCapacity', format: 'percentBonus', exceptTribe: 'roman' },
  merchantBoostRoman: { label: 'effect.merchantCapacity', format: 'percentBonus', onlyTribe: 'roman' },
  troopSpeedBoost: { label: 'effect.troopSpeed', format: 'percentBonus' },
  defBonus: { label: 'effect.defBonus', format: 'percentBonus' },
  defFlat: { label: 'effect.defFlat', format: 'int' },
  durability: { label: 'effect.durability', format: 'percentBonus' },
  offBoost: { label: 'effect.offBoost', format: 'percentBonus' },
  traps: { label: 'effect.traps', format: 'int' },
  healTime: { label: 'effect.healTime', format: 'factor' },
  woundedCapacity: { label: 'effect.woundedCapacity', format: 'int', scalesWithSpeed: true },
};

const STORAGE_SPEED_FACTOR: Readonly<Record<number, number>> = { 1: 1, 2: 1.25, 3: 1.5, 5: 2 };

export interface EffectColumn {
  readonly key: string;
  readonly label: string;
  readonly format: (v: number) => string;
}

export function effectColumns(
  building: Building,
  tribe: Tribe,
  speed: number,
  t: TFunction,
  fmt: Formatter,
): EffectColumn[] {
  const keys = new Set(building.levels.flatMap((l) => Object.keys(l.effects)));
  const cols: EffectColumn[] = [];
  for (const key of keys) {
    const spec = EFFECTS[key];
    if (!spec) continue;
    if (spec.onlyTribe && spec.onlyTribe !== tribe) continue;
    if (spec.exceptTribe && spec.exceptTribe === tribe) continue;
    const scale = spec.scalesWithSpeed ? (STORAGE_SPEED_FACTOR[speed] ?? 1) : 1;
    cols.push({ key, label: t(spec.label), format: (v) => formatEffect(v * scale, spec.format, fmt) });
  }
  return cols;
}

function formatEffect(v: number, format: EffectFormat, fmt: Formatter): string {
  switch (format) {
    case 'int':
      return fmt.number(v);
    case 'percentBonus':
      return `+${fmt.percent(v * 100, v * 100 >= 10 ? 0 : 1)}`;
    case 'factor':
      return fmt.percent(v * 100, 1);
    case 'duration':
      return fmt.duration(v);
  }
}
