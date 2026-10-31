// One-off generator: scratchpad/buildings.json -> src/data/buildings.ts
const fs = require('fs');
const [, , input, output] = process.argv;
const d = JSON.parse(fs.readFileSync(input, 'utf8'));
const q = (s) => JSON.stringify(s);
const num = (n) => String(Math.round(n * 10000) / 10000);

const nameOf = (id) => d.buildings.find((b) => b.id === id)?.name ?? id;

// Notes derived from the research flags — our own wording, in every UI language.
function notesFor(b) {
  const n = [];
  const add = (cs, en) => n.push({ cs, en });
  if (b.multiple) {
    const lvl = b.multiple.replace('after level ', '');
    add(
      `Ve vesnici lze postavit víckrát – další až po dosažení levelu ${lvl}.`,
      `Can be built more than once per village — the next one after level ${lvl}.`,
    );
  }
  if (b.excludes?.length) {
    const list = b.excludes.map(nameOf).join(', ');
    add(`Nelze mít zároveň s: ${list}.`, `Cannot coexist with: ${list}.`);
  }
  if (b.uniqueInAccount) add('Jen jeden na účet.', 'Only one per account.');
  if (b.notInWwVillage)
    add(
      'Nelze postavit ve vesnici s Wonder of the World.',
      'Cannot be built in a Wonder of the World village.',
    );
  if (b.costRule)
    add(
      'Level 1 má zvláštní cenu, další levely se počítají podle běžného vzorce.',
      'Level 1 has a special cost; later levels follow the usual formula.',
    );
  if (b.convertedFrom === 'hidden-treasury')
    add(
      'Nestaví se přímo – vzniká aktivací Hidden Treasury králem, vicekrálem nebo vévodou s volným slotem na pokladnici.',
      'Not built directly — a king, vice king or duke with a free treasury slot activates a Hidden Treasury.',
    );
  if (b.oasisSlotsAt) {
    const list = b.oasisSlotsAt.join(', ');
    add(`Sloty na oázy na levelech ${list}.`, `Oasis slots at levels ${list}.`);
  }
  if (b.expansionSlotsAt) {
    const list = b.expansionSlotsAt.join(', ');
    add(
      `Expanzní sloty (osadníci/náčelníci) na levelech ${list}.`,
      `Expansion slots (settlers/chiefs) at levels ${list}.`,
    );
  }
  if (b.id === 'brewery')
    add(
      'Bonus útoku platí pro všechny vesnice. Daň: náčelníci přesvědčují o 50 % hůř a katapulty míří jen náhodně.',
      'The attack bonus applies to all villages. The price: chiefs persuade 50% less and catapults only hit random targets.',
    );
  if (b.ramCatapultImmune) add('Berani ani katapulty ji nepoškodí.', 'Rams and catapults cannot damage it.');
  if (b.id === 'water-ditch')
    add(
      'Přidává obranný bonus k hradbám, ale hodnotu po levelech oficiální data neuvádějí. Postavit ji může každý národ (jen ve městě).',
      'Adds a defence bonus to the wall, but the official data gives no per-level value. Any tribe can build it (city only).',
    );
  if (b.id === 'cranny') add('Galská skrýš schová víc surovin.', 'A Gaul cranny hides more resources.');
  return n;
}

const CATEGORY = { Resources: 'resources', Infrastructure: 'infrastructure', Military: 'military' };

const out = d.buildings.map((b) => {
  const levels = b.levels.map((l) => {
    const eff = Object.entries(l.effects || {})
      .map(([k, v]) => `${k}: ${num(v)}`)
      .join(', ');
    return `[${[l.wood, l.clay, l.iron, l.crop, l.pop, l.cp, Math.round(l.timeBase * 100) / 100].join(', ')}, { ${eff} }]`;
  });
  const req = (b.requires || []).map(
    (r) => `{ id: ${q(r.id)}, level: ${r.level}${r.alt ? `, alt: ${q(r.alt)}` : ''} }`,
  );
  const parts = [
    `id: ${q(b.id)}`,
    `name: ${q(b.name)}`,
    `category: ${q(CATEGORY[b.category])}`,
    `maxLevel: ${b.maxLevel}`,
    `tribe: ${b.tribe ? q(b.tribe) : 'null'}`,
    `where: ${q(b.where)}`,
    `requires: [${req.join(', ')}]`,
  ];
  if (b.levelCaps)
    parts.push(
      `levelCaps: ${JSON.stringify(b.levelCaps)
        .replace(/"([a-z]+)":/g, '$1: ')
        .replace(/"/g, "'")}`,
    );
  parts.push(`notes: ${q(notesFor(b))}`);
  if (b.article) parts.push(`article: ${q(b.article)}`);
  if (b.levels.length !== b.maxLevel)
    throw new Error(`${b.id}: ${b.levels.length} levels, max ${b.maxLevel}`);
  parts.push(`levels: lv([\n      ${levels.join(',\n      ')},\n    ])`);
  return `  {\n    ${parts.join(',\n    ')},\n  },`;
});

fs.writeFileSync(
  output,
  `// Generated from the official Travian Kingdoms building calculator (tk-kb.kingdoms.com, linked from the
// help center). Per-level values are copied from its tables, not computed. Keep ids stable — they are in URLs.
import type { SourceInfo } from '../domain/types';
import type { Building, BuildingLevel } from './buildingTypes';

type Row = readonly [number, number, number, number, number, number, number, Readonly<Record<string, number>>];

/** [wood, clay, iron, crop, pop, cp, timeBase, effects] per level, starting at level 1. */
function lv(rows: readonly Row[]): BuildingLevel[] {
  return rows.map(([wood, clay, iron, crop, pop, cp, timeBase, effects], i) => ({
    lvl: i + 1,
    cost: { wood, clay, iron, crop },
    pop,
    cp,
    timeBase,
    effects,
  }));
}

export const buildingsVerifiedAt = ${q(d.verifiedAt)};

export const buildingsSource: readonly SourceInfo[] = [
  { source: 'https://tk-kb.kingdoms.com/en-US/buildings', verifiedAt: buildingsVerifiedAt },
  { source: 'https://support.kingdoms.com/en/collections/42-buildings', verifiedAt: buildingsVerifiedAt },
];

export const buildings: readonly Building[] = [
${out.join('\n')}
];
`,
);
console.log(`wrote ${out.length} buildings`);
