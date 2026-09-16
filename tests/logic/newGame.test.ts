// Pins the state a new game starts in, to exactly what
// OverworldScene.init()'s `data.newGame` branch built: the PlayerState
// defaults, the two chosen names, and `intro_complete` — nothing else.
//
// It also sweeps `src/` for readers of the flag. `intro_complete` is
// write-only today: nothing branches on it, so nobody may assume it gates the
// intro. If a reader ever appears, the sweep fails here first.
import { describe, it, expect } from 'vitest';
import { newGameState, INTRO_COMPLETE_FLAG } from '../../src/logic/newGame';
import { PlayerState } from '../../src/entities/Player';
import { ALL_MAPS } from '../../src/data/maps';
import { GIFT_NPCS } from '../../src/data/giftNpcs';

/**
 * Every .ts file under `src/`, as source text. `import.meta.glob` is Vite's
 * (and so vitest's) own file sweep — no node typings needed — and the `?raw`
 * query hands back the text instead of the module.
 */
const SRC_FILES = (import.meta as unknown as {
  glob(pattern: string, opts: object): Record<string, string>;
}).glob('../../src/**/*.ts', { query: '?raw', import: 'default', eager: true });

describe('newGameState', () => {
  it('sets exactly one story flag', () => {
    expect(newGameState('RED', 'BLUE').storyFlags).toEqual({ intro_complete: true });
    expect(INTRO_COMPLETE_FLAG).toBe('intro_complete');
  });

  it('starts with an empty party, bag, PC, badges and Pokedex', () => {
    const state = newGameState('RED', 'BLUE');
    expect(state.party).toEqual([]);
    expect(state.pc).toEqual([]);
    expect(state.bag).toEqual({});
    expect(state.pcItems).toEqual({});
    expect(state.badges).toEqual([]);
    expect(state.defeatedTrainers).toEqual([]);
    expect(state.pokedexSeen).toEqual([]);
    expect(state.pokedexCaught).toEqual([]);
    expect(state.playTime).toBe(0);
    expect(state.coins).toBe(0);
    expect(state.repelSteps).toBe(0);
  });

  it('applies the names only when they are given', () => {
    const fresh = new PlayerState();
    expect(newGameState('ASH', 'GARY').name).toBe('ASH');
    expect(newGameState('ASH', 'GARY').rivalName).toBe('GARY');
    expect(newGameState(undefined, undefined).name).toBe(fresh.name);
    expect(newGameState(undefined, undefined).rivalName).toBe(fresh.rivalName);
    expect(newGameState('', '').name).toBe('RED');
    expect(newGameState('', '').rivalName).toBe('BLUE');
    expect(newGameState('ASH').rivalName).toBe('BLUE');
    expect(newGameState(undefined, 'GARY').name).toBe('RED');
  });

  it('is a plain PlayerState otherwise — same money and same heal point', () => {
    const fresh = new PlayerState();
    const started = newGameState('RED', 'BLUE');
    expect(started.money).toBe(fresh.money);
    expect(started.lastHealMap).toBe(fresh.lastHealMap);
    expect(started.lastHealX).toBe(fresh.lastHealX);
    expect(started.lastHealY).toBe(fresh.lastHealY);
    expect(started).toBeInstanceOf(PlayerState);
  });

  it('each call is a fresh object — two new games do not share a bag', () => {
    const a = newGameState('A', 'B');
    const b = newGameState('C', 'D');
    a.bag.potion = 1;
    a.storyFlags.bogus = true;
    expect(b.bag).toEqual({});
    expect(b.storyFlags).toEqual({ intro_complete: true });
  });

  it('survives the save round trip the scene does on every transition', () => {
    const save = newGameState('ASH', 'GARY').toSave();
    expect(save.storyFlags).toEqual({ intro_complete: true });
    expect(save.playerName).toBe('ASH');
    expect(save.rivalName).toBe('GARY');
    expect(PlayerState.fromSave(save).storyFlags).toEqual({ intro_complete: true });
  });
});

describe('intro_complete is write-only', () => {
  const files = Object.entries(SRC_FILES).map(([path, text]) => [path.replace('../../', ''), text] as const);
  const mentions = files.filter(([, text]) => /\bintro_complete\b/.test(text)).map(([path]) => path);

  it('only three files in src mention it, and all three WRITE it', () => {
    expect(mentions.sort()).toEqual([
      // The battle simulator seeds a started game.
      'src/data/battleSimConfig.ts',
      // The save editor's presets and its flag list.
      'src/data/saveEditorPresets.ts',
      // Where a new game sets it.
      'src/logic/newGame.ts',
    ]);
  });

  it('nothing in src reads the flag back out of storyFlags', () => {
    const reads: string[] = [];
    for (const [file, text] of files) {
      for (const line of text.split('\n')) {
        // A read looks like `storyFlags['intro_complete']` or
        // `storyFlags[INTRO_COMPLETE_FLAG]` NOT followed by an assignment.
        const m = /storyFlags(\[['"`]intro_complete['"`]\]|\[INTRO_COMPLETE_FLAG\]|\.intro_complete)(?!\s*=[^=])/.exec(line);
        if (m) reads.push(`${file}: ${line.trim()}`);
      }
    }
    expect(reads).toEqual([]);
  });

  it('no map gate, entry gate or elevator requires it', () => {
    const named: string[] = [];
    for (const [mapId, map] of Object.entries(ALL_MAPS)) {
      const blobs = [
        ...(map.entryGates ?? []).map(g => JSON.stringify(g.requires)),
        ...(map.gates ?? []).map(g => g.flag ?? ''),
        map.elevator ? JSON.stringify(map.elevator) : '',
        ...map.warps.map(w => JSON.stringify(w)),
      ];
      if (blobs.some(b => b.includes(INTRO_COMPLETE_FLAG))) named.push(mapId);
    }
    expect(named).toEqual([]);
  });

  it('no gift NPC changes what it says because of it', () => {
    // Every GIFT_NPCS entry resolved against a fresh new game and against the
    // same state without the flag gives the same answer.
    const withFlag = newGameState('RED', 'BLUE');
    const withoutFlag = newGameState('RED', 'BLUE');
    delete withoutFlag.storyFlags[INTRO_COMPLETE_FLAG];
    for (const [id, gift] of Object.entries(GIFT_NPCS)) {
      expect(JSON.stringify(gift.resolve(withFlag)?.dialogue ?? null), id)
        .toBe(JSON.stringify(gift.resolve(withoutFlag)?.dialogue ?? null));
    }
  });
});
