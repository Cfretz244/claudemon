// Pins what beating the Champion does, to exactly the behaviour that lived in
// BattleScene.showHallOfFame(): the `champion` flag, the party heal and the
// return warp — plus the one thing in the shipped game that reads the flag
// (Cerulean Cave's entry gate) and the landing tile the credits hand back to.
import { describe, it, expect } from 'vitest';
import { hallOfFameResult, CHAMPION_FLAG } from '../../src/logic/hallOfFame';
import { restoreParty } from '../../src/logic/healing';
import { checkEntryGates } from '../../src/logic/warpGate';
import { PlayerState } from '../../src/entities/Player';
import { createPokemon } from '../../src/entities/Pokemon';
import { ALL_MAPS } from '../../src/data/maps';
import { CHAMPION } from '../../src/data/eliteFour';
import { StatusCondition } from '../../src/types/pokemon.types';
import { TileType } from '../../src/types/map.types';

/**
 * Every .ts file under `src/`, as source text. `import.meta.glob` is Vite's
 * (and so vitest's) own file sweep — no node typings needed — and the `?raw`
 * query hands back the text instead of the module.
 */
const SRC_FILES = (import.meta as unknown as {
  glob(pattern: string | string[], opts: object): Record<string, string>;
}).glob(['../../src/**/*.ts', '../../packages/engine/src/**/*.ts'], { query: '?raw', import: 'default', eager: true });

const gateState = (storyFlags: Record<string, boolean>) => ({
  storyFlags, badges: [], defeatedTrainers: [], hasItem: () => false,
});

describe('hallOfFameResult', () => {
  it('is the same decision every time: champion, a heal, and the bedroom', () => {
    expect(hallOfFameResult()).toEqual({
      flags: ['champion'],
      healParty: true,
      returnTo: { mapId: 'player_house', x: 3, y: 5 },
    });
  });

  it('CHAMPION_FLAG is the flag it writes', () => {
    expect(CHAMPION_FLAG).toBe('champion');
    expect(hallOfFameResult().flags).toEqual([CHAMPION_FLAG]);
  });

  it('writes exactly one flag — nothing else about the save changes here', () => {
    const state = new PlayerState();
    for (const flag of hallOfFameResult().flags) state.storyFlags[flag] = true;
    expect(state.storyFlags).toEqual({ champion: true });
  });

  it('setting it twice is idempotent (beating the Champion again is a no-op)', () => {
    const state = new PlayerState();
    for (const run of [0, 1]) {
      void run;
      for (const flag of hallOfFameResult().flags) state.storyFlags[flag] = true;
    }
    expect(state.storyFlags).toEqual({ champion: true });
    expect(Object.keys(state.storyFlags)).toHaveLength(1);
  });

  it('the result object is fresh each call — a caller cannot poison the next one', () => {
    const first = hallOfFameResult();
    first.flags.push('bogus');
    first.returnTo.x = 99;
    expect(hallOfFameResult()).toEqual({
      flags: [CHAMPION_FLAG], healParty: true, returnTo: { mapId: 'player_house', x: 3, y: 5 },
    });
  });
});

describe('champion: the flag the Cerulean Cave guard reads', () => {
  const caveGates = ALL_MAPS['cerulean_cave_1f'].entryGates ?? [];

  it('Cerulean Cave 1F has one entry gate and it requires CHAMPION_FLAG', () => {
    expect(caveGates).toHaveLength(1);
    expect(caveGates[0].requires).toEqual({ flag: CHAMPION_FLAG });
    expect(caveGates[0].from).toEqual(['cerulean_city']);
  });

  it('the mouth refuses a non-champion and opens for a champion', () => {
    const blocked = checkEntryGates(ALL_MAPS['cerulean_cave_1f'], 'cerulean_city', gateState({}));
    expect(blocked.ok).toBe(false);
    expect((blocked as { ok: false; message: string[] }).message.join(' ')).toContain('CHAMPION');
    expect(
      checkEntryGates(ALL_MAPS['cerulean_cave_1f'], 'cerulean_city', gateState({ [CHAMPION_FLAG]: true })).ok,
    ).toBe(true);
  });

  it('it is the only requirement in any shipped map that names the flag', () => {
    const named: string[] = [];
    for (const [mapId, map] of Object.entries(ALL_MAPS)) {
      for (const gate of map.entryGates ?? []) {
        if (JSON.stringify(gate.requires).includes(CHAMPION_FLAG)) named.push(`entryGate:${mapId}`);
      }
      for (const gate of map.gates ?? []) if (gate.flag === CHAMPION_FLAG) named.push(`gate:${mapId}`);
      if (map.elevator && JSON.stringify(map.elevator).includes(`"${CHAMPION_FLAG}"`)) named.push(`elevator:${mapId}`);
    }
    expect(named).toEqual(['entryGate:cerulean_cave_1f']);
  });

  it('every reader in src goes through CHAMPION_FLAG — the literal lives in two files', () => {
    // The flag string itself may only appear where it is DEFINED and in the
    // save editor's flag list (a label, not a reader). Everything else — the
    // Cerulean Cave gate, the Hall of Fame write — imports the constant, so
    // the two ends cannot drift apart.
    const literal = /(['"`])champion\1/;
    const files = Object.entries(SRC_FILES)
      .filter(([, text]) => literal.test(text))
      .map(([path]) => path.replace('../../', ''));
    expect(files.sort()).toEqual(['packages/engine/src/logic/hallOfFame.ts', 'src/data/saveEditorPresets.ts']);
  });
});

describe('the Hall of Fame heal and return', () => {
  it('healParty restores HP, status and PP for the whole party', () => {
    const a = createPokemon(25, 50);
    const b = createPokemon(6, 55);
    a.currentHp = 0;
    a.status = StatusCondition.PARALYSIS;
    b.currentHp = 3;
    for (const m of b.moves) m.currentPp = 0;
    expect(hallOfFameResult().healParty).toBe(true);
    restoreParty([a, b]);
    for (const mon of [a, b]) {
      expect(mon.currentHp).toBe(mon.stats.hp);
      expect(mon.status).toBe(StatusCondition.NONE);
      for (const m of mon.moves) expect(m.currentPp).toBe(m.maxPp);
    }
  });

  it('returnTo lands on a walkable, in-bounds, NPC-free tile of a real map', () => {
    const { mapId, x, y } = hallOfFameResult().returnTo;
    const map = ALL_MAPS[mapId];
    expect(map, `${mapId} is in ALL_MAPS`).toBeDefined();
    expect(x).toBeGreaterThanOrEqual(0);
    expect(y).toBeGreaterThanOrEqual(0);
    expect(x).toBeLessThan(map.width);
    expect(y).toBeLessThan(map.height);
    expect(map.collision[y][x]).toBe(false);
    expect(map.tiles[y][x]).toBe(TileType.CARPET);
    expect(map.npcs.some(n => n.x === x && n.y === y)).toBe(false);
  });

  it('returnTo is not a warp tile — the player does not bounce straight out', () => {
    const { mapId, x, y } = hallOfFameResult().returnTo;
    expect(ALL_MAPS[mapId].warps.some(w => w.x === x && w.y === y)).toBe(false);
  });

  it('returnTo is where a brand new game also starts (the same bedroom tile)', () => {
    const fresh = new PlayerState();
    expect(hallOfFameResult().returnTo).toEqual({
      mapId: fresh.lastHealMap, x: fresh.lastHealX, y: fresh.lastHealY,
    });
  });

  it('the trainer that triggers it is the Champion in the Elite Four data', () => {
    expect(CHAMPION.id).toBe('champion_rival');
    expect(CHAMPION.id).not.toBe(CHAMPION_FLAG);   // the flag is not a trainer id
  });
});
