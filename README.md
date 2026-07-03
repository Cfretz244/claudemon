# Claudemon

A faithful recreation of Pokemon Yellow built entirely in the browser with **Phaser 3** and **TypeScript**. Every sprite, sound effect, and music track is generated programmatically at runtime — no external asset files. The entire game was built by Claude.

## Features

- All 151 original Pokemon with hand-crafted pixel sprites
- Gen 1-accurate damage formula, type chart, catch mechanics, and stat calculations
- Full Kanto overworld: Pallet Town through Indigo Plateau, including caves, dungeons, and indoor maps
- 8 gym leaders, Elite Four, and Champion
- Pokemon Yellow story progression (Oak's intro, rival encounters, Team Rocket events, HM gates)
- Turn-based battle system with 165 moves, per-move animations, and trainer AI
- Wild encounters, trainer battles, and gym battles
- HM field moves: Cut, Surf, Strength, Flash, Fly
- Party management, PC storage, Pokedex, bag/inventory, and Poke Mart shops
- Evolution (level-up and item-based) and move learning
- Save/load via localStorage
- Chiptune music and sound effects synthesized with Web Audio API
- Game Boy resolution (160x144) scaled 4x in the browser

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Controls

| Key | Action |
|-----|--------|
| Arrow keys | Move / navigate menus |
| Z / Enter | Confirm / interact / advance text |
| X | Cancel / close menu |
| Enter | Open/close start menu (overworld) |
| M | Toggle music and sound |

## Building & Testing

```bash
npm run build          # Type-check + production build
npm test               # Run tests (339 tests across 26 files)
npm run test:coverage  # Tests + V8 coverage report
npm run preview        # Preview the production build
```

All changes go through pull requests. The `main` branch requires passing CI (type-check + tests) before merging.

## Tech Stack

- **Phaser 3** (v3.90+) — game framework
- **TypeScript** — strict mode, ES2020 target
- **Vite** (v7.3+) — bundler with HMR
- **Vitest** — test framework with V8 coverage
- **Web Audio API** — all audio synthesized at runtime

## Dev Tools

- `http://localhost:5173/sprites.html` — sprite viewer for previewing all Pokemon sprites
- `http://localhost:5173/sounds.html` — sound/music tester
- `http://localhost:5173/pokedex.html` — Pokedex browser
- `http://localhost:5173/editor.html` — save editor for playtesting (edit party, badges, flags, items, location)
- `http://localhost:5173/maps.html` — top-down map viewer for debugging layouts

## Project Structure

```
src/
  scenes/       # BootScene, IntroScene, TitleScene, OverworldScene, BattleScene
  systems/      # Battle engine, AI, damage calc, catch/evolution/experience, save, sound
  components/   # TextBox, BattleHUD, PartyScreen, BagScreen, PC, Shop, etc.
  data/         # Pokemon, moves, trainers, gym leaders, maps, music
  entities/     # Player state, Pokemon factory, NPC definitions
  logic/        # Pure-logic modules (trainer sight, encounters, puzzles, story flags)
  utils/        # Sprite generation, battle transitions, constants
  sprites/      # 151 individual Pokemon sprite definitions
tests/          # Vitest test suite (systems, entities, data integrity, story logic)
```

See [CLAUDE.md](CLAUDE.md) for detailed architecture documentation.
