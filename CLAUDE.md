# CLAUDE.md – Travian Kingdoms Companion

## What this is

A web app (companion / reference tool) for **Travian Kingdoms** players. Goal: a player opens the site on a second monitor or a phone while playing and finds what they need within 10 seconds – a quest reward, a building's cost, how many rams a wall takes, how tribute works.

**The most important rule of the project: this is Travian KINGDOMS, not Travian Legends (classic).** They are two different games with a shared core. Kingdoms has only 3 tribes (Romans, Gauls, Teutons), kings/governors, tributes, stolen goods, robber hideouts/camps, active treasures and a WW decided by kingdom victory points. It has no Egyptians, Huns, Spartans or Vikings, no alliances in the Legends sense, no artifacts and no ancient powers. If you are not sure a mechanic or number applies to Kingdoms, **don't write it** – mark it as a TODO to verify.

## Data sources (in order of trust)

1. **support.kingdoms.com** – the official Travian Games help center. Primary source for mechanics and tables (quests: `/en/articles/7-quests`, tribes: `/en/articles/2-tribes`, infrastructure, combat basics, daily quests, robber hideouts).
2. **travian.kirilloid.ru** switched to Kingdoms – calculators, formulas, building costs, combat simulator. Always check that the Kingdoms version is selected.
3. **blog.kingdoms.com** – changelogs and announcements (mechanics change, so every table records its verification date).
4. Fandom wiki (travian.fandom.com) and similar – **DO NOT USE**. They mix Legends and Kingdoms and contain 15-year-old versions.

Every data file has a `source` (URL) and `verifiedAt` (ISO date) in its header. Numbers computed from a formula (e.g. building costs = base × 1.28^(lvl−1)) are marked `derived: true` together with the formula.

## Stack

- **React 19 + TypeScript (strict)**, **Vite**. No backend in the first phase – everything is static, data are typed modules / JSON.
- Styling: **CSS Modules + CSS custom properties**. No MUI, no Tailwind – we want our own look, not a generic admin feel. Light and dark mode via `prefers-color-scheme` plus a manual switch.
- State: **Jotai** (`atomWithStorage` for user choices – tribe, role, favourites).
- Routing: **react-router** (file-ish structure, every module has its own route).
- Tests: **Vitest** for logic (formulas, chain traversal), **Playwright** for e2e of key flows.
- Lint/format: ESLint + Prettier, `pnpm`.
- i18n from day one via a simple `t()` dictionary. Default language **Czech** (English also supported); names of game entities (quests, buildings, units) as in the game – players know and search for them that way.
- PWA (manifest + service worker, offline data cache) – the game runs in a browser, the companion has to work on a phone next to it.

## Structure

```
src/
  app/            router, layout, theme, global providers
  data/           typed game data (source JSON/TS) + loader
    quests.ts
    buildings.ts
    units.ts
    walls.ts
  domain/         pure logic without React (formulas, chain traversal, calculations)
  modules/        one folder = one section of the site (see below)
    quests/
    buildings/
    units/
    walls/
    kingdom/
    hero/
    tools/
  components/     shared UI (ResourceAmount, TribeSwitch, DataTable, SearchBox…)
  lib/            utils, i18n, number formatting (cs-CZ, space as thousands separator)
```

Rule: `domain/` must not import from `modules/` or from React. All calculations must be testable without a DOM.

## Modules (MVP → later)

### MVP
1. **Quests** – quest tree by quest giver (Wren / Markus / Chieftain), prerequisites, what gets unlocked, rewards per tribe, king/governor filter, full-text search, reward total of a branch. Existing prototype: `travian-kingdoms-quests.html` – port the logic 1:1 (data, `ancestors`/`descendants`, lineage), rewrite the UI as components. Daily quests as a separate tab.
2. **Tribes** – Romans/Gauls/Teutons compared: merchants, speed, special buildings, hero bonuses, strengths/weaknesses. Official table from support.kingdoms.com.
3. **Walls** – City Wall / Palisade / Earth Wall: cost per level, cumulative cost, bonus (1.03 / 1.025 / 1.02 ^ lvl), resistance to rams. Water Ditch (Romans, cities only). Rate ram resistance only qualitatively until it is verified for Kingdoms.
4. **Buildings** – catalog with costs per level, prerequisites, cumulative cost, build time (taking the Main Building into account), where it can be built (village/city/capital). Calculator: "how much does it cost me to get X to level Y".
5. **Units** – table per tribe: attack, infantry/cavalry defence, cost, speed, carry capacity, crop upkeep, research. Ratios (defence per cost, attack per crop).

### Later phases
6. **Kingdom mechanics** – king vs. governor, tribute, stolen goods and treasures, robber hideouts vs. robber camps, duke, influence, when to accept a king's offer.
7. **Hero** – adventures, items, skill points, what to upgrade when.
8. **Tools** – combat simulator (or a link to kirilloid), ram/catapult calculator, settler planner (CP), game speed converter (x1/x3/x5).
9. **Tips** – short, opinionated guides: first week per tribe, when to found a 2nd village, defensive vs. offensive account, common mistakes. Each tip: 3–8 sentences, no essays.

## UX / UI principles

- **Players search, they don't read.** Global search (⌘K / a button on mobile) covers quests, buildings, units and tips. Results appear instantly, no "results" page.
- **One global tribe and role choice** (persisted). Every table follows it; never show three "Romans/Gauls/Teutons" columns when the user plays only one – a switch yes, a comparison view on request.
- **Numbers are the content.** Format by locale (`cs-CZ` / `en`), a resource always with its icon/colour (wood/clay/iron/crop in this order, as in the game), never shorten big numbers to "12k" in tables – only in summaries.
- **Mobile first.** The game runs in a browser and the companion will often be on a phone. Tables scroll horizontally inside their container, never the whole page. The detail panel is a sheet on mobile, not a sticky block covering half the screen.
- Navigation: left sidebar (desktop) / bottom tab bar (mobile), at most 6 top-level items. No breadcrumb needed – depth is at most 2.
- Look: our own identity inspired by the game (parchment, ink, green as the active state), but legibility over atmosphere. No decorative animations, only transitions on user action. Fonts: one serif for headings (Alegreya), one sans for data and UI (Alegreya Sans). Line height and contrast per WCAG AA.
- Every table/section has a footer "Source · verified DD.MM.YYYY". It builds trust and sets us apart from the fandom wiki.
- Accessibility: fully keyboard operable, visible focus, `prefers-reduced-motion`, `aria-pressed` on toggles.
- Shareable URLs: every quest, building and unit has its own path (`/quests/siege10`, `/buildings/city-wall?lvl=20`). Filter state lives in query parameters.

## Hosting

- Now: **GitHub Pages** at `https://patrikliska.github.io/kingdoms-wiki/`, deployed by `.github/workflows/ci.yml` on every push to `master` (after lint, typecheck, unit and e2e tests pass).
- Later: own domain on our virtual server (the one that already hosts patrikliska.dev).
- The base path comes from the `BASE_PATH` env variable at build time (`/kingdoms-wiki/` on GitHub Pages, `/` on our own domain). Never hard-code absolute paths like `/favicon.svg` – use `import.meta.env.BASE_URL`; router paths are relative to the router `basename`.

## Code conventions

- Function components and hooks; props typed explicitly, no `any`.
- Game data are `as const` + derived types; IDs are stable slugs (`u5`, `rf7`, `wh10`) – never change them, they are part of URLs.
- Model rewards as `{ wood, clay, iron, crop }` + `other?: string`; per-tribe variants as `rt: Record<Tribe, Reward>`, not three separate records.
- No "special case" in the UI for a specific quest – everything is driven by data.
- Event handling on lists via delegation or React – **never** build DOM with `innerHTML +=` (see the prototype bug).
- Commit messages in English, imperative, with a module prefix: `quests: add daily quests tab`.
- Commits are authored by Patrik Liška only – no `Co-Authored-By` trailers or other attribution lines in commits or PRs.
- All documentation (README, CLAUDE.md, code comments) is in English. UI texts are in Czech and English (`src/lib/messages/`).
- Before a PR: `pnpm lint && pnpm test && pnpm e2e`.

## Don'ts

- Don't mix in Legends mechanics (artifacts, Egyptians, alliances, ancient powers, Natar WW plans from Legends).
- Don't copy text or images from official sites – data yes (numbers are not copyrightable), wording in our own words, our own assets.
- Don't add a backend, accounts or sync until it is clear players want it. Persist locally.
- Don't build a "universal wiki". Every module has to answer a specific player question.

## Open questions (resolve before implementing the module)

- Exact wall resistance coefficients against rams in Kingdoms – verify in the in-game simulator or kirilloid (Kingdoms mode).
- Quests `Collect 3 Tributes` and `Sell 300 stolen goods` – the official table has no reward for them.
- World speeds (x1/x3/x5) – they affect build, training and travel times; decide between a global switch and a per-tool setting.
- Project name and domain.
