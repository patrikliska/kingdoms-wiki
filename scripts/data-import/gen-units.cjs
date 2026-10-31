// One-off generator: scratchpad/tribes-units.json -> src/data/units.ts
const fs = require('fs');
const [, , input, output] = process.argv;
const d = JSON.parse(fs.readFileSync(input, 'utf8'));
const q = (s) => JSON.stringify(s);

// "Academy 5, Stable 1" -> [{ building: 'academy', level: 5 }, ...]
const slug = (name) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
const parseRequires = (s) =>
  !s || s === 'none'
    ? []
    : s.split(',').map((part) => {
        const m = part.trim().match(/^(.*?)\s+(\d+)$/);
        if (!m) throw new Error(`cannot parse requirement "${part}"`);
        return `{ building: ${q(slug(m[1]))}, level: ${m[2]} }`;
      });

const rows = [];
for (const tribe of ['roman', 'gaul', 'teuton']) {
  for (const u of d.units[tribe]) {
    const c = u.cost;
    const parts = [
      `id: ${q(u.id)}`,
      `tribe: ${q(tribe)}`,
      `name: ${q(u.name)}`,
      `type: ${q(u.type)}`,
      `attack: ${u.attack}`,
      `defInf: ${u.defInf}`,
      `defCav: ${u.defCav}`,
      `cost: { wood: ${c.wood}, clay: ${c.clay}, iron: ${c.iron}, crop: ${c.crop} }`,
      `speed: ${u.speed}`,
      `carry: ${u.carry}`,
      `upkeep: ${u.upkeep}`,
      `building: ${q(u.building === 'palace|residence' ? 'residence-palace' : u.building)}`,
      `requires: [${parseRequires(u.requires).join(', ')}]`,
      u.research
        ? `research: { cost: { wood: ${u.research.wood}, clay: ${u.research.clay}, iron: ${u.research.iron}, crop: 0 }, time: ${u.research.time} }`
        : 'research: null',
      `source: ${q(u.source)}`,
    ];
    rows.push(`  { ${parts.join(', ')} },`);
  }
}

fs.writeFileSync(
  output,
  `// Generated from the official troop articles (support.kingdoms.com), cross-checked with kirilloid (Kingdoms / T5).
// Keep ids stable — they are in URLs.
import type { SourceInfo } from '../domain/types';
import type { Unit } from './unitTypes';

export const unitsSource: readonly SourceInfo[] = [
  { source: 'https://support.kingdoms.com/en/articles/109-troop-specifications', verifiedAt: ${q(d.verifiedAt)} },
  { source: 'https://support.kingdoms.com/en/articles/108-troop-research', verifiedAt: ${q(d.verifiedAt)} },
];

export const units = [
${rows.join('\n')}
] as const satisfies readonly Unit[];

export type UnitId = (typeof units)[number]['id'];
`,
);
console.log(`wrote ${rows.length} units`);
