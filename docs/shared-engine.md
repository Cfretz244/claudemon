# `@claudemon/engine` — the headless half of the game

The rules and the content of this game are not about Phaser. Which move goes
first, how much a Thunderbolt hurts, what is on the counter in the Celadon
department store and where the warp on Route 5 leads — none of that needs a
canvas, a DOM or a texture atlas. Everything that *is* about Phaser (scenes,
sprites, tweens, audio, the save editor, the localStorage save) is the app.

`packages/engine` is that first half, extracted as an npm workspace package so a
second renderer — the 3D client — can play the same game rather than fork a
copy of it that slowly drifts.

This document describes the layout as it is TODAY. It is the first of four
planned steps; see "What comes next".

## Layout

```
packages/engine/
  package.json        # @claudemon/engine, ESM, files: ["dist"], subpath patterns
  tsconfig.json       # lib: ES2022, types: [] — no DOM, no Node, enforced by the compiler
  scripts/
    check.mjs         # every import inside the package must be relative
    esm.mjs           # rewrites dist's extensionless specifiers to real .js paths
  src/
    index.ts          # the public barrel: content + types + entities + logic + systems
    content.ts        # every data table (maps, species, moves, items, trainers, ...)
    types.ts          # the shared shapes: pokemon/map/battle types, Direction, SaveData
    data/             # 25 content modules, incl. the map chunks and mapBuilder
    entities/         # Pokemon.ts (createPokemon, stat maths), Player.ts (PlayerState)
    logic/            # 29 pure rule modules (turnFlow, chargeMoves, healing, oakLab, ...)
    systems/          # AISystem, BattleEngine, CatchSystem, DamageCalculator,
                      # EncounterSystem, EvolutionSystem, ExperienceSystem, SaveData
    types/            # pokemon.types.ts, map.types.ts, battle.types.ts
    utils/constants.ts
  tests/
    boundary.test.ts  # no phaser, no bare imports, no window/document/process
    packaging.test.ts # packs the tarball and imports it from bare Node
```

68 files moved out of `src/`. 67 of them are **byte-identical** to their old
selves — no import rewriting was needed, because the subtree moved together and
every relative path still resolves. The 68th is `systems/SaveSystem.ts`, which
was split: the `SaveData` interface is engine-owned (the 3D client needs the
shape), the `SaveSystem` class that calls `localStorage` stayed in the app.

### What deliberately did NOT move

| Stays in `src/` | Why |
|---|---|
| `data/musicTracks.ts` (2559 lines) | Track definitions are presentation. A second renderer will want its own. |
| `logic/moveAnimationSpec.ts`, `logic/entranceSpec.ts`, `logic/catchSequenceSpec.ts`, `logic/statusBadge.ts` | Animation choreography and HUD timing. Nothing in the engine imports them; they are in `logic/` by history, not by nature. |
| `data/battleSimConfig.ts`, `data/saveEditorPresets.ts`, `data/townThemes.ts` | Tooling and theming for this app's dev pages. |
| `systems/SaveSystem.ts` (the class), `systems/SoundSystem.ts`, `systems/MoveAnimations.ts`, `systems/animations/**` | `localStorage`, Web Audio, Phaser tweens. |
| `scenes/`, `components/`, `sprites/`, the rest of `utils/` | Phaser. |

`chargeMoves.ts` is a rule (when FLY comes down, what cancels a charge), so it
moved. The specs that decide what FLY *looks like* did not.

## How the app consumes it: a source alias, not a compiled `dist`

`tsconfig.json` `paths` and `vite.config.ts` `resolve.alias` both map

```
@claudemon/engine     -> packages/engine/src/index.ts
@claudemon/engine/*   -> packages/engine/src/*
```

so the app, the unit tests, `vite dev`, `vite build` and the e2e dev server all
load the engine's **TypeScript source**. The consequences are the point:

- `npm run dev` is still plain `vite`. Editing a rule or a data table reloads
  the page in well under a second, exactly as it did when the file lived in
  `src/`. No watcher, no `tsc` in the loop.
- `npm test` has no `pretest` hook and `vitest --watch` cannot test a stale
  build, because there is no build to be stale.
- Coverage still attributes lines to the real files —
  `vite.config.ts`'s `coverage.include` lists `packages/engine/src/**`.
- There is exactly one module instance of `POKEMON_DATA` in a process.
- `npm ci` runs no install script, so `--omit=dev` and `--ignore-scripts`
  installs both work.

No app file, test, runner or `editor.html` import changed in the relocation.
Every old path still exists as a two-line re-export shim:

```ts
// src/data/maps.ts
// Transitional Phaser-side import path; the implementation lives in @claudemon/engine.
export * from '@claudemon/engine/data/maps';
```

The shims are migration debt on purpose: they are the visible list of what the
app still reaches for by its historical path, and they can be deleted a few at
a time as callers move to the package name.

## How the 3D client consumes it: `dist`

An external consumer installs the published tarball and gets `dist` — ESM plus
`.d.ts`, built by `npm run engine:build` (`tsc` then `scripts/esm.mjs`, which
appends the `.js` extensions Node's loader requires). `package.json` ships
`files: ["dist"]` and exposes:

| Subpath | Contents |
|---|---|
| `@claudemon/engine` | the whole public barrel, plus `ENGINE_VERSION` |
| `@claudemon/engine/content` | every data table |
| `@claudemon/engine/types` | the shared types |
| `@claudemon/engine/{data,entities,logic,systems,types,utils}/*` | one module, by name |

The four directory entries are **subpath patterns**, not a hand-maintained file
list: adding a rule module needs no second edit, and no entry can rot.

`npm run engine:check` is the gate on that path, and it runs in CI:

1. `engine:build`,
2. `packages/engine/scripts/check.mjs` — every import in the package is
    relative and stays inside `src/`, so no `phaser`, no `node:*`, no dependency
    can sneak in,
3. `scripts/check-engine-package.mjs` — `npm pack`, install the tarball into a
    throwaway project inside the repo, and import it from a bare Node process
    with no bundler and no alias.

`packages/engine/tests/packaging.test.ts` runs the same check from the unit
suite, so `dist` cannot rot between CI runs either. `packages/*/dist/` is
gitignored; nothing in the app ever reads it.

## What comes next

This is R1 of the four-step re-land of PR #114 (see that PR's review for the
reasoning). R1 is a pure relocation and changes no behaviour at all.

- **R2** — injectable RNG: an optional trailing `rng: () => number = Math.random`
  on `createPokemon`, the damage/accuracy/crit rolls, the AI, the catch and
  encounter rolls, so a session can be replayed from a seed. Plus
  `trainerPrizeMoney` and the shared Oak/parcel helpers.
- **R3** — `battle/move.ts`: the move pipeline, lifted out of `BattleScene`
  with its text byte-identical and the resolve-before-animate invariant intact,
  pinned by a parity suite against the current scene code.
- **R4** — `session/` and `persistence/codec.ts`: the command/effect API the 3D
  client drives, built on the same rule functions the Phaser scene calls rather
  than a second implementation of them.

Until R3 and R4 land, the engine is data and rules; the orchestration still
lives in the scenes.
