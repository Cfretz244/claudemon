import { describe, it, expect } from 'vitest';
import ENTRANCES_SRC from '../../src/systems/animations/entrances.ts?raw';
import BATTLE_SCENE_SRC from '../../src/scenes/BattleScene.ts?raw';
import BATTLE_SIM_SRC from '../../src/battleSim.ts?raw';
import MOVE_ANIMATIONS_SRC from '../../src/systems/MoveAnimations.ts?raw';
import { soundSystem } from '../../src/systems/SoundSystem';
import { POKEMON_DATA } from '../../src/data/pokemon';
import {
  resolveEntrance, resolveCry, MAX_WILD_MS, MAX_SENDOUT_MS, SHAPE_FLOURISH,
  CRY_CONTOURS,
} from '../../src/logic/entranceSpec';

/**
 * The entrance renderer imports Phaser, which cannot be loaded in the node test
 * environment, so - exactly as `moveOverrides.test.ts` does for the move
 * overrides - these tests read the renderer and the scene as source text. That
 * is enough to pin the three things that are easy to break and invisible in a
 * screenshot: the sequencing rule, the restore contract, and the fact that the
 * shape table is total. `SoundSystem` is Phaser-free, so the cry is tested for
 * real.
 */

const SHAPES = ['round', 'angular', 'tall', 'wide', 'bird', 'snake', 'bug'] as const;

describe('entrance renderer: the shape table is total', () => {
  const arrivals = ENTRANCES_SRC.split('export const ARRIVALS')[1]?.split('};')[0] ?? '';

  it('exports one arrival per EntranceShape', () => {
    expect(arrivals).not.toBe('');
    for (const shape of SHAPES) {
      expect(arrivals).toMatch(new RegExp(`\\b${shape}:\\s*arrive`));
    }
  });

  it('has a flourish renderer and a duration for every flourish a shape asks for', () => {
    const table = ENTRANCES_SRC.split('const FLOURISHES')[1]?.split('\n};')[0] ?? '';
    const msTable = ENTRANCES_SRC.split('export const FLOURISH_MS')[1]?.split('};')[0] ?? '';
    for (const shape of SHAPES) {
      const flourish = SHAPE_FLOURISH[shape];
      expect(table).toContain(`${flourish}:`);
      expect(msTable).toContain(`${flourish}:`);
    }
  });

  it('leaves the flourishes inside the design 150-250 ms window', () => {
    const msTable = ENTRANCES_SRC.split('export const FLOURISH_MS')[1]?.split('};')[0] ?? '';
    const entries = [...msTable.matchAll(/(\w+):\s*(\d+)/g)];
    expect(entries.length).toBe(7);
    for (const [, name, ms] of entries) {
      // `hop` is the design's own 120 ms `lunge`, the rest sit in 150-250.
      const min = name === 'hop' ? 120 : 150;
      expect(Number(ms)).toBeGreaterThanOrEqual(min);
      expect(Number(ms)).toBeLessThanOrEqual(250);
    }
  });

  it('leaves every shape a real arrival once the cap and quantisation are paid', () => {
    const msTable = ENTRANCES_SRC.split('export const FLOURISH_MS')[1]?.split('};')[0] ?? '';
    const flourishMs = Object.fromEntries(
      [...msTable.matchAll(/(\w+):\s*(\d+)/g)].map(m => [m[1], Number(m[2])]),
    );
    const quant = Number(ENTRANCES_SRC.match(/QUANTISATION_MS = (\d+)/)![1]);
    for (const species of Object.values(POKEMON_DATA)) {
      for (const kind of ['wild', 'sendout'] as const) {
        const spec = resolveEntrance(species, kind);
        const cap = kind === 'sendout' ? MAX_SENDOUT_MS : MAX_WILD_MS;
        // ANGULAR's 800 ms is the wild cap exactly, so without the quantisation
        // allowance the cap race would fire every time and eat its flourish -
        // which is what the e2e runner measured before this was added.
        const budget = Math.min(spec.duration, cap) - quant;
        expect(budget - flourishMs[spec.flourish]).toBeGreaterThan(120);
        // ...and the whole plan (arrival + flourish = budget) stays under it.
        expect(budget).toBeLessThanOrEqual(cap - quant);
      }
    }
  });
});

describe('entrance renderer: restore, cleanup and cap', () => {
  it('restores the sprite in a finally, so a throw cannot strand it', () => {
    const play = ENTRANCES_SRC.split('export async function playEntrance')[1] ?? '';
    expect(play).toContain('} finally {');
    const fin = play.split('} finally {')[1];
    expect(fin).toContain('restore(state)');
    expect(fin).toContain('killTweensOf(sprite)');
    expect(fin).toContain('obj.destroy()');
    expect(fin).toContain('mask.destroy()');
  });

  it('snapshots position, scale, angle, tint and mask', () => {
    const snap = ENTRANCES_SRC.split('function snapshot(')[1].split('\n}')[0];
    for (const field of ['sprite.x', 'sprite.y', 'sprite.scaleX', 'sprite.scaleY',
      'sprite.angle', 'sprite.isTinted', 'sprite.tintTopLeft', 'sprite.mask']) {
      expect(snap).toContain(field);
    }
  });

  it('ends visible: alpha is the one value restore does NOT put back', () => {
    const rest = ENTRANCES_SRC.split('function restore(')[1].split('\n}')[0];
    expect(rest).toContain('s.setAlpha(1)');
    expect(rest).not.toContain('state.alpha');
  });

  it('races the cap constants the spec module owns', () => {
    expect(ENTRANCES_SRC).toContain('MAX_SENDOUT_MS : MAX_WILD_MS');
    expect(ENTRANCES_SRC).toContain('Promise.race');
    // And the caps still are what the resolver promises.
    expect(MAX_WILD_MS).toBe(800);
    expect(MAX_SENDOUT_MS).toBe(900);
  });

  it('ignores overrideId in this PR but leaves the registry for E4', () => {
    expect(ENTRANCES_SRC).toContain('export function registerEntranceOverride');
    const play = ENTRANCES_SRC.split('export async function playEntrance')[1] ?? '';
    expect(play).not.toContain('entranceOverride(');
  });

  it('drives its flourishes at 0.6x for a send-out', () => {
    expect(ENTRANCES_SRC).toContain("spec.kind === 'sendout' ? 0.6 : 1");
  });

  it('uses the primitives MoveAnimations already exports', () => {
    for (const fn of ['tweenPromise', 'ring', 'groundHeave', 'fallingBlocks',
      'afterimage', 'warpArcs', 'directionalParticles', 'animateFrames',
      'spriteFlash', 'lunge', 'screenShake', 'sparkle']) {
      expect(ENTRANCES_SRC).toContain(fn);
      expect(MOVE_ANIMATIONS_SRC).toContain(`export function ${fn}`);
    }
  });
});

describe('BattleScene: the sequencing rule', () => {
  const intro = BATTLE_SCENE_SRC.split('private async playBattleIntro')[1].split('\n  }')[0];

  it('starts the wild entrance BEFORE its text and awaits it AFTER', () => {
    const start = intro.indexOf('const entrance = this.playOpponentEntrance()');
    const text = intro.indexOf('Wild ${opponentName}');
    const awaited = intro.indexOf('await entrance;');
    expect(start).toBeGreaterThan(-1);
    expect(start).toBeLessThan(text);
    expect(text).toBeLessThan(awaited);
  });

  it('opens the menu only after the intro has finished awaiting', () => {
    // lastIndexOf: the ghost branch opens the menu early and returns first.
    expect(intro.indexOf('await entrance;')).toBeLessThan(intro.lastIndexOf('showBattleMenu'));
  });

  it('starts a wild opponent invisible so the entrance can bring it in', () => {
    expect(BATTLE_SCENE_SRC).toContain('this.opponentSprite.setAlpha(0);');
    expect(BATTLE_SCENE_SRC).not.toContain('// Wild battle: show opponent Pokemon immediately');
  });

  it('leaves the ghost encounter instant', () => {
    expect(BATTLE_SCENE_SRC).toContain('Ghost encounter: unchanged');
  });
});

describe('BattleScene: the cry moved onto the reveal', () => {
  it('no longer cries from create()', () => {
    const create = BATTLE_SCENE_SRC.split('  create(')[1].split('\n  private async playBattleIntro')[0];
    expect(create).not.toContain('pokemonCry');
  });

  it('cries from inside the wild entrance', () => {
    const entrance = BATTLE_SCENE_SRC.split('private playOpponentEntrance')[1].split('\n  }')[0];
    expect(entrance).toContain('onMaterialise: () => this.opponentCry()');
  });

  it('still cries for a trainer battle, at the end of slideOpponentIn', () => {
    const slide = BATTLE_SCENE_SRC.split('private slideOpponentIn')[1].split('\n  }')[0];
    expect(slide).toContain('this.opponentCry()');
  });

  it('does not touch the player send-out yet (E3 owns it)', () => {
    const slide = BATTLE_SCENE_SRC.split('private slidePlayerIn')[1].split('\n  }')[0];
    expect(slide).not.toContain('playEntrance');
    expect(slide).not.toContain('Cry');
  });
});

describe('DEV hooks the e2e runner needs', () => {
  it('publishes the renderer on the Phaser game (window.__claudemon)', () => {
    expect(BATTLE_SCENE_SRC).toContain('(this.game as unknown as Record<string, unknown>).entrances');
    expect(BATTLE_SCENE_SRC).toContain('playEntrance,');
    expect(BATTLE_SCENE_SRC).toContain('resolveEntrance,');
    expect(BATTLE_SCENE_SRC).toContain('replayIntro:');
  });

  it('exposes replayIntro on __battleSim too', () => {
    const hook = BATTLE_SIM_SRC.split('__battleSim = {')[1].split('\n  }')[0];
    expect(hook).toContain('replayIntro');
  });

  it('puts the borrowed texture back after a replay', () => {
    const replay = BATTLE_SCENE_SRC.split('async replayIntro(')[1].split('\n  private slideOpponentIn')[0];
    expect(replay).toContain('} finally {');
    expect(replay).toContain('sprite.setTexture(prevKey, prevFrame)');
  });
});

describe('SoundSystem.pokemonCryFor', () => {
  /** Capture what would have been scheduled, without touching Web Audio. */
  function capture(fn: () => void): Array<[unknown, unknown, unknown]> {
    const sys = soundSystem as unknown as Record<string, unknown>;
    const orig = sys.playNotes;
    const calls: Array<[unknown, unknown, unknown]> = [];
    sys.playNotes = (notes: unknown, type: unknown, volume: unknown): void => {
      calls.push([JSON.parse(JSON.stringify(notes)), type, volume]);
    };
    try { fn(); } finally { sys.playNotes = orig; }
    return calls;
  }

  it('plays the triad byte-for-byte like today pokemonCry does', () => {
    const before = capture(() => soundSystem.pokemonCry(303));
    const after = capture(() =>
      soundSystem.pokemonCryFor({ baseFreq: 303, contour: 'triad', wave: 'sawtooth' }));
    expect(after).toEqual(before);
  });

  it('routes a round mon to that same unchanged cry', () => {
    const jigglypuff = POKEMON_DATA[39];
    const spec = resolveCry(jigglypuff);
    expect(spec.contour).toBe('triad');
    const before = capture(() => soundSystem.pokemonCry(spec.baseFreq));
    const after = capture(() => soundSystem.pokemonCryFor(spec));
    expect(after).toEqual(before);
  });

  it('plays each contour at the species base frequency and the cry volume', () => {
    const geodude = POKEMON_DATA[74];
    const spec = resolveCry(geodude);
    const [[notes, wave, volume]] = capture(() => soundSystem.pokemonCryFor(spec));
    expect(wave).toBe(spec.wave);
    expect(volume).toBe(0.08);
    expect(notes).toEqual(CRY_CONTOURS[spec.contour].map(n => ({
      freq: spec.baseFreq * n.freqMul, dur: n.dur, delay: n.delay,
    })));
  });

  it('keeps pokemonCry signature-compatible for its other callers', () => {
    // Menus, the Pokedex cry button and the ghost encounter still call it.
    expect(typeof soundSystem.pokemonCry).toBe('function');
    const [[notes]] = capture(() => soundSystem.pokemonCry());
    expect(notes).toHaveLength(3);
  });

  it('takes the modulated path only for tremolo/vibrato mons', () => {
    const charmander = resolveCry(POKEMON_DATA[4]);
    expect(charmander.tremolo).toBe(true);
    // Tremolo notes never reach playNotes: they are built one oscillator at a
    // time so the LFO can ride on them.
    expect(capture(() => soundSystem.pokemonCryFor(charmander))).toEqual([]);
  });
});
