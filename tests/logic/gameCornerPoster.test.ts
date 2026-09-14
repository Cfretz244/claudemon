// Pins the Game Corner poster to the exact behaviour that lived in
// OverworldScene.readSign() (messages verbatim, same flag), and pins that flag
// against the Rocket Hideout entry gate that reads it.
import { describe, it, expect } from 'vitest';
import {
  posterOutcome, isPosterSign,
  POSTER_MAP_ID, POSTER_X, POSTER_Y, POSTER_SIGN_KEY,
  POSTER_FOUND_FLAG, POSTER_ROCKET_TRAINER_ID, POSTER_MESSAGES,
  PosterStage,
} from '../../src/logic/gameCornerPoster';
import { checkEntryGates } from '../../src/logic/warpGate';
import { shouldSkipNPC } from '../../src/logic/npcVisibility';
import { ALL_MAPS } from '../../src/data/maps';
import { SIGNS } from '../../src/data/signs';
import { TRAINERS } from '../../src/data/trainers';
import { TileType, NPCData } from '../../src/types/map.types';
import { Direction } from '../../src/utils/constants';

const st = (o: { found?: boolean; beat?: boolean } = {}) => {
  const storyFlags: Record<string, boolean> = {};
  if (o.found) storyFlags[POSTER_FOUND_FLAG] = true;
  return { storyFlags, defeatedTrainers: o.beat ? [POSTER_ROCKET_TRAINER_ID] : [] };
};

describe('posterOutcome', () => {
  it('is exhaustive over flag x guard-defeated', () => {
    const table = [false, true].flatMap(found =>
      [false, true].map(beat => [found, beat, posterOutcome(st({ found, beat }))] as const));
    expect(table).toEqual([
      [false, false, {
        stage: 'plain',
        messages: ['A poster for a GAME\nCORNER tournament...'],
        setsFlag: null,
      }],
      [false, true, {
        stage: 'reveal',
        messages: ["There's a switch\nbehind the poster!", 'A hidden staircase\nappeared!'],
        setsFlag: 'game_corner_poster_found',
      }],
      [true, false, {
        stage: 'found',
        messages: ['The hidden stairs\nlead underground...'],
        setsFlag: null,
      }],
      [true, true, {
        stage: 'found',
        messages: ['The hidden stairs\nlead underground...'],
        setsFlag: null,
      }],
    ]);
  });

  it('only ever writes the flag once: a second reading is the found branch', () => {
    const state = st({ beat: true });
    const first = posterOutcome(state);
    expect(first.setsFlag).toBe(POSTER_FOUND_FLAG);
    state.storyFlags[first.setsFlag!] = true;   // what readSign's onComplete does
    const second = posterOutcome(state);
    expect(second.stage).toBe('found');
    expect(second.setsFlag).toBeNull();
  });

  it('beating a different Rocket does not reveal the switch', () => {
    for (const id of ['giovanni_game_corner', 'jessie_gamecorner', 'rocket_hideout_b1f_grunt1']) {
      expect(posterOutcome({ storyFlags: {}, defeatedTrainers: [id] }).stage, id).toBe('plain');
    }
  });

  it('returns fresh arrays, so a caller cannot corrupt the tables', () => {
    const msgs = posterOutcome(st()).messages;
    msgs[0] = 'mutated';
    expect(posterOutcome(st()).messages[0]).toBe(POSTER_MESSAGES.plain[0]);
  });

  it('every stage has a non-empty script', () => {
    for (const stage of ['found', 'reveal', 'plain'] as PosterStage[]) {
      expect(POSTER_MESSAGES[stage].length, stage).toBeGreaterThan(0);
    }
  });
});

describe('the poster sign key', () => {
  it('only the Game Corner poster tile is diverted', () => {
    expect(POSTER_SIGN_KEY).toBe('game_corner:11,2');
    expect(isPosterSign(POSTER_SIGN_KEY)).toBe(true);
    for (const key of ['game_corner:11,3', 'celadon_city:11,2', 'game_corner:110,2', '']) {
      expect(isPosterSign(key), key).toBe(false);
    }
  });

  it('the key addresses a real SIGN tile the player can stand in front of', () => {
    const map = ALL_MAPS[POSTER_MAP_ID];
    expect(map).toBeDefined();
    expect(map.tiles[POSTER_Y][POSTER_X]).toBe(TileType.SIGN);
    const below = map.collision[POSTER_Y + 1]?.[POSTER_X];
    expect(below, 'the tile south of the poster must be walkable').toBe(false);
  });

  it('no SIGNS entry shadows it — the handler is the only source of poster text', () => {
    expect(SIGNS[POSTER_SIGN_KEY]).toBeUndefined();
  });
});

describe('the flag vs. the Rocket Hideout entry gate', () => {
  const gateState = (o: { found?: boolean; beatGiovanni?: boolean } = {}) => {
    const storyFlags: Record<string, boolean> = {};
    if (o.found) storyFlags[POSTER_FOUND_FLAG] = true;
    return {
      storyFlags,
      badges: [] as string[],
      defeatedTrainers: o.beatGiovanni ? ['giovanni_game_corner'] : [],
      hasItem: () => false,
    };
  };
  const enter = (s: ReturnType<typeof gateState>) =>
    checkEntryGates(ALL_MAPS.rocket_hideout_b1f, POSTER_MAP_ID, s);

  it('the hideout stairs read exactly the flag the poster writes', () => {
    const gate = ALL_MAPS.rocket_hideout_b1f.entryGates!
      .find(g => g.requires.flag !== undefined);
    expect(gate!.requires.flag).toBe(POSTER_FOUND_FLAG);
    expect(gate!.from).toContain(POSTER_MAP_ID);
  });

  it('without the poster reading the stairs are silently shut, with it they open', () => {
    expect(enter(gateState())).toEqual({ ok: false, message: [] });
    expect(enter(gateState({ found: true }))).toEqual({ ok: true });
  });

  it('beating the guard is not enough on its own — the reading is what opens it', () => {
    const state = { storyFlags: {} as Record<string, boolean>, badges: [] as string[],
                    defeatedTrainers: [POSTER_ROCKET_TRAINER_ID], hasItem: () => false };
    expect(enter(state).ok).toBe(false);
    const decision = posterOutcome(state);
    state.storyFlags[decision.setsFlag!] = true;
    expect(enter(state).ok).toBe(true);
  });

  it('the stairs seal again once Giovanni has been driven out', () => {
    expect(enter(gateState({ found: true, beatGiovanni: true })))
      .toEqual({ ok: false, message: ['The hideout has been\nabandoned...'] });
  });
});

describe('the poster guard', () => {
  const npc = (id: string): NPCData =>
    ({ id, x: 0, y: 0, spriteColor: 0xffffff, direction: Direction.DOWN, dialogue: ['Hi'], isTrainer: true });

  it('is a real trainer standing in the Game Corner', () => {
    expect(TRAINERS[POSTER_ROCKET_TRAINER_ID]).toBeDefined();
    const placed = ALL_MAPS[POSTER_MAP_ID].npcs.find(n => n.id === POSTER_ROCKET_TRAINER_ID);
    expect(placed, 'poster guard must stand in the Game Corner').toBeDefined();
    expect(placed!.isTrainer).toBe(true);
  });

  it('stays put after his own defeat and only leaves with Giovanni', () => {
    expect(shouldSkipNPC(npc(POSTER_ROCKET_TRAINER_ID), {}, [], [POSTER_ROCKET_TRAINER_ID], () => false))
      .toBe(false);
    expect(shouldSkipNPC(npc(POSTER_ROCKET_TRAINER_ID), {}, [], ['giovanni_game_corner'], () => false))
      .toBe(true);
  });
});
