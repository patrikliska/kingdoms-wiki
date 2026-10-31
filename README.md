# Kingdoms Companion

A quick reference for **Travian Kingdoms** players (not Legends) – quests, tribes, buildings, walls, units.
A static PWA that works offline on a phone next to the game. Project rules are in [CLAUDE.md](CLAUDE.md).

## Development

```sh
pnpm install
pnpm dev          # dev server
pnpm lint         # ESLint + Prettier
pnpm test         # Vitest (domain logic + data checks)
pnpm e2e          # Playwright (desktop + mobile); first time: pnpm exec playwright install chromium
pnpm build        # production build + service worker
```

## Languages

The UI is in Czech and English (CZ / EN switch in the header). The default language is detected in the
browser without any network request: Czech if the browser prefers Czech or the device runs in the
Europe/Prague time zone, English otherwise. A manual choice is saved. UI texts live in
`src/lib/messages/{cs,en}.ts` (TypeScript checks that EN has every key); notes in game data are `{ cs, en }`.

## Data

Game data in `src/data/*.ts` are **generated** from source dumps in `scripts/data-import/sources/`:

| File           | Source                                                                                                                                                                                                                                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `quests.ts`    | rewards and chains: support.kingdoms.com/en/articles/7-quests (+ 6-daily-quests); **Czech/English quest titles exactly as in the game**: the game client's public localisation `static.kingdoms.com/game/<version>/lang/cz_quests_version2.js` + `en_…` → `sources/quest-titles.json`, mapped in `GAME_KEY` (`gen-quests.cjs`) |
| `units.ts`     | support.kingdoms.com – troop specifications (109), research (108), unit articles; cross-checked with kirilloid (Kingdoms / T5)                                                                                                                                                                                                 |
| `buildings.ts` | the official building calculator tk-kb.kingdoms.com (linked from the help center)                                                                                                                                                                                                                                              |
| `tribes.ts`    | by hand – numbers from support.kingdoms.com/en/articles/2-tribes, texts in our own words                                                                                                                                                                                                                                       |

After updating a dump in `sources/`, run `pnpm data:import`. Tests in `src/data/*.test.ts` check data
integrity (quest prerequisites, level counts, wall bonuses = 1.03 / 1.025 / 1.02 ^ lvl).

## Asset licences

- Resource icons (wood/clay/iron/crop): [game-icons.net](https://game-icons.net) – "log" and "brick-wall" by Delapouite, "metal-bar" and "wheat" by Lorc, licensed [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). Also credited in the app (sidebar, More page). Paths are in `src/components/resourceGlyphs.ts`.
- Fonts Inter and Alegreya: SIL Open Font License 1.1 (`@fontsource` packages).
- All other icons are our own (`src/components/Icon.tsx`).

## To verify

- Rewards for the quests `Collect 3 Tributes` and `Sell 300 stolen goods` (missing from the official table; they exist in the game – keys 537 and 523).
- Daily quests – the official help doesn't list specific tasks or rewards.
- Unit research times (possibly listed for a faster world) and training times (Kingdoms doesn't publish them).
- Wall resistance to rams and the Water Ditch bonus per level.
- Roman hero bonus – the wording is taken from the help center.
