// Tribe overview — numbers from the official help center; descriptions are our own wording.
import type { Localized, SourceInfo, Tribe } from '../domain/types';

export interface SpecialBuilding {
  /** Building id — the name comes from the building data. */
  readonly id: string;
  readonly summary: Localized;
  readonly source: string;
}

export interface TribeInfo {
  readonly id: Tribe;
  readonly merchant: { readonly capacity: number; readonly speed: number };
  readonly wall: { readonly id: string; readonly summary: Localized };
  readonly specialBuildings: readonly SpecialBuilding[];
  readonly heroBonus: Localized;
  readonly heroBonusNote?: Localized;
  readonly troops: Localized;
  readonly strengths: readonly Localized[];
  readonly weaknesses: readonly Localized[];
  readonly recommendedFor: Localized;
}

const verifiedAt = '2026-10-27';
const art = (slug: string) => `https://support.kingdoms.com/en/articles/${slug}`;

export const tribesSource: readonly SourceInfo[] = [{ source: art('2-tribes'), verifiedAt }];

export const tribes: Readonly<Record<Tribe, TribeInfo>> = {
  roman: {
    id: 'roman',
    merchant: { capacity: 500, speed: 16 },
    wall: {
      id: 'city-wall',
      summary: {
        cs: 'Vysoký obranný bonus, ale berani ji snadno zboří.',
        en: 'High defence bonus, but rams knock it down easily.',
      },
    },
    specialBuildings: [
      {
        id: 'horse-drinking-trough',
        summary: {
          cs: 'Jízda se cvičí o 1 % rychleji za každý level a spotřebuje méně obilí; zrychluje i léčení. Vyžaduje Shromaždiště 10 a Stáje 20.',
          en: 'Cavalry trains 1% faster per level and eats less crop; also speeds up healing. Requires Rally Point 10 and Stable 20.',
        },
        source: art('90-horse-drinking-trough-romans'),
      },
    ],
    heroBonus: {
      cs: '+25 % síly za každý bod dovednosti',
      en: '+25% strength per skill point',
    },
    heroBonusNote: {
      cs: 'Převzato přesně podle oficiální nápovědy – formulaci ověřit ve hře.',
      en: 'Quoted exactly from the official help — wording to be verified in game.',
    },
    troops: {
      cs: 'Pomalé a drahé jednotky s dlouhým výcvikem.',
      en: 'Slow, expensive troops with long training.',
    },
    strengths: [
      {
        cs: 'Silné jednotky – Legionnaire a Praetorian jsou solidní obránci.',
        en: 'Strong troops — Legionnaire and Praetorian are solid defenders.',
      },
      { cs: 'Kvalitní jízda na farmení.', en: 'Good cavalry for raiding.' },
      {
        cs: 'Stavba dvou věcí najednou (extra stavební slot) zrychluje rozvoj.',
        en: 'Building two things at once (extra construction slot) speeds up development.',
      },
      { cs: 'Senator výrazně snižuje loajalitu.', en: 'The Senator lowers loyalty strongly.' },
      {
        cs: 'Obchodní kancelář vyvažuje malou nosnost obchodníků.',
        en: 'The Trade Office makes up for the small merchant capacity.',
      },
    ],
    weaknesses: [{ cs: 'Rozvoj armády je pomalý a nákladný.', en: 'Building an army is slow and costly.' }],
    recommendedFor: { cs: 'Zkušenější hráče.', en: 'Experienced players.' },
  },
  gaul: {
    id: 'gaul',
    merchant: { capacity: 750, speed: 24 },
    wall: {
      id: 'palisade',
      summary: {
        cs: 'Oficiální nápověda její odolnost slovně nehodnotí.',
        en: 'The official help doesn’t rate its durability.',
      },
    },
    specialBuildings: [
      {
        id: 'cranny',
        summary: {
          cs: 'Galská skrýš schová dvojnásobek surovin.',
          en: 'A Gaul cranny hides twice as many resources.',
        },
        source: art('68-cranny'),
      },
      {
        id: 'trapper',
        summary: {
          cs: 'Před bitvou chytí část útočících jednotek; zajatci dál jedí obilí ve své domovské vesnici. Po levelu 20 lze ve vesnici postavit další. Vyžaduje Shromaždiště 1.',
          en: 'Captures part of the attacking troops before the battle; prisoners keep eating crop in their home village. Another one can be built after level 20. Requires Rally Point 1.',
        },
        source: art('92-trapper-gauls'),
      },
    ],
    heroBonus: {
      cs: '+5 polí/h rychlost pro hrdinu na koni',
      en: '+5 fields/h speed for a mounted hero',
    },
    troops: {
      cs: 'Rychlé jednotky se střední cenou i dobou výcviku.',
      en: 'Fast troops with medium cost and training time.',
    },
    strengths: [
      { cs: 'Silná obrana.', en: 'Strong defence.' },
      { cs: 'Rychlá jízda.', en: 'Fast cavalry.' },
      { cs: 'Flexibilní mezi útokem a obranou.', en: 'Flexible between offence and defence.' },
      { cs: 'Nejrychlejší obchodníci.', en: 'The fastest merchants.' },
      {
        cs: 'Druidrider a Theutates Thunder se hodí na obranu i farmení.',
        en: 'Druidrider and Theutates Thunder are good for both defence and raiding.',
      },
    ],
    weaknesses: [{ cs: 'Drahé obléhací stroje.', en: 'Expensive siege weapons.' }],
    recommendedFor: { cs: 'Začátečníky.', en: 'Beginners.' },
  },
  teuton: {
    id: 'teuton',
    merchant: { capacity: 1000, speed: 12 },
    wall: {
      id: 'earth-wall',
      summary: {
        cs: 'Těžko zbořitelná, ale s nízkým obranným bonusem.',
        en: 'Hard to destroy, but with a low defence bonus.',
      },
    },
    specialBuildings: [
      {
        id: 'brewery',
        summary: {
          cs: '+1 % útoku za level pro všechny vesnice. Daň: přesvědčování náčelníků je o 50 % slabší a katapulty střílí jen na náhodné cíle. Jen v hlavní vesnici; vyžaduje Sýpku 20 a Shromaždiště 10.',
          en: '+1% attack per level for all villages. The price: chiefs persuade 50% less and catapults only hit random targets. Capital only; requires Granary 20 and Rally Point 10.',
        },
        source: art('91-brewery-teutons'),
      },
    ],
    heroBonus: {
      cs: '20 % cranny dip (lepší loupení), když hrdina jde s útokem',
      en: '20% cranny dip (better plundering) when the hero joins an attack',
    },
    troops: {
      cs: 'Střední rychlost, levné, velmi rychlý výcvik.',
      en: 'Medium speed, cheap, very fast training.',
    },
    strengths: [
      {
        cs: 'Levní a rychle cvičení Clubswingeři na nepřetržité farmení.',
        en: 'Cheap, quickly trained Clubswingers for non-stop raiding.',
      },
      { cs: 'Dostupní Chiefové.', en: 'Affordable Chiefs.' },
      { cs: 'Efektivní na krátkou vzdálenost.', en: 'Effective at short range.' },
      { cs: 'Spearfighter proti jízdě.', en: 'Spearfighters counter cavalry.' },
    ],
    weaknesses: [
      {
        cs: 'Útoky na dálku potřebují víc jednotek, které jsou drahé na obilí.',
        en: 'Long-range attacks need more troops, which are costly to feed.',
      },
      {
        cs: 'Pivovar omezuje cílení katapultů a oslabuje náčelníky.',
        en: 'The Brewery limits catapult targeting and weakens chiefs.',
      },
    ],
    recommendedFor: { cs: 'Aktivní, agresivní farmery.', en: 'Active, aggressive raiders.' },
  },
};
