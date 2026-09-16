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
    const sendoutReserve = Number(ENTRANCES_SRC.match(/SENDOUT_RESERVE_MS = (\d+)/)![1]);
    // A send-out has two more awaited phases than a wild arrival (the arc and
    // the ball's open) and its nominal duration IS its cap, so it reserves more.
    expect(sendoutReserve).toBeGreaterThan(quant);
    for (const species of Object.values(POKEMON_DATA)) {
      for (const kind of ['wild', 'sendout'] as const) {
        const spec = resolveEntrance(species, kind);
        const cap = kind === 'sendout' ? MAX_SENDOUT_MS : MAX_WILD_MS;
        const reserve = kind === 'sendout' ? sendoutReserve : quant;
        // ANGULAR's 800 ms is the wild cap exactly, so without the quantisation
        // allowance the cap race would fire every time and eat its flourish -
        // which is what the e2e runner measured before this was added.
        const budget = Math.min(spec.duration, cap) - reserve;
        expect(budget - flourishMs[spec.flourish]).toBeGreaterThan(120);
        // ...and the whole plan (arrival + flourish = budget) stays under it.
        expect(budget).toBeLessThanOrEqual(cap - reserve);
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

  it('throws a real Pokeball, above the sprites, and destroys it', () => {
    const throwFn = ENTRANCES_SRC.split('export async function ballThrow')[1].split('\n}')[0];
    expect(ENTRANCES_SRC).toContain("export const BALL_TEXTURE = 'pokeball_icon'");
    // Depth 6: just above the battle sprites (5), far below the text box.
    expect(ENTRANCES_SRC).toContain('export const BALL_DEPTH = 6');
    expect(throwFn).toContain('scene.textures.exists(BALL_TEXTURE)');
    expect(throwFn).toContain('ball?.destroy()');
    // Integer positions only on the 160x144 grid (design section 7).
    expect(throwFn).toContain('Math.round(x0 + (x1 - x0) * t)');
    // ...and one spin on the way over.
    expect(throwFn).toContain('ball.setAngle(Math.round(t * 360))');
  });

  it('opens the ball with a burst in the type palette and a white flash', () => {
    const throwFn = ENTRANCES_SRC.split('export async function ballThrow')[1].split('\n}')[0];
    expect(throwFn).toContain('impactBurst(scene, x1, y1, vocab.color, vocab.accentColor');
    expect(throwFn).toContain('screenFlash(scene, 0xFFFFFF, BALL_OPEN_MS)');
    expect(ENTRANCES_SRC).toContain('export const BALL_OPEN_MS = 60');
    // The burst outlives the flash: the mon materialises inside it.
    expect(throwFn).toContain('void impactBurst(');
  });

  it('gives every send-out the ball vehicle, whatever its shape', () => {
    const play = ENTRANCES_SRC.split('export async function playEntrance')[1] ?? '';
    expect(play).toContain("spec.kind === 'sendout' ? arriveSendOut : ARRIVALS[spec.shape]");
    const sendout = ENTRANCES_SRC.split('const arriveSendOut: ArrivalFn')[1].split('\n};')[0];
    expect(sendout).toContain('await ballThrow(');
    expect(sendout).toContain('run.ctx.from ?? defaultBallOrigin(run)');
    expect(sendout).toContain('await materialise(');
    expect(sendout).toContain('sprite.setAlpha(0)');
  });

  it('falls back to the screen edge when no trainer threw the ball', () => {
    const origin = ENTRANCES_SRC.split('function defaultBallOrigin')[1].split('\n}')[0];
    expect(origin).toContain("run.ctx.side === 'player' ? -8 : GAME_WIDTH + 8");
    expect(origin).toContain('y: run.homeY');
  });

  it('uses the primitives MoveAnimations already exports', () => {
    for (const fn of ['tweenPromise', 'ring', 'groundHeave', 'fallingBlocks',
      'afterimage', 'warpArcs', 'directionalParticles', 'animateFrames',
      'spriteFlash', 'lunge', 'screenShake', 'sparkle', 'impactBurst',
      'screenFlash']) {
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

  it('starts the player send-out BEFORE "Go!" and awaits it AFTER', () => {
    // Today's code awaited the text FIRST and only then slid the trainer out;
    // design section 3.2 flips it so the throw plays under the line.
    const wild = intro.split("} else if (this.battleType === BattleType.WILD) {")[1].split('\n    } else {')[0];
    const start = wild.indexOf('const sendOut = this.slidePlayerIn()');
    const text = wild.indexOf('Go! ${playerName}!');
    expect(start).toBeGreaterThan(-1);
    expect(start).toBeLessThan(text);
    expect(text).toBeLessThan(wild.indexOf('await sendOut;'));
  });

  it('starts both trainer-battle send-outs before their text and awaits after', () => {
    const trainer = intro.split('// Trainer: show both trainer sprites')[1];
    for (const [starter, awaited, line] of [
      ['const oppSendOut = this.slideOpponentIn()', 'await oppSendOut;', 'sent\\nout ${opponentName}!'],
      ['const sendOut = this.slidePlayerIn()', 'await sendOut;', 'Go! ${playerName}!'],
    ] as const) {
      const start = trainer.indexOf(starter);
      const text = trainer.indexOf(line);
      expect(start).toBeGreaterThan(-1);
      expect(text).toBeGreaterThan(-1);
      expect(start).toBeLessThan(text);
      expect(text).toBeLessThan(trainer.indexOf(awaited));
    }
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

  it('cries for a trainer send-out from inside sendOut, not from the slide', () => {
    // E2 pinned the cry to slideOpponentIn's onComplete because the trainer
    // send-out had no entrance to hang it on. It has one now, so the cry moves
    // with it - and BOTH sides cry (design section 3.1).
    const sendOut = BATTLE_SCENE_SRC.split('private sendOut(')[1].split('\n  }')[0];
    expect(sendOut).toContain('onMaterialise: () => this.cryFor(pokemon.speciesId)');
    const slide = BATTLE_SCENE_SRC.split('private slideOpponentIn')[1].split('\n  }')[0];
    expect(slide).not.toContain('Cry(');
  });

  it('leaves the undifferentiated pokemonCry only to the ghost', () => {
    // The ghost is not a species and has no contour; every other cry in the
    // scene goes through resolveCry -> pokemonCryFor, from the wild entrance
    // or from sendOut.
    const calls = [...BATTLE_SCENE_SRC.matchAll(/soundSystem\.pokemonCry\(/g)];
    expect(calls).toHaveLength(1);
    const ghost = BATTLE_SCENE_SRC.split('private opponentCry()')[1].split('\n  }')[0];
    expect(ghost).toContain('if (this.isGhost)');
    expect(ghost).toContain('soundSystem.pokemonCry(');
  });
});

describe('BattleScene: the shared send-out (E3)', () => {
  const sendOut = BATTLE_SCENE_SRC.split('private sendOut(')[1].split('\n  }')[0];

  it('plays the sendout entrance, from the ball origin, on the right side', () => {
    expect(sendOut).toContain("resolveEntrance(species, 'sendout')");
    expect(sendOut).toContain('from: this.ballOrigin(side)');
    expect(sendOut).toContain('playEntrance(this,');
  });

  it('kills the sprite tweens and hides the mon before the ball is thrown', () => {
    // The switch-in paths' own precedent, now shared: a faint tween still
    // running would fight the entrance.
    expect(sendOut).toContain('this.tweens.killTweensOf(sprite)');
    expect(sendOut).toContain('sprite.setAlpha(0)');
    expect(sendOut).toContain('this.ensurePokemonSprite(pokemon.speciesId)');
  });

  it('throws from the trainer sprite while it is on screen, else the edge', () => {
    const origin = BATTLE_SCENE_SRC.split('private ballOrigin(')[1].split('\n  }')[0];
    expect(origin).toContain('this.playerTrainerSprite');
    expect(origin).toContain('this.opponentTrainerSprite');
    expect(origin).toContain('GAME_WIDTH + 8');
  });

  it('routes both intro slides through it, at the slide midpoint', () => {
    for (const helper of ['slideOpponentIn', 'slidePlayerIn']) {
      const body = BATTLE_SCENE_SRC.split(`private ${helper}`)[1].split('\n  }')[0];
      expect(body).toContain('this.delay(200).then(() => this.sendOut(');
      // ...and the 400 ms trainer slide is still there behind it.
      expect(body).toContain('duration: 400');
      expect(body).not.toContain('alpha: 1');
    }
  });

  it('routes all three switch-in paths through it', () => {
    // 1: the trainer's next mon after a KO. 2: the player's next mon after a
    // faint. 3: a voluntary switch from the POKeMON menu.
    const trainerNext = BATTLE_SCENE_SRC.split('const nextOpponent =')[1].split('// Trainer defeated')[0];
    expect(trainerNext).toContain("this.sendOut('opponent', this.opponentPokemon)");
    const faintNext = BATTLE_SCENE_SRC.split('// Switch to next Pokemon')[1].split('\n    } else {')[0];
    expect(faintNext).toContain("this.sendOut('player', this.playerPokemon)");
    const voluntary = BATTLE_SCENE_SRC.split('private switchPlayerPokemon')[1].split('\n  }')[0];
    expect(voluntary).toContain("this.sendOut('player', this.playerPokemon)");
    // No path swaps the texture behind the entrance's back any more.
    for (const body of [trainerNext, faintNext, voluntary]) {
      expect(body).not.toContain('setTexture(spriteKey');
      expect(body).not.toContain('setAlpha(1)');
    }
  });

  it('starts every send-out before its text and awaits it after', () => {
    const trainerNext = BATTLE_SCENE_SRC.split('const nextOpponent =')[1].split('// Trainer defeated')[0];
    const faintNext = BATTLE_SCENE_SRC.split('// Switch to next Pokemon')[1].split('\n    } else {')[0];
    for (const body of [trainerNext, faintNext]) {
      const start = body.indexOf('const entrance = this.sendOut(');
      const text = body.indexOf('await this.showText(');
      const awaited = body.indexOf('await entrance;');
      expect(start).toBeGreaterThan(-1);
      expect(start).toBeLessThan(text);
      expect(text).toBeLessThan(awaited);
    }
    // The voluntary switch is callback-shaped (textBox.show), so its "after"
    // is the free hit: the AI swings only once the entrance has resolved.
    const voluntary = BATTLE_SCENE_SRC.split('private switchPlayerPokemon')[1].split('\n  }')[0];
    expect(voluntary.indexOf('const entrance = this.sendOut('))
      .toBeLessThan(voluntary.indexOf('this.textBox.show('));
    expect(voluntary).toContain('void entrance.then(');
  });

  it('keeps the free hit, the pre-selected AI move and the turn flags', () => {
    const voluntary = BATTLE_SCENE_SRC.split('private switchPlayerPokemon')[1].split('\n  }')[0];
    // The AI move is still chosen BEFORE the switch, so it cannot see the
    // incoming Pokemon - unchanged by this PR.
    expect(voluntary.indexOf('selectAIMove('))
      .toBeLessThan(voluntary.indexOf('this.currentPlayerPokemonIndex = newIndex'));
    expect(voluntary).toContain('this.executeMove(this.opponentPokemon');
    expect(voluntary).toContain('this.handlePlayerFaint()');
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
