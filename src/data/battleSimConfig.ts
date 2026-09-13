// Battle-simulator data: the party/opponent configuration model, its validation
// rules and the translation from a config into the exact payload BattleScene's
// init() already expects. DOM-free so tests can exercise every rule against the
// real species, move and trainer data (tests/data/battleSimConfig.test.ts).
// The simulator UI lives in battle.html + src/battleSim.ts.
//
// Design note: the simulator does NOT fork the battle flow. It builds a
// BattleSceneData payload and hands it to the stock BattleScene, so anything
// that works in the game works here and nothing here can drift from the game.
import { PokemonInstance, PokemonType } from '../types/pokemon.types';
import { POKEMON_DATA } from './pokemon';
import { MOVES_DATA } from './moves';
import { createPokemon } from '../entities/Pokemon';
import { SaveSystem, SaveData } from '../systems/SaveSystem';
import { MAX_MOVES } from '../utils/constants';

export const MAX_PARTY_SIZE = 6;
export const MIN_LEVEL = 1;
export const MAX_LEVEL = 100;
export const MOVES_PER_POKEMON = MAX_MOVES;

/** Wild = a single opponent that can be caught/fled; trainer = up to 6 with switching. */
export type OpponentKind = 'wild' | 'trainer';

export interface SimSlot {
  speciesId: number;
  level: number;
  /** 1..4 move ids, each legal for this species at this level. */
  moveIds: number[];
}

export interface SimConfig {
  playerName: string;
  opponentKind: OpponentKind;
  /** Only meaningful when opponentKind === 'trainer'. */
  trainerClass: string;
  trainerName: string;
  playerParty: SimSlot[];
  opponentParty: SimSlot[];
}

export interface SpeciesChoice {
  id: number;
  name: string;
  types: PokemonType[];
}

export interface MoveChoice {
  id: number;
  name: string;
  type: PokemonType;
  power: number;
  pp: number;
  /** Learnset level; 0 for moves known from level 1. */
  learnedAt: number;
}

/** Every species the game knows, ascending by Pokedex number. */
export const SPECIES_CHOICES: SpeciesChoice[] = Object.values(POKEMON_DATA)
  .map(s => ({ id: s.id, name: s.name, types: s.types }))
  .sort((a, b) => a.id - b.id);

/**
 * Trainer classes the simulator offers. Each one has its own battle sprite
 * (see utils/trainerSpriteGenerator.getTrainerSpriteKey); the test asserts that.
 */
export const TRAINER_CLASS_CHOICES: string[] = [
  'Bug Catcher', 'Youngster', 'Camper', 'Super Nerd', 'Lass', 'Swimmer',
  'Jr. Trainer', 'Hiker', 'Sailor', 'Pokemaniac', 'Channeler', 'Gambler',
  'Beauty', 'Psychic', 'Fisher', 'Bird Keeper', 'Biker', 'Cue Ball',
  'Juggler', 'Tamer', 'Cooltrainer', 'Black Belt', 'Scientist', 'Burglar',
  'Team Rocket', 'Boss', 'Rival', 'Gentleman', 'Rocker',
];

/**
 * THE ENGINE HAS EXACTLY ONE AI BEHAVIOUR.
 * systems/AISystem.ts exports a single `selectAIMove(aiPokemon, playerPokemon)`
 * with no difficulty parameter: it scores every move with PP left by expected
 * damage x type effectiveness (plus status heuristics) and applies a +-15%
 * random jitter. BattleScene calls it from all eight of its AI decision points.
 * The simulator surfaces that fact rather than inventing difficulty tiers that
 * the engine could not honour.
 */
export const AI_BEHAVIOURS: { id: string; label: string; description: string }[] = [
  {
    id: 'default',
    label: 'Standard (only AI in this build)',
    description:
      'Scores each usable move by expected damage x type effectiveness, with a '
      + '±15% random jitter. There is no difficulty setting in the engine.',
  },
];

export function speciesName(speciesId: number): string {
  return POKEMON_DATA[speciesId]?.name ?? `#${speciesId}`;
}

export function moveName(moveId: number): string {
  return MOVES_DATA[moveId]?.name ?? `move ${moveId}`;
}

/**
 * Every move this species can legally know at this level, in learnset order.
 * Deduplicated: several species list the same move at two levels.
 */
export function learnableMoves(speciesId: number, level: number): MoveChoice[] {
  const species = POKEMON_DATA[speciesId];
  if (!species) return [];
  const seen = new Set<number>();
  const out: MoveChoice[] = [];
  for (const entry of species.learnset) {
    if (entry.level > level) continue;
    if (seen.has(entry.moveId)) continue;
    const data = MOVES_DATA[entry.moveId];
    if (!data) continue;
    seen.add(entry.moveId);
    out.push({
      id: data.id,
      name: data.name,
      type: data.type,
      power: data.power,
      pp: data.pp,
      learnedAt: entry.level <= 1 ? 0 : entry.level,
    });
  }
  return out;
}

/**
 * The level-appropriate default: the last four moves the species would have
 * learned by this level. Matches entities/Pokemon.createPokemon exactly, so an
 * untouched slot is identical to a wild encounter of the same species/level.
 */
export function defaultMoves(speciesId: number, level: number): number[] {
  const learnable = learnableMoves(speciesId, level).map(m => m.id);
  if (learnable.length === 0) return [33]; // Tackle, same fallback as createPokemon
  return learnable.slice(-MOVES_PER_POKEMON);
}

export function makeSlot(speciesId: number, level: number): SimSlot {
  return { speciesId, level, moveIds: defaultMoves(speciesId, level) };
}

export function clampLevel(level: number): number {
  if (!Number.isFinite(level)) return MIN_LEVEL;
  return Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, Math.floor(level)));
}

/** Human-readable problems with one slot. Empty array means the slot is usable. */
export function validateSlot(slot: SimSlot, where: string): string[] {
  const errors: string[] = [];
  const species = POKEMON_DATA[slot.speciesId];
  if (!species) {
    errors.push(`${where}: unknown species ${slot.speciesId}`);
    return errors;
  }
  if (!Number.isInteger(slot.level) || slot.level < MIN_LEVEL || slot.level > MAX_LEVEL) {
    errors.push(`${where}: level ${slot.level} is outside ${MIN_LEVEL}-${MAX_LEVEL}`);
  }
  if (slot.moveIds.length === 0) {
    errors.push(`${where}: needs at least one move`);
  }
  if (slot.moveIds.length > MOVES_PER_POKEMON) {
    errors.push(`${where}: ${slot.moveIds.length} moves, the limit is ${MOVES_PER_POKEMON}`);
  }
  if (new Set(slot.moveIds).size !== slot.moveIds.length) {
    errors.push(`${where}: duplicate moves`);
  }
  const legal = new Set(learnableMoves(slot.speciesId, clampLevel(slot.level)).map(m => m.id));
  for (const id of slot.moveIds) {
    if (!MOVES_DATA[id]) {
      errors.push(`${where}: unknown move ${id}`);
    } else if (!legal.has(id)) {
      errors.push(
        `${where}: ${species.name} cannot learn ${moveName(id)} by level ${slot.level}`,
      );
    }
  }
  return errors;
}

/** Human-readable problems with a whole config. Empty array means "start the battle". */
export function validateConfig(config: SimConfig): string[] {
  const errors: string[] = [];
  if (!config.playerName.trim()) errors.push('Player name is required');
  if (config.playerName.length > 10) errors.push('Player name is at most 10 characters');

  if (config.playerParty.length === 0) errors.push('Your side needs at least one Pokemon');
  if (config.playerParty.length > MAX_PARTY_SIZE) {
    errors.push(`Your side has ${config.playerParty.length} Pokemon, the limit is ${MAX_PARTY_SIZE}`);
  }
  if (config.opponentParty.length === 0) errors.push('The opponent needs at least one Pokemon');
  if (config.opponentParty.length > MAX_PARTY_SIZE) {
    errors.push(`The opponent has ${config.opponentParty.length} Pokemon, the limit is ${MAX_PARTY_SIZE}`);
  }
  if (config.opponentKind === 'wild' && config.opponentParty.length > 1) {
    errors.push('A wild battle has exactly one opponent - switch to a trainer battle for a team');
  }
  if (config.opponentKind === 'trainer' && !config.trainerName.trim()) {
    errors.push('Trainer battles need a trainer name');
  }
  if (config.opponentKind === 'trainer' && !TRAINER_CLASS_CHOICES.includes(config.trainerClass)) {
    errors.push(`Unknown trainer class "${config.trainerClass}"`);
  }

  config.playerParty.forEach((slot, i) => {
    errors.push(...validateSlot(slot, `Your slot ${i + 1}`));
  });
  config.opponentParty.forEach((slot, i) => {
    errors.push(...validateSlot(slot, `Opponent slot ${i + 1}`));
  });
  return errors;
}

/** A ready-to-battle instance with exactly the configured moves at full PP. */
export function buildPokemon(slot: SimSlot, ot: string): PokemonInstance {
  const level = clampLevel(slot.level);
  const mon = createPokemon(slot.speciesId, level, ot);
  const moveIds = slot.moveIds.length > 0 ? slot.moveIds : defaultMoves(slot.speciesId, level);
  mon.moves = moveIds.slice(0, MOVES_PER_POKEMON).map(id => {
    const pp = MOVES_DATA[id]?.pp ?? 20;
    return { moveId: id, currentPp: pp, maxPp: pp };
  });
  mon.currentHp = mon.stats.hp;
  return mon;
}

export function buildParty(slots: SimSlot[], ot: string): PokemonInstance[] {
  return slots.map(slot => buildPokemon(slot, ot));
}

/**
 * A save the battle can run against: a normal new save with the configured
 * party, enough bag items to exercise the item menu, and the story flags the
 * battle UI checks. `currentMap` is irrelevant because the simulator supplies
 * its own return scene, but it must be a real map id.
 */
export function buildSaveData(config: SimConfig): SaveData {
  const save = SaveSystem.createNewSave(config.playerName.trim().toUpperCase(), 'RIVAL');
  save.party = buildParty(config.playerParty, config.playerName.trim().toUpperCase());
  save.bag = { potion: 5, super_potion: 3, full_heal: 3, poke_ball: 10, great_ball: 5, ultra_ball: 5, revive: 2 };
  save.money = 9999;
  save.storyFlags = { ...save.storyFlags, intro_complete: true, has_pokedex: true, has_pikachu: true };
  return save;
}

/**
 * The payload BattleScene.init() already understands. Deliberately the same
 * shape the overworld builds, so the simulator adds no new battle entry point.
 * `trainerId` is left empty on purpose: a non-empty id would make BattleScene
 * generate its own team and record a defeated-trainer flag.
 */
export interface SimBattlePayload {
  type: string;
  wildPokemon?: PokemonInstance;
  trainerId?: string;
  trainerName?: string;
  trainerClass?: string;
  trainerTeam?: PokemonInstance[];
  playerState: SaveData;
  returnMap: string;
  returnX: number;
  returnY: number;
}

export function buildBattlePayload(config: SimConfig): SimBattlePayload {
  const playerState = buildSaveData(config);
  const base = {
    playerState,
    returnMap: playerState.currentMap,
    returnX: playerState.playerX,
    returnY: playerState.playerY,
  };
  if (config.opponentKind === 'wild') {
    return { ...base, type: 'wild', wildPokemon: buildPokemon(config.opponentParty[0], 'WILD') };
  }
  return {
    ...base,
    type: 'trainer',
    trainerId: '',
    trainerName: config.trainerName.trim().toUpperCase(),
    trainerClass: config.trainerClass,
    trainerTeam: buildParty(config.opponentParty, config.trainerName.trim().toUpperCase()),
  };
}

/** Pikachu Lv10 vs a wild Rattata Lv8 - the smallest interesting battle. */
export function defaultConfig(): SimConfig {
  return {
    playerName: 'SIM',
    opponentKind: 'wild',
    trainerClass: 'Youngster',
    trainerName: 'JOEY',
    playerParty: [makeSlot(25, 10)],
    opponentParty: [makeSlot(19, 8)],
  };
}

const CONFIG_KEY = 'claudemon_battle_sim_config';

/** Round-trips a config through localStorage; returns null if there is nothing usable stored. */
export function parseStoredConfig(raw: string | null): SimConfig | null {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null) return null;
  const c = parsed as Partial<SimConfig>;
  if (!Array.isArray(c.playerParty) || !Array.isArray(c.opponentParty)) return null;
  const config: SimConfig = {
    playerName: typeof c.playerName === 'string' ? c.playerName : 'SIM',
    opponentKind: c.opponentKind === 'trainer' ? 'trainer' : 'wild',
    trainerClass: typeof c.trainerClass === 'string' ? c.trainerClass : 'Youngster',
    trainerName: typeof c.trainerName === 'string' ? c.trainerName : 'JOEY',
    playerParty: c.playerParty.map(normalizeSlot).filter((s): s is SimSlot => s !== null),
    opponentParty: c.opponentParty.map(normalizeSlot).filter((s): s is SimSlot => s !== null),
  };
  if (config.playerParty.length === 0 || config.opponentParty.length === 0) return null;
  return config;
}

function normalizeSlot(raw: unknown): SimSlot | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const s = raw as Partial<SimSlot>;
  if (typeof s.speciesId !== 'number' || !POKEMON_DATA[s.speciesId]) return null;
  const level = clampLevel(typeof s.level === 'number' ? s.level : MIN_LEVEL);
  const legal = new Set(learnableMoves(s.speciesId, level).map(m => m.id));
  const moveIds = Array.isArray(s.moveIds)
    ? s.moveIds.filter((id): id is number => typeof id === 'number' && legal.has(id)).slice(0, MOVES_PER_POKEMON)
    : [];
  return { speciesId: s.speciesId, level, moveIds: moveIds.length ? moveIds : defaultMoves(s.speciesId, level) };
}

export const SIM_CONFIG_STORAGE_KEY = CONFIG_KEY;
