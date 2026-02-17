# Pokemon Yellow Clone

A faithful recreation of Pokemon Yellow built entirely in the browser with **Phaser 3** and **TypeScript**. Every sprite, sound effect, and music track is generated programmatically at runtime — no external asset files.

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

## Building

```bash
npm run build    # Type-check + production build
npm run preview  # Preview the production build
```

## Tech Stack

- **Phaser 3** (v3.90+) — game framework
- **TypeScript** — strict mode, ES2020 target
- **Vite** (v7.3+) — bundler with HMR
- **Web Audio API** — all audio synthesized at runtime

## Dev Tools

- `http://localhost:5173/sprites.html` — sprite viewer for previewing all Pokemon sprites
- `http://localhost:5173/sounds.html` — sound/music tester

## Project Structure

```
src/
  scenes/       # BootScene, TitleScene, OverworldScene, BattleScene
  systems/      # AI, damage calc, catch/evolution/experience, save, sound
  components/   # TextBox, BattleHUD, PartyScreen, BagScreen, PC, Shop, etc.
  data/         # Pokemon, moves, trainers, gym leaders, maps, music
  entities/     # Player state, Pokemon factory, NPC definitions
  utils/        # Sprite generation, battle transitions, constants
  sprites/      # 151 individual Pokemon sprite definitions
```

See [CLAUDE.md](CLAUDE.md) for detailed architecture documentation.
