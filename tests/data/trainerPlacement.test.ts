import { describe, it, expect } from 'vitest';
import { ALL_MAPS } from '../../src/data/maps';
import { TRAINERS } from '../../src/data/trainers';
import { GYM_LEADERS } from '../../src/data/gymLeaders';
import { ELITE_FOUR, CHAMPION } from '../../src/data/eliteFour';

/**
 * BattleScene.generateTrainerTeam() resolves a trainer NPC's team by id via
 * ELITE_FOUR → CHAMPION → GYM_LEADERS → TRAINERS, and silently falls back to a
 * single Lv8 Rattata when nothing matches. That fallback hides typos and
 * missing definitions, so this file makes the mapping explicit.
 */

const trainerNpcs = new Map<string, string[]>();
for (const [mapId, map] of Object.entries(ALL_MAPS)) {
  for (const npc of map.npcs) {
    if (npc.isTrainer) trainerNpcs.set(npc.id, [...(trainerNpcs.get(npc.id) ?? []), mapId]);
  }
}
const resolves = (id: string): boolean =>
  ELITE_FOUR.some(e => e.id === id) || id === CHAMPION.id || id in GYM_LEADERS || id in TRAINERS;

// Trainer NPCs that are allowed to have no definition. Empty: every trainer on
// every map must resolve, or it silently battles with the Lv8 Rattata fallback.
const KNOWN_UNRESOLVED_TRAINER_NPCS: string[] = [];

// Trainer definitions that are legitimately not placed as map NPCs.
const SCRIPTED_TRAINERS = [
  'rival_lab',        // started by OverworldScene.startRivalBattle
  'rival_route22_2',  // pre-Victory-Road rival rematch: defined, not yet wired to the story
];
// Dead definitions: no NPC anywhere uses them. Listed so new dead data is loud.
const KNOWN_DEAD_TRAINERS: string[] = [];

describe('trainer NPC ↔ definition mapping', () => {
  it('every trainer NPC on a map resolves to a team definition (except the known-unresolved list)', () => {
    const unresolved = [...trainerNpcs.keys()].filter(id => !resolves(id)).sort();
    expect(unresolved).toEqual([...KNOWN_UNRESOLVED_TRAINER_NPCS].sort());
  });

  it('known-unresolved list does not go stale', () => {
    for (const id of KNOWN_UNRESOLVED_TRAINER_NPCS) {
      expect(trainerNpcs.has(id), `${id} is no longer a map NPC`).toBe(true);
      expect(resolves(id), `${id} now resolves — remove it from KNOWN_UNRESOLVED`).toBe(false);
    }
  });

  it('every TRAINERS definition is placed on a map, scripted, or known-dead', () => {
    const allowed = new Set([...SCRIPTED_TRAINERS, ...KNOWN_DEAD_TRAINERS]);
    const unplaced = Object.keys(TRAINERS).filter(id => !trainerNpcs.has(id) && !allowed.has(id));
    expect(unplaced).toEqual([]);
    for (const id of KNOWN_DEAD_TRAINERS) {
      expect(trainerNpcs.has(id), `${id} is placed now — remove it from KNOWN_DEAD`).toBe(false);
    }
  });

  it('every gym leader and Elite Four member is placed as a trainer NPC', () => {
    for (const id of Object.keys(GYM_LEADERS)) {
      expect(trainerNpcs.has(id), `gym leader ${id} has no trainer NPC`).toBe(true);
    }
    for (const e4 of ELITE_FOUR) {
      expect(trainerNpcs.has(e4.id), `Elite Four ${e4.id} has no trainer NPC`).toBe(true);
    }
  });

  it('no trainer id is defined in more than one table', () => {
    const tables: Record<string, string[]> = {
      TRAINERS: Object.keys(TRAINERS),
      GYM_LEADERS: Object.keys(GYM_LEADERS),
      ELITE_FOUR: ELITE_FOUR.map(e => e.id),
      CHAMPION: [CHAMPION.id],
    };
    const seen = new Map<string, string>();
    for (const [table, ids] of Object.entries(tables)) {
      for (const id of ids) {
        expect(seen.has(id), `${id} defined in both ${seen.get(id)} and ${table}`).toBe(false);
        seen.set(id, table);
      }
    }
  });
});
