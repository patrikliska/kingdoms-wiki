// One-off generator: scratchpad/quests.json -> src/data/quests.ts
const fs = require('fs');
const path = require('path');
const [, , input, output] = process.argv;
const d = JSON.parse(fs.readFileSync(input, 'utf8'));

// Our own wording of the research notes, in every UI language.
// Ids listed in UNVERIFIED are inferred, not rows in the official table.
const NOTES = {
  wh10: {
    cs: 'Odměna zvedne Sklad surovin v aktivní vesnici na úroveň 12 – jen pokud je tam na úrovni 10–11.',
    en: 'The reward raises the Warehouse in the active village to level 12 — only if it is at level 10–11 there.',
  },
  tutorial: {
    cs: 'Ve zdroji jsou sloupce Requires i Other prázdné („/“).',
    en: 'The source leaves both the Requires and Other columns empty (“/”).',
  },
  stolen1: {
    cs: 'Zdroj uvádí odměnu „35 SP“, ostatní questy na kradené zboží dávají XP – možná překlep.',
    en: 'The source lists “35 SP” as the reward while the other stolen-goods quests give XP — possibly a typo.',
  },
  animals: {
    cs: 'Prerekvizita „3 Adventures“ patří Chieftainovi (závislost napříč zadavateli).',
    en: 'The prerequisite “3 Adventures” belongs to the Chieftain (cross-giver dependency).',
  },
  trib3: {
    cs: 'V oficiální tabulce chybí – je jen uveden jako prerekvizita dalšího questu. Odměna neznámá.',
    en: 'Missing from the official table — only mentioned as a prerequisite of the next quest. Reward unknown.',
  },
  trib300: {
    cs: 'Ve zdroji chybí označení „King“, které mají ostatní questy na tributy – roli jsme doplnili podle nich.',
    en: 'The source lacks the “King” marker the other tribute quests have — we set the role by analogy.',
  },
  stolen300: {
    cs: 'V oficiální tabulce chybí – je jen uveden jako prerekvizita dalšího questu. Odměna neznámá.',
    en: 'Missing from the official table — only mentioned as a prerequisite of the next quest. Reward unknown.',
  },
  heroprod: {
    cs: 'Odměna: 700 jedné suroviny podle vlastní volby.',
    en: 'Reward: 700 of one resource of your choice.',
  },
  res5: {
    cs: 'Odměna zvedne Rezidenci/Palác v aktivní vesnici na úroveň 10 – jen pokud je tam na úrovni 5–9.',
    en: 'The reward raises the Residence/Palace in the active village to level 10 — only if it is at level 5–9 there.',
  },
  own5: {
    cs: 'Buňka s obilím je ve zdroji prázdná (uvedeno 0).',
    en: 'The crop cell is empty in the source (shown as 0).',
  },
};
const UNVERIFIED = new Set(['trib3', 'stolen300', 'trib300']);

// Official in-game titles (game client localization, see sources/quest-titles.json).
// Our quest id → client QuestHeader key. Reviewed by hand: the help center's English
// wording differs from the client's, so this is an explicit table, not a fuzzy match.
const titles = JSON.parse(fs.readFileSync(path.join(path.dirname(input), 'quest-titles.json'), 'utf8'));
const GAME_KEY = {
  each1: '600',
  gr1: '703',
  cf1: '621',
  wh1: '702',
  cp1: '602',
  wc1: '601',
  im1: '603',
  allcf2: '622',
  each2: '604',
  allrf2: '605',
  allcf3: '643',
  allrf3: '613',
  wh3: '628',
  cf5: '623',
  gr3: '625',
  each5: '606',
  gm1: '624',
  wh5: '608',
  allrf5: '607',
  gr5: '704',
  allcf5: '629',
  allrf7: '609',
  allcf7: '630',
  wh10: '644',
  gr10: '705',
  cp10: '611',
  wc10: '610',
  im10: '612',
  by1: '632',
  sm1: '633',
  if1: '634',
  cf10: '626',
  allrf10: '635',
  allcf10: '636',
  bk1: '627',
  allrf12: '637',
  allcf12: '638',
  rf10x5: '639',
  cf10x5: '640',
  rf10x12: '641',
  cf10x12: '642',
  finishnow: '905',
  tutorial: '205',
  rename: '202',
  units5: '504',
  units25: '505',
  units100: '506',
  units250: '507',
  units500: '503',
  units1000: '508',
  units3000: '502',
  units10000: '509',
  units30000: '517',
  units100000: '518',
  trib1: '519_King',
  stolen1: '519_Governor',
  trib3: '537_King',
  stolen3: '537_Governor',
  trib10: '520_King',
  stolen10: '520_Governor',
  trib50: '521_King',
  stolen50: '521_Governor',
  trib100: '522_King',
  stolen100: '522_Governor',
  trib300: '523_King',
  stolen300: '523_Governor',
  trib1000: '534_King',
  stolen1000: '534_Governor',
  trib3000: '535_King',
  stolen3000: '535_Governor',
  emb1: '533',
  animals: '850',
  bar3: '511',
  acad1: '536',
  acad5: '512',
  smith3: '510',
  stab1: '538',
  // tribe variants: _1 Romans, _2 Teutons, _3 Gauls (client tribe ids)
  reseql: '513_1',
  ressc: '513_2',
  respf: '513_3',
  eql5: '515_1',
  sc5: '515_2',
  pf5: '515_3',
  spy: '516',
  ws1: '539',
  siege10: '540',
  support: '906',
  cr1: '501',
  cr5: '526',
  robber: '524',
  oasis: '631',
  rubble: '660',
  adv1: '826',
  horse: '814',
  mp1: '701',
  trade: '715',
  heroprod: '801',
  npc: '561',
  sellitem: '812',
  bid: '815',
  adv3: '827',
  adv10: '821',
  hero5: '831',
  adv20: '822',
  res1: '712',
  res5: '714',
  settlers3: '721',
  gear: '820',
  mp5: '713',
  village2: '722',
  sendres: '716',
  instant: '717',
  th1: '733',
  celsmall: '741',
  hero10: '832',
  adv33: '825',
  cityorvil: '731',
  adv50: '823',
  cellarge: '742',
  hero25: '833',
  hero50: '834',
  own5: '734',
  adv100: '824',
  hero100: '835',
  own10: '735',
  own15: '736',
  adv200: '828',
  hero150: '836',
  adv350: '829',
  own20: '737',
  hero200: '837',
  adv500: '830',
  hero250: '838',
  duke: '901',
  skill: '902',
  heal: '903',
  invite: '904',
};
{
  const used = new Map();
  for (const x of d.quests) {
    const key = GAME_KEY[x.id];
    if (!key) throw new Error(`no game title key for quest ${x.id} (${x.name})`);
    if (!titles.titles[key]) throw new Error(`game title ${key} missing for quest ${x.id}`);
    if (used.has(key)) throw new Error(`game title ${key} used by both ${used.get(key)} and ${x.id}`);
    used.set(key, x.id);
  }
  const extra = Object.keys(GAME_KEY).filter((id) => !d.quests.some((x) => x.id === id));
  if (extra.length) throw new Error(`GAME_KEY has unknown quest ids: ${extra.join(', ')}`);
}

const q = (s) => JSON.stringify(s);
const res = (r) => {
  const base = `{ wood: ${r.wood}, clay: ${r.clay}, iron: ${r.iron}, crop: ${r.crop}`;
  return r.other ? `${base}, other: ${q(r.other)} }` : `${base} }`;
};
const reward = (r) => {
  if (r === null) return 'null';
  if (r.rt)
    return `{ rt: { roman: ${res(r.rt.roman)}, gaul: ${res(r.rt.gaul)}, teuton: ${res(r.rt.teuton)} } }`;
  return res(r);
};

const lines = d.quests.map((x) => {
  const parts = [
    `id: ${q(x.id)}`,
    `giver: ${q(x.giver)}`,
    `name: ${q(titles.titles[GAME_KEY[x.id]])}`,
    `gameKey: ${q(GAME_KEY[x.id])}`,
    `task: ${q(x.task)}`,
    `requires: [${x.requires.map(q).join(', ')}]`,
    `role: ${q(x.role ?? 'all')}`,
    `reward: ${reward(x.reward)}`,
  ];
  if (x.tribe) parts.push(`tribe: ${q(x.tribe)}`);
  if (NOTES[x.id]) parts.push(`note: ${q(NOTES[x.id])}`);
  else if (x.note) throw new Error(`untranslated note for ${x.id}: ${x.note}`);
  if (UNVERIFIED.has(x.id)) parts.push('unverified: true');
  // Keep the help center's wording searchable when it differs from the in-game title.
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (norm(x.name) !== norm(titles.titles[GAME_KEY[x.id]].en)) parts.push(`aliases: [${q(x.name)}]`);
  return `  { ${parts.join(', ')} },`;
});

const out = `// Generated from the official quest table — edit data here, keep ids stable (they are in URLs).
import type { SourceInfo } from '../domain/types';
import type { Quest } from './questTypes';

export const questsSource: SourceInfo = {
  source: ${q(d.source)},
  verifiedAt: ${q(d.verifiedAt)},
};

export const quests = [
${lines.join('\n')}
] as const satisfies readonly Quest[];

export type QuestId = (typeof quests)[number]['id'];

export const dailyQuestsSource: SourceInfo = {
  source: ${q(d.daily.source)},
  verifiedAt: ${q(d.verifiedAt)},
};

/** Quest titles exactly as the game shows them (official client localization, client ${titles.clientVersion}). */
export const questTitlesSource: SourceInfo = {
  source: ${q(titles.source[0])},
  verifiedAt: ${q(titles.verifiedAt)},
};
`;
fs.writeFileSync(output, out);
console.log(`wrote ${d.quests.length} quests`);
