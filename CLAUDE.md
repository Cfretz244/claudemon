# Pokemon Yellow Clone - Project Guide

## Quick Reference

```bash
npm run dev      # Start dev server (Vite HMR)
npm run build    # Type-check + production build
npx tsc --noEmit # Type-check only (fast)
npm run preview  # Preview production build
```

No test framework is configured. Verify changes with `npx tsc --noEmit`.

## Tech Stack

- **Phaser 3** game framework (v3.90+)
- **TypeScript** with strict mode (ES2020 target)
- **Vite** bundler (v7.3+) with 3 entry points: game (`index.html`), sprite viewer (`sprites.html`), sound tester (`sounds.html`)
- No external asset files - all sprites/sounds generated programmatically at runtime

## Architecture

### Resolution & Grid

- 160x144 logical pixels (Game Boy dimensions), scaled 4x in the browser
- 16x16px tiles, grid-based movement
- Pokemon sprites are 32x32px

### Scene Flow

`BootScene` (asset generation) → `TitleScene` (menu + naming + Oak intro) → `OverworldScene` (exploration) ↔ `BattleScene` (combat)

Scenes communicate via `this.scene.start('SceneName', data)`. The `OverworldScene` uses `this.scene.restart()` for map transitions (same instance is reused - state must be reset in `init()`).

### Key Architectural Pattern: `isWarping` Flag

The `OverworldScene` has an `isWarping` flag that blocks all player input during scene transitions (warps, battle transitions). This prevents double-warps and softlocks. **Always set `isWarping = true` before any scene transition and reset it in `init()`.**

## Source Layout

```
src/
  main.ts                           # Phaser config, scene registration, music toggle
  spriteViewer.ts                   # Sprite debugging/preview tool
  soundTest.ts                      # Sound/music testing tool
  scenes/
    BootScene.ts                    # Programmatic sprite/texture generation
    TitleScene.ts                   # Title screen, NEW GAME/CONTINUE, naming, Oak intro
    OverworldScene.ts               # Map rendering, movement, NPCs, warps, menu, story
    BattleScene.ts                  # Turn-based battles, Elite Four chain, whiteout
  systems/
    AISystem.ts                     # Trainer AI: contextual move selection with status scoring
    BattleEngine.ts                 # (Minimal - most logic is in BattleScene)
    CatchSystem.ts                  # Gen 1 catch formula
    DamageCalculator.ts             # Gen 1 damage formula with stat stages
    EncounterSystem.ts              # Wild encounter logic
    EvolutionSystem.ts              # Level/item evolution
    ExperienceSystem.ts             # EXP gain, level-up, move learning
    MoveAnimations.ts               # Per-move battle animation dispatcher
    SaveSystem.ts                   # localStorage save/load, SaveData interface
    SoundSystem.ts                  # Web Audio API chiptune SFX (singleton: soundSystem)
    TypeChart.ts                    # Type effectiveness lookups
    animations/                     # Move animation implementations (13 batch files)
      batch01_normal_contact.ts     # Normal-type contact moves
      batch02_multihit.ts           # Multi-hit moves
      batch03_fire.ts               # Fire-type moves
      batch04_water.ts              # Water-type moves
      batch05_electric.ts           # Electric-type moves
      batch06_ice.ts                # Ice-type moves
      batch07_grass.ts              # Grass-type moves
      batch08_psychic.ts            # Psychic-type moves
      batch09_ground_fighting.ts    # Ground/Fighting-type moves
      batch10_poison_misc.ts        # Poison & misc moves
      batch11_self_buff.ts          # Self-buff moves
      batch12_debuff_status.ts      # Debuff/status moves
      batch13_remaining.ts          # Remaining moves
      index.ts                      # Re-exports all batches
  entities/
    Player.ts                       # PlayerState class (party, bag, badges, storyFlags)
    Pokemon.ts                      # createPokemon() factory, stat calculation
    NPC.ts                          # NPC type definitions
  components/
    TextBox.ts                      # Typewriter text display
    BattleHUD.ts                    # HP bars, battle info
    BattleMenu.ts                   # FIGHT/BAG/POKeMON/RUN + move selection
    HealthBar.ts                    # Animated HP bar
    BagScreen.ts                    # Inventory UI (overworld item use, toss)
    MoveForgetUI.ts                 # Move forget selection overlay (BattleScene + BagScreen)
    PartyScreen.ts                  # Party management, field move invocation
    PCScreen.ts                     # PC Pokemon storage system
    PokedexScreen.ts                # Pokedex display
    ShopScreen.ts                   # Poke Mart shop UI
    TrainerCard.ts                  # Trainer card display (badges, play time, Pokedex)
  data/
    pokemon.ts                      # All 151 species (POKEMON_DATA)
    moves.ts                        # 165 Gen 1 moves (MOVES_DATA)
    typeChart.ts                    # 15x15 type effectiveness matrix
    items.ts                        # Item definitions (potions, balls, key items, HMs, TMs)
    trainers.ts                     # ~60 trainer definitions (TRAINERS)
    gymLeaders.ts                   # 8 gym leaders (GYM_LEADERS)
    eliteFour.ts                    # Elite Four + Champion + Hall of Fame text
    wildEncounters.ts               # Encounter tables for routes/caves
    musicTracks.ts                  # Chiptune music track definitions
    maps.ts                         # Core maps (Pallet→Pewter) + ALL_MAPS registry
    maps_cerulean.ts                # Mt Moon, Cerulean area (CERULEAN_MAPS)
    maps_vermilion.ts               # Vermilion, SS Anne (VERMILION_MAPS)
    maps_central.ts                 # Lavender, Celadon, Saffron (CENTRAL_MAPS)
    maps_south.ts                   # Fuchsia, Safari Zone, Cycling Road (SOUTH_MAPS)
    maps_endgame.ts                 # Cinnabar, Victory Road, Indigo Plateau (ENDGAME_MAPS)
  types/
    pokemon.types.ts                # PokemonSpecies, PokemonInstance, Move interfaces
    battle.types.ts                 # BattleType enum
    map.types.ts                    # TileType enum, MapData, WarpPoint, NPCData interfaces
  utils/
    constants.ts                    # TILE_SIZE, GAME_WIDTH/HEIGHT, Direction enum
    spriteGenerator.ts              # Canvas-based Pokemon sprite generation
    battleTransition.ts             # Battle transition visual effects (spiral, etc.)
    trainerSpriteGenerator.ts       # Trainer class/individual sprite generation
    trainerSprites_classes1.ts      # Trainer class sprite data (batch 1)
    trainerSprites_classes2.ts      # Trainer class sprite data (batch 2)
    trainerSprites_individuals.ts   # Named trainer sprite data (gym leaders, rival, etc.)
  sprites/
    index.ts                        # Sprite registry, exports all batches
    types.ts                        # Sprite data type definitions
    batch01_starters.ts             # Sprite data batches (01-10), organized by Pokedex order
    ...batch10_legends.ts
    pokemon/                        # 151 individual hand-drawn Pokemon sprite files
```

## Map System

### How Maps Work

Maps are defined as IIFEs in TypeScript that build tile and collision arrays programmatically:

```typescript
export const MY_MAP: MapData = (() => {
  const W = 20, H = 20;
  const tiles = fill2D(W, H, T.GRASS);      // 2D tile array
  const collision = fill2D(W, H, false);      // 2D collision array
  // setTile(x, y, type) sets both tile + collision
  // fillRect(x, y, w, h, type) fills a rectangle
  return { id: 'my_map', name: 'MY MAP', width: W, height: H, tiles, collision, warps: [...], npcs: [...] };
})();
```

### Map Registry

All maps must be added to `ALL_MAPS` in `maps.ts`. Regional maps are imported and spread:
```typescript
export const ALL_MAPS: Record<string, MapData> = {
  pallet_town: PALLET_TOWN, ...,
  ...CERULEAN_MAPS, ...VERMILION_MAPS, ...CENTRAL_MAPS, ...SOUTH_MAPS, ...ENDGAME_MAPS,
};
```

### Warp System - Important Gotchas

- **Warps on solid tiles work.** When a player walks into a solid tile (tree, fence) that has a warp, the warp triggers. This is how bordered map exits work - no need to carve gaps in tree borders for exit warps.
- **Door warps** use the `DOOR` tile type (not solid), so the player walks onto them normally.
- **Edge warps** trigger when the player tries to walk out of bounds while standing on a warp tile.
- Warp targets should be on **walkable tiles**. Never warp a player onto a solid tile (fence, tree, wall) - they'll be stuck.
- Indoor maps (Pokemon Centers, gyms) exit back to the outdoor map. Exit warps go to the door position on the outdoor map.

### Tile Types

Solid (block movement): `WALL, WATER, TREE, BUILDING, FENCE, COUNTER, MART_SHELF, CAVE_WALL, PC`

Walkable: `GRASS, PATH, TALL_GRASS, DOOR, SIGN, LEDGE, FLOWER, INDOOR_FLOOR, CARPET, SAND, CAVE_FLOOR`

Special: `CUT_TREE` (removed by Cut), `BOULDER` (moved by Strength)

Wild encounters trigger on: `TALL_GRASS, CAVE_FLOOR`

## Battle System

### Trainer Lookup Chain

`BattleScene.generateTrainerTeam()` looks up trainer data in this order:
1. `ELITE_FOUR` (by id)
2. `CHAMPION` (by id)
3. `GYM_LEADERS` (by id)
4. `TRAINERS` (by id)
5. Fallback: single Rattata

The trainer's NPC `id` in the map must match the key in the corresponding data file.

### Trainer AI

`AISystem.ts` scores each available move and picks the highest:
- **Damaging moves**: scored by calculated damage output, with bonuses for super-effective, KO potential, and secondary effects
- **Status moves**: scored contextually (sleep/paralyze valued if target has no status, stat drops scored low, recovery moves valued at low HP, self-buffs valued at high HP)
- All scores get an accuracy penalty and a small random factor (±15%)

### Gym Badge Flow

When a gym leader (found in `GYM_LEADERS` by trainer id) is defeated, their `badge` string is pushed to `playerState.badges`. The badge name comes from the `GYM_LEADERS` data.

### Elite Four Chain

Triggered by warping to the special map id `'elite_four'`. Builds a queue of battles (E4 members + Champion). After beating the Champion, `hallOfFame` triggers credits and returns the player to Pallet Town.

### Move Learning

When a Pokemon levels up and tries to learn a new move:
- If the Pokemon has **fewer than 4 moves**, the move is learned automatically
- If the Pokemon already has **4 moves**, a `MoveForgetUI` overlay appears letting the player choose which move to forget (or cancel)

`MoveForgetUI` is a reusable component (`src/components/MoveForgetUI.ts`) used by both:
- **BattleScene**: via `promptMoveForget()` — async/Promise-based, integrates with `showText()` for dialogue
- **BagScreen**: via `processNextPendingMove()` — callback-based with a `pendingMoves` queue for rare candy level-ups that teach multiple moves

The UI shows 6 rows (4 existing moves + new move highlighted in red + CANCEL). It manages its own keyboard input while active. Callers set their mode to block their own input while MoveForgetUI is shown.

### Whiteout

When all party Pokemon faint, the player is sent to `playerState.lastHealMap` at `lastHealX/lastHealY`. This is updated whenever the player heals at a nurse (any NPC with `id.startsWith('nurse')`).

## Story Progression System

The game follows Pokemon Yellow's story structure using `playerState.storyFlags` (a `Set<string>`) and conditional NPC logic:

- **`shouldSkipNPC()`**: Controls NPC visibility based on story flags (e.g., Snorlax disappears after caught, Giovanni disappears after defeated)
- **`interactWithNPC()`**: Special handlers for story NPCs (Oak, Bill, SS Anne Captain, Mr. Fuji, Giovanni, badge check gates, etc.)
- **`checkTrainerSight()`**: Respects `shouldSkipNPC()` so invisible NPCs don't trigger battles
- **Warp gates**: SS Anne requires `ss_ticket`, Viridian Gym requires `giovanni_silph` flag, etc.

### HM Field Moves

Cut, Surf, Strength, Flash, and Fly are invoked through the PartyScreen's move selection (not main menu entries):
- **Cut**: Removes `CUT_TREE` tiles, persisted via `cut_<mapId>_<x>_<y>` storyFlags
- **Surf**: Switches to surf sprite, allows water tile movement
- **Strength**: Pushes `BOULDER` tiles
- **Flash**: Removes dark overlay in caves with `isDark=true`
- **Fly**: Opens town selection UI; destinations tracked via `visited_<mapId>` flags set when healing

## Controls

- **Arrow keys**: Movement / menu navigation
- **Z / Enter**: Confirm / interact / advance dialogue
- **X**: Cancel / close menu / backspace (naming)
- **Enter**: Open/close start menu (overworld)
- **M**: Toggle music and sound on/off

## Common Tasks

### Adding a New Map

1. Create the map definition in the appropriate regional file (or `maps.ts`)
2. Export it and add to the regional `*_MAPS` record
3. If in a new file, import and spread into `ALL_MAPS` in `maps.ts`
4. Add warps from adjacent maps pointing to the new map
5. Add NPCs with unique `id` values

### Adding a New Trainer

1. Add entry to `TRAINERS` in `trainers.ts` with unique `id`
2. Add NPC to the map with `id` matching the trainer key, `isTrainer: true`
3. Their `dialogue` array is shown before battle; first entry's text before `:` is used as display name

### Adding a New Pokemon Move

Add to `MOVES_DATA` in `moves.ts`. Physical types (Normal, Fighting, Flying, Poison, Ground, Rock, Bug, Ghost) use `MoveCategory.PHYSICAL`; special types (Fire, Water, Electric, Grass, Ice, Psychic, Dragon) use `MoveCategory.SPECIAL`.

## Known Patterns

- `soundSystem` is a singleton imported from `SoundSystem.ts` - call methods directly
- `POKEMON_DATA[speciesId].name` gives the species name for any Pokemon
- `createPokemon(speciesId, level)` creates a full `PokemonInstance` with calculated stats and moves
- `PlayerState.toSave()` / `PlayerState.fromSave()` serialize state for scene transitions and localStorage
- Scene transitions pass `saveData: this.playerState.toSave()` to preserve state across map changes
- UI components that handle their own input (MoveForgetUI, BagScreen, etc.) use an `active`/`visible` flag to gate input handlers, and an `inputBound` flag to prevent stacking listeners
- Overlay UIs (MoveForgetUI, BagScreen) set a high depth (950-1000) and use `setScrollFactor(0)` to stay fixed on screen
- `BattleScene` uses async/await with Promise-wrapped callbacks for sequential dialogue + UI flows
- `BagScreen` is callback/mode-based (not async) — new UI states are added as mode strings and handled in `navigate()`/`confirm()`/`back()`
- Rival NPCs use `{RIVAL}` placeholder in dialogue, resolved dynamically via `rivalName`
- Trainer battle intros include slide-out animations and trainer sprites generated from `trainerSpriteGenerator.ts`
