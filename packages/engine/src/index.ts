// The public surface of the headless engine: content data, shared types, the
// entity helpers, the pure rule modules and the battle systems. Everything
// here is renderer-agnostic — no Phaser, no DOM, no storage.
//
// The Phaser app does NOT import this barrel; it keeps its historical relative
// paths through the two-line re-export shims in `src/**`, which the build
// aliases straight at this package's TypeScript sources. This barrel is what
// an external consumer (the 3D client) installs.

export const ENGINE_VERSION = '0.1.0';

export * from './content';
export * from './types';

export * from './entities/Pokemon';
export * from './entities/Player';

export * from './logic/animationOutcome';
export * from './logic/boulders';
export * from './logic/chargeMoves';
export * from './logic/cutTrees';
export * from './logic/elevator';
export * from './logic/encounters';
export * from './logic/fieldMoves';
export * from './logic/forcedEncounters';
export * from './logic/gameCornerPoster';
export * from './logic/hallOfFame';
export * from './logic/healing';
export * from './logic/itemBalls';
export * from './logic/learnset';
export * from './logic/newGame';
export * from './logic/npcVisibility';
export * from './logic/oakLab';
export * from './logic/oaksParcel';
export * from './logic/pokemonShape';
export * from './logic/rareCandy';
export * from './logic/reviveItems';
export * from './logic/roadBlocks';
export * from './logic/saveMigration';
export * from './logic/slotMachine';
export * from './logic/spinTiles';
export * from './logic/storyFlagSync';
export * from './logic/surgePuzzle';
export * from './logic/trainerSight';
export * from './logic/turnFlow';
export * from './logic/vitamins';
export * from './logic/warpGate';

export * from './systems/AISystem';
export * from './systems/CatchSystem';
export * from './systems/EncounterSystem';
export * from './systems/EvolutionSystem';
export * from './systems/ExperienceSystem';
// `BattleEngine` is listed name by name because its `VolatileStatus` interface
// collides with the `VolatileStatus` enum in `types/pokemon.types`; a second
// `export *` would make that name ambiguous and drop it from the barrel.
export {
  canFight,
  getFirstAlivePokemon,
  isPartyDefeated,
  resolveTurnOrder,
  confusionSelfDamage,
  resolvePreAction,
  evadesSemiInvulnerable,
  rollHitCount,
  applySpecialDamage,
  applyMoveEffect,
  applyEndTurnStatus,
  applyLeechSeed,
  calculateRunChance,
  splitExp,
} from './systems/BattleEngine';
export type {
  StatStages,
  VolatileStatus as BattleVolatileStatus,
  DisableState,
  PreActionOutcome,
  SpecialDamageResult,
  EffectContext,
} from './systems/BattleEngine';

// `DamageCalculator.StatStages` is structurally identical to `BattleEngine`'s;
// re-exporting it twice would make the name ambiguous, so the battle one above
// is the barrel's.
export { calculateDamage, checkCritical, checkAccuracy } from './systems/DamageCalculator';

// Map construction helpers. `MapShape` is renamed because `logic/fieldMoves`
// already exports a different type under that name.
export { fill2D, SOLID_TILES, createMapShape, createMapFromSketch } from './data/mapBuilder';
export type { MapShape as MapBuilderShape, SketchShape } from './data/mapBuilder';
