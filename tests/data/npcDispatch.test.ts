import { describe, it, expect } from 'vitest';
import { ALL_MAPS } from '../../src/data/maps';
import { GIFT_NPCS } from '../../src/data/giftNpcs';
import { NPCData } from '../../src/types/map.types';

/**
 * Pins the story-NPC dispatch contract in OverworldScene.interactWithNPC.
 *
 * Dispatch order there is: item ball, then ids prefixed `nurse`, then
 * `mart_clerk`-prefixed ids or any NPC with shopStock, then GIFT_NPCS, then the
 * handler registry (exact ids, then the slot_machine_ / elevator_ / badge_check
 * prefixes), then trainer battle, then plain dialogue.
 *
 * A story NPC that acquires `shopStock`, `isItemBall`, or a `nurse`/`mart_clerk`
 * id prefix would be silently swallowed by an earlier stage and its story
 * branch would never run. Likewise an id typo in code vs. map data silently
 * turns a story NPC into plain dialogue. These tests make both loud.
 */

// Mirror of the exact-id handler registry in OverworldScene.getNpcHandler().
const HANDLER_IDS = [
  'oak', 'rival',
  'snorlax_route12', 'snorlax_route16',
  'articuno_seafoam', 'zapdos_power_plant', 'moltres_victory_road',
  'game_corner_clerk', 'game_corner_coin_vendor', 'celadon_mansion_coin_case_giver',
  'giovanni_game_corner', 'giovanni_silph',
];
const HANDLER_PREFIXES = ['slot_machine_', 'elevator_', 'badge_check'];

// Ids that shouldSkipNPC() keys visibility on (src/logic/npcVisibility.ts).
const VISIBILITY_IDS = [
  'pewter_guide', 'snorlax_route12', 'snorlax_route16', 'mr_fuji',
  'tower_rocket1', 'tower_rocket2', 'silph_president',
  'rival_ss_anne', 'rival_tower', 'rival_silph', 'rival_cerulean',
  'cerulean_officer', 'cerulean_rocket',
  'giovanni_game_corner', 'giovanni_silph',
  'game_corner_poster_rocket',
  // NOTE: npcVisibility.ts also names game_corner_rocket1/2, which no map has
  // placed since the Game Corner rework — that branch is dead code.
  'rocket_hideout_b4f_grunt1',
  'mt_moon_helix_fossil', 'mt_moon_dome_fossil', 'mt_moon_fossil_nerd',
  'jessie_mtmoon', 'james_mtmoon', 'mt_moon_rocket_guard',
  'jessie_gamecorner', 'james_gamecorner',
  'jessie_tower', 'james_tower', 'jessie_silph', 'james_silph',
  'articuno_seafoam', 'zapdos_power_plant', 'moltres_victory_road',
  'league_guard_lorelei', 'league_guard_bruno', 'league_guard_agatha', 'league_guard_lance',
];

// Only these story NPCs are trainers: the handler returns false while they are
// undefeated so the interaction falls through to the trainer-battle branch.
const INTENTIONAL_TRAINER_STORY_NPCS = new Set(['giovanni_game_corner', 'giovanni_silph']);

const npcsById = new Map<string, { mapId: string; npc: NPCData }[]>();
for (const [mapId, map] of Object.entries(ALL_MAPS)) {
  for (const npc of map.npcs) {
    const list = npcsById.get(npc.id) ?? [];
    list.push({ mapId, npc });
    npcsById.set(npc.id, list);
  }
}
const allIds = [...npcsById.keys()];
const giftIds = Object.keys(GIFT_NPCS);

describe('story NPC dispatch contract', () => {
  it('every GIFT_NPCS id is placed on at least one map', () => {
    for (const id of giftIds) {
      expect(npcsById.has(id), `GIFT_NPCS['${id}'] has no NPC on any map`).toBe(true);
    }
  });

  it('every exact handler-registry id is placed on at least one map', () => {
    for (const id of HANDLER_IDS) {
      expect(npcsById.has(id), `handler '${id}' has no NPC on any map`).toBe(true);
    }
  });

  it('every handler prefix matches at least one map NPC', () => {
    for (const prefix of HANDLER_PREFIXES) {
      expect(
        allIds.some(id => id.startsWith(prefix)),
        `no NPC id starts with '${prefix}'`,
      ).toBe(true);
    }
  });

  it('every id shouldSkipNPC keys on is placed on at least one map', () => {
    for (const id of VISIBILITY_IDS) {
      expect(npcsById.has(id), `shouldSkipNPC references '${id}' but no map has it`).toBe(true);
    }
  });

  it('no gift or handler NPC can be swallowed by the item-ball, nurse, or mart stages', () => {
    // (shouldSkipNPC ids are excluded: the Mt. Moon fossils are legitimately item balls.)
    for (const id of [...giftIds, ...HANDLER_IDS]) {
      expect(id.startsWith('nurse'), `'${id}' would be treated as a nurse`).toBe(false);
      expect(id.startsWith('mart_clerk'), `'${id}' would be treated as a mart clerk`).toBe(false);
      for (const { mapId, npc } of npcsById.get(id) ?? []) {
        expect(npc.shopStock, `${mapId}:${id} has shopStock — shop would open instead`).toBeUndefined();
        expect(npc.isItemBall, `${mapId}:${id} is an item ball — story branch unreachable`).toBeFalsy();
      }
    }
  });

  it('no gift or handler id collides with a handler prefix', () => {
    for (const id of [...giftIds, ...HANDLER_IDS]) {
      for (const prefix of HANDLER_PREFIXES) {
        expect(id.startsWith(prefix), `'${id}' collides with prefix '${prefix}'`).toBe(false);
      }
    }
  });

  it('only the two Giovannis are trainers among gift/handler NPCs', () => {
    const trainers = new Set<string>();
    for (const id of [...giftIds, ...HANDLER_IDS]) {
      for (const { npc } of npcsById.get(id) ?? []) {
        if (npc.isTrainer) trainers.add(id);
      }
    }
    expect(trainers).toEqual(INTENTIONAL_TRAINER_STORY_NPCS);
  });

  it('GIFT_NPCS lookup is safe against Object.prototype keys', () => {
    // interactWithNPC does `GIFT_NPCS[npc.id]`; an NPC id like 'constructor'
    // would resolve to a prototype function and crash on `.resolve`.
    for (const id of allIds) {
      if (!Object.prototype.hasOwnProperty.call(GIFT_NPCS, id)) {
        expect((GIFT_NPCS as Record<string, unknown>)[id], `'${id}' hits Object.prototype`).toBeUndefined();
      }
    }
  });
});
