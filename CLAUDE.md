# CLAUDE.md – Travian Kingdoms Companion

## Co to je

Webová aplikace (companion / reference tool) pro hráče **Travian Kingdoms**. Cíl: hráč během hry otevře web na druhém monitoru nebo mobilu a do 10 sekund najde, co potřebuje – odměnu za quest, cenu budovy, kolik beranů na zeď, jak funguje tribut.

**Nejdůležitější pravidlo projektu: jde o Travian KINGDOMS, ne Travian Legends (klasik).** Jsou to dvě odlišné hry se společným základem. Kingdoms má jen 3 národy (Římané, Galové, Germáni), krále/guvernéry, tributy, kradené zboží (stolen goods), robber hideouts/camps, aktivní poklady (treasures) a WW přes kingdom victory points. Nemá Egypťany, Huny, Sparťany, Vikingy, aliance v legendovém smyslu, artefakty ani ancient powers. Pokud si nejsi jistý, že mechanika/číslo platí pro Kingdoms, **nepiš to** – označ to jako TODO k ověření.

## Zdroje dat (v tomto pořadí důvěryhodnosti)

1. **support.kingdoms.com** – oficiální help center Travian Games. Primární zdroj pro mechaniky a tabulky (questy: `/en/articles/7-quests`, národy: `/en/articles/2-tribes`, infrastruktura, combat basics, daily quests, robber hideouts).
2. **travian.kirilloid.ru** přepnutý na Kingdoms – kalkulačky, vzorce, ceny budov, simulátor boje. Ověřovat, že je zvolená verze Kingdoms.
3. **blog.kingdoms.com** – changelogy a oznámení (mechaniky se mění, u každé tabulky evidovat datum ověření).
4. Fandom wiki (travian.fandom.com) a podobné **NEPOUŽÍVAT** – mix Legends/Kingdoms a 15 let starých verzí.

Každý datový soubor má v hlavičce `source` (URL) a `verifiedAt` (ISO datum). Čísla, která jsou dopočítaná vzorcem (např. ceny budov = base × 1.28^(lvl−1)), označit `derived: true` a uvést vzorec.

## Stack

- **React 19 + TypeScript (strict)**, **Vite**. Žádný backend v první fázi – vše statické, data jako typované moduly / JSON.
- Styling: **CSS Modules + CSS custom properties**. Ne MUI, ne Tailwind – chceme vlastní vizuál, ne generický admin look. Light i dark mode přes `prefers-color-scheme` + manuální přepínač.
- Stav: **Jotai** (atomWithStorage pro uživatelské volby – národ, role, oblíbené).
- Routing: **react-router** (file-ish struktura, každý modul má vlastní route).
- Testy: **Vitest** pro logiku (vzorce, chain traversal), **Playwright** pro e2e klíčových flow.
- Lint/format: ESLint + Prettier, `pnpm`.
- i18n od začátku přes jednoduchý `t()` slovník. Výchozí jazyk **čeština**, názvy herních entit (questy, budovy, jednotky) **anglicky** jako ve hře – hráči je tak znají a hledají.
- PWA (manifest + service worker, offline cache dat) – hra běží v prohlížeči, companion musí fungovat na mobilu vedle ní.

## Struktura

```
src/
  app/            router, layout, theme, global providers
  data/           typovaná herní data (zdrojové JSON/TS) + loader
    quests.ts
    buildings.ts
    units.ts
    walls.ts
  domain/         čistá logika bez Reactu (vzorce, chain traversal, výpočty)
  modules/        jedna složka = jedna sekce webu (viz níže)
    quests/
    buildings/
    units/
    walls/
    kingdom/
    hero/
    tools/
  components/     sdílené UI (ResourceAmount, TribeSwitch, DataTable, SearchBox…)
  lib/            utils, i18n, formátování čísel (cs-CZ, mezera jako oddělovač tisíců)
```

Pravidlo: `domain/` nesmí importovat z `modules/` ani z Reactu. Veškeré výpočty musí být testovatelné bez DOM.

## Moduly (MVP → později)

### MVP
1. **Questy** – strom questů podle zadavatelů (Wren / Markus / Chieftain), prerekvizity, co se odemkne, odměny per národ, filtr král/guvernér, fulltext, součet odměn ve větvi. Existující prototyp: `travian-kingdoms-quests.html` – přenést logiku 1:1 (data, `ancestors`/`descendants`, lineage), UI přepsat do komponent. Daily questy jako samostatná záložka.
2. **Národy** – srovnání Římané/Galové/Germáni: obchodníci, rychlost, speciální budovy, hero bonusy, výhody/nevýhody. Oficiální tabulka ze support.kingdoms.com.
3. **Zdi** – City Wall / Palisade / Earth Wall: ceny per level, kumulativní cena, bonus (1.03 / 1.025 / 1.02 ^ lvl), odolnost proti beranům. Water Ditch (Římané, jen města). Odolnost proti beranům zatím hodnotit jen kvalitativně, dokud nebude ověřeno pro Kingdoms.
4. **Budovy** – katalog s cenami per level, prerekvizity, kumulativní cena, čas stavby (zohlednit Main Building), kde se dá postavit (vesnice/město/capital). Kalkulačka „kolik mě stojí dostat X na level Y“.
5. **Jednotky** – tabulka per národ: off, deff pěchota/kavalerie, cena, rychlost, nosnost, spotřeba obilí, výzkum. Poměry (deff per cost, off per crop).

### Další fáze
6. **Kingdom mechaniky** – král vs. guvernér, tribut, kradené zboží a poklady, robber hideouts vs. robber camps, vévoda, influence, kdy přijmout nabídku krále.
7. **Hrdina** – adventures, itemy, skill pointy, co vylepšovat kdy.
8. **Nástroje** – simulátor boje (nebo odkaz na kirilloid), kalkulačka beranů/katapultů, plánovač settlerů (CP), převodník herní rychlosti (x1/x3/x5).
9. **Rady** – krátké, opinionated guidy: start 1. týden per národ, kdy založit 2. vesnici, deff vs. off účet, časté chyby. Každá rada: 3–8 vět, žádná slohová cvičení.

## UX / UI principy

- **Hráč hledá, nečte.** Globální search (⌘K / tlačítko na mobilu) prohledává questy, budovy, jednotky i rady. Výsledky okamžitě, bez stránky „výsledky“.
- **Jedna globální volba národa a role** (persistovaná). Všechny tabulky se jí řídí; nikdy nezobrazovat tři sloupce „Romans/Gauls/Teutons“, když uživatel hraje jen jeden – přepínač ano, srovnávací pohled na vyžádání.
- **Čísla jsou obsah.** Formát `cs-CZ`, surovina vždy s ikonou/barvou (dřevo/hlína/železo/obilí v tomhle pořadí, jako ve hře), velká čísla nikdy nezkracovat na „12k“ v tabulkách – jen v souhrnech.
- **Mobile first.** Hra běží v prohlížeči, companion bude často na telefonu. Tabulky scrollují horizontálně uvnitř svého kontejneru, nikdy celá stránka. Detail panel na mobilu jako sheet, ne sticky blok přes půl obrazovky.
- Navigace: levý sidebar (desktop) / spodní tab bar (mobil), max 6 položek první úrovně. Breadcrumb není potřeba – hloubka max 2.
- Vizuál: vlastní identita inspirovaná hrou (pergamen, inkoust, zelená jako aktivní stav), ale čitelnost nad atmosférou. Žádné dekorativní animace, jen přechody na uživatelskou akci. Font: jedna serif pro nadpisy (Alegreya), jedna sans pro data a UI (Alegreya Sans). Line-height a kontrast dle WCAG AA.
- Každá tabulka/sekce má patičku „Zdroj · ověřeno DD.MM.YYYY“. Buduje důvěru a odlišuje nás od fandom wiki.
- Přístupnost: plná ovladatelnost klávesnicí, viditelný focus, `prefers-reduced-motion`, aria-pressed na přepínačích.
- Sdílitelné URL: každý quest, budova, jednotka má vlastní cestu (`/quests/siege10`, `/buildings/city-wall?lvl=20`). Stav filtrů v query parametrech.

## Konvence v kódu

- Komponenty funkční, hooks; props typované explicitně, žádné `any`.
- Herní data jsou `as const` + odvozené typy; ID jsou stabilní slug (`u5`, `rf7`, `wh10`) – nikdy je neměnit, jsou v URL.
- Odměny modelovat jako `{ wood, clay, iron, crop }` + `other?: string`; per-národ varianty jako `rt: Record<Tribe, Reward>`, ne tři samostatné záznamy.
- Žádný „zvláštní případ“ v UI pro konkrétní quest – vše řídí data.
- Event handling na seznamech přes delegaci nebo React – **nikdy** skládat DOM přes `innerHTML +=` (viz chyba z prototypu).
- Commit zprávy anglicky, imperativ, prefix modulu: `quests: add daily quests tab`.
- Před PR: `pnpm lint && pnpm test && pnpm e2e`.

## Co NEdělat

- Nemíchat Legends mechaniky (artefakty, Egypťané, aliance, ancient powers, Natar WW plány z Legends).
- Nekopírovat text ani obrázky z oficiálních stránek – data ano (čísla nejsou autorské dílo), formulace přepsat vlastními slovy, assety vlastní.
- Nepřidávat backend, účty ani sync, dokud není jasné, že to hráči chtějí. Persistovat lokálně.
- Nestavět „univerzální wiki“. Každý modul musí odpovídat na konkrétní otázku hráče.

## Otevřené otázky (řešit před implementací modulu)

- Přesné koeficienty odolnosti zdí proti beranům v Kingdoms – ověřit v herním simulátoru nebo kirilloid (Kingdoms mode).
- Questy `Collect 3 Tributes` a `Sell 300 stolen goods` – v oficiální tabulce chybí odměna.
- Rychlosti světů (x1/x3/x5) – ovlivňují časy stavby, výcviku, pohybu; rozhodnout, zda globální přepínač nebo per-nástroj.
- Název a doména projektu.
