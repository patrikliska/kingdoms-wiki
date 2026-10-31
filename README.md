# Kingdoms Companion

Rychlá příručka pro hráče **Travian Kingdoms** (ne Legends) – questy, národy, budovy, zdi, jednotky.
Statická PWA, funguje offline na mobilu vedle hry. Pravidla projektu viz [CLAUDE.md](CLAUDE.md).

## Vývoj

```sh
pnpm install
pnpm dev          # vývojový server
pnpm lint         # ESLint + Prettier
pnpm test         # Vitest (domain logika + kontrola dat)
pnpm e2e          # Playwright (desktop + mobil), poprvé: pnpm exec playwright install chromium
pnpm build        # produkční build + service worker
```

## Jazyky

UI je česky a anglicky (přepínač CZ / EN v hlavičce). Výchozí jazyk se určí v prohlížeči bez síťového
dotazu: čeština, pokud prohlížeč preferuje češtinu nebo zařízení běží v časové zóně Europe/Prague, jinak
angličtina. Ruční volba se uloží. Texty jsou v `src/lib/messages/{cs,en}.ts` (TypeScript hlídá, že EN má
všechny klíče), poznámky v datech jako `{ cs, en }`.

## Data

Herní data v `src/data/*.ts` jsou **generovaná** z výpisů zdrojů v `scripts/data-import/sources/`:

| Soubor         | Zdroj                                                                                                                                                                                                                                                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `quests.ts`    | odměny a řetězy: support.kingdoms.com/en/articles/7-quests (+ 6-daily-quests); **názvy questů CZ/EN přesně jako ve hře**: veřejná lokalizace herního klienta `static.kingdoms.com/game/<verze>/lang/cz_quests_version2.js` + `en_…` → `sources/quest-titles.json`, mapování v `GAME_KEY` (`gen-quests.cjs`) |
| `units.ts`     | support.kingdoms.com – troop specifications (109), research (108), články jednotek; cross-check kirilloid (Kingdoms / T5)                                                                                                                                                                                   |
| `buildings.ts` | oficiální kalkulačka budov tk-kb.kingdoms.com (odkazovaná z help centra)                                                                                                                                                                                                                                    |
| `tribes.ts`    | ručně – čísla z support.kingdoms.com/en/articles/2-tribes, texty vlastními slovy                                                                                                                                                                                                                            |

Po aktualizaci výpisu ve `sources/` spusť `pnpm data:import`. Testy v `src/data/*.test.ts` hlídají
integritu (prerekvizity questů, počty levelů, bonusy zdí = 1.03 / 1.025 / 1.02 ^ lvl).

## Licence assetů

- Ikony surovin (wood/clay/iron/crop): [game-icons.net](https://game-icons.net) – „log“ a „brick-wall“ od Delapouite, „metal-bar“ a „wheat“ od Lorc, licence [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). Uvedeno i v aplikaci (sidebar, stránka Více). Cesty jsou v `src/components/resourceGlyphs.ts`.
- Písma Inter a Alegreya: SIL Open Font License 1.1 (balíčky `@fontsource`).
- Ostatní ikony jsou vlastní (`src/components/Icon.tsx`).

## K ověření

- Odměny questů `Collect 3 Tributes` a `Sell 300 stolen goods` (v oficiální tabulce chybí; ve hře existují – klíče 537 a 523).
- Daily questy – oficiální nápověda neuvádí konkrétní úkoly ani odměny.
- Časy výzkumu jednotek (možná uvedené pro rychlejší svět) a časy výcviku (Kingdoms je nezveřejňuje).
- Odolnost zdí proti beranům a bonus Water Ditch per level.
- Bonus římského hrdiny – formulace převzatá z nápovědy.
