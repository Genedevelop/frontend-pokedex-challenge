# Botnoi Pokédex

A solution to the [Botnoi Pokédex challenge](https://github.com/ntwrcht/bn-pokedex). The original brief
is kept in [CHALLENGE.md](CHALLENGE.md).

Built with Angular 22, using standalone components, signals, `rxResource`, the built-in control flow and
zoneless change detection. Tests run on Vitest.

## Run

```bash
npm install
npm run api     # mock card service on http://localhost:3030
npm start       # app on http://localhost:4200 (proxies /api to the mock service)
```

Open the app at an iPad-sized (1024×768) viewport. Per the brief, the layout is not responsive.

```bash
npm run test:ci # unit + component tests, single run
npm run build
```

## What it does

| Story | Where |
|:--|:--|
| See / add / remove cards in my Pokédex | `app.html`, `pokedex/pokedex-store.ts` (persisted to localStorage) |
| Search by name **or** type | `pokemon/card-api.ts`: one box, two API calls merged (the API ANDs `name` + `type`) |
| Only unselected cards in results | `search-modal.ts` → `unselected` |
| Close the modal by clicking outside | backdrop click (and <kbd>Esc</kbd>) |
| HP / STR / WEAK levels + happiness | `pokemon/card-stats.ts` |

## Stat decisions

The formulas live in `src/app/pokemon/card-stats.ts`, with tests in `card-stats.spec.ts`.

- Numbers are read from their leading digits, so `50+`, `20×`, `80＋` count as 50, 20 and 80. A missing
  value, an empty string or `"None"` counts as 0.
- **Happiness** is `round((HPlevel/10 + Damage/10 + 10 - WeaknessCount) / 5)`, floored at 0. The brief
  doesn't say which HP, which weakness or how to round. This version matches the face count on every card
  in the interactive mockup (Deoxys ex 5, Cubone 4, Charmander 4, Infernape 6, Greninja 6). Raw HP would
  give Greninja 7.
- ⚠️ The README's worked example lists `happiness: 5`, but the formula gives 5.6 for its inputs. It only
  reaches 5 if you truncate, and truncating contradicts the mockup (Cubone 3.6 shows 4 faces). I went with
  the mockup and rounded, so that example gives 6.

## Layout

```
server/server.js          mock API from the brief (unchanged apart from the mock path)
mock/cards.json           100 cards
src/_theme.scss           colour tokens from screenshot/color-codes.png
src/app/pokemon/          Card model, stat maths, API client
src/app/pokedex/          PokedexStore (signals + localStorage)
src/app/pokemon-card/     one card: art, level tubes, happiness, Add/X action
src/app/search-modal/     search box, debounced results, backdrop close
```
