import { describe, it, expect } from 'vitest';
import ENTRANCES_SRC from '../../src/systems/animations/entrances.ts?raw';
import OVERRIDES_SRC from '../../src/systems/animations/entranceOverrides.ts?raw';
import ANIMATIONS_INDEX_SRC from '../../src/systems/animations/index.ts?raw';
import BATTLE_SCENE_SRC from '../../src/scenes/BattleScene.ts?raw';
import BATTLE_SIM_SRC from '../../src/battleSim.ts?raw';
import MOVE_ANIMATIONS_SRC from '../../src/systems/MoveAnimations.ts?raw';
import { soundSystem } from '../../src/systems/SoundSystem';
import { POKEMON_DATA } from '../../src/data/pokemon';
import {
  resolveEntrance, resolveCry, MAX_WILD_MS, MAX_SENDOUT_MS, SHAPE_FLOURISH,
  CRY_CONTOURS, ENTRANCE_OVERRIDES,
} from '../../src/logic/entranceSpec';
import {
  catchTimeline, MAX_CATCH_BASE_MS, MAX_CATCH_PER_SHAKE_MS,
} from '../../src/logic/catchSequenceSpec';

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

  it('consults the override registry, and falls through when it is empty', () => {
    // E2 pinned the opposite of this ("ignores overrideId in this PR but leaves
    // the registry for E4"): at the time nothing was registered, so dispatching
    // would have meant dispatching to nothing. E4 fills the registry, so the
    // assertion flips - what has to stay true is the FALLTHROUGH, which is why
    // the lookup is a `const override = ...` and the shape row is still the
    // unconditional else rather than a branch that can throw.
    expect(ENTRANCES_SRC).toContain('export function registerEntranceOverride');
    const play = ENTRANCES_SRC.split('export async function playEntrance')[1] ?? '';
    expect(play).toContain('spec.overrideId ? entranceOverride(spec.overrideId) : undefined');
    expect(play).toContain('if (override) {');
    // An id with no renderer resolves to undefined and takes the shape path.
    const lookup = ENTRANCES_SRC.split('export function entranceOverride')[1].split('\n}')[0];
    expect(lookup).toContain('entranceOverrides.get(id)');
    expect(lookup).not.toContain('throw');
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

describe('entrance overrides: the twelve hand-authored arrivals (E4)', () => {
  const ids = [...new Set(Object.values(ENTRANCE_OVERRIDES))];

  /** Every renderer, as source text: `const entranceX: EntranceOverrideFn = ...`. */
  const renderers = [...OVERRIDES_SRC.matchAll(
    /const (entrance\w+): EntranceOverrideFn = async kit => \{([\s\S]*?)\n\};/g,
  )].map(m => ({ name: m[1], body: m[2] }));

  it('registers a renderer for every id in ENTRANCE_OVERRIDES', () => {
    expect(ids).toHaveLength(12);
    for (const id of ids) {
      expect(OVERRIDES_SRC).toContain(`registerEntranceOverride('${id}', entrance`);
    }
    // ...and registers nothing the resolver cannot ask for.
    const registered = [...OVERRIDES_SRC.matchAll(/registerEntranceOverride\('(\w+)'/g)]
      .map(m => m[1]);
    expect(registered.sort()).toEqual([...ids].sort());
  });

  it('is loaded by the barrel the scene imports, so the registry is populated', () => {
    expect(ANIMATIONS_INDEX_SRC).toContain("import './entranceOverrides'");
    expect(BATTLE_SCENE_SRC).toContain("import '../systems/animations'");
  });

  it('writes one renderer for the three legendary birds, not three', () => {
    const bird = [...OVERRIDES_SRC.matchAll(/registerEntranceOverride\('legendary_bird'/g)];
    expect(bird).toHaveLength(1);
    // Its palette comes from the kit (the resolver filled it from types[0]),
    // so ICE/ELECTRIC/FIRE give three different entrances out of one function.
    const body = renderers.find(r => r.name === 'entranceLegendaryBird')!.body;
    expect(body).toContain('kit.color');
    expect(body).toContain('kit.accent');
    expect(body).not.toMatch(/\b(articuno|zapdos|moltres|0x[0-9A-Fa-f]{6})\b/i);
  });

  it('touches no Phaser scene API of its own: only the kit and the primitives', () => {
    // The renderer module is the one place in the entrance code that a
    // contributor will copy-paste from, so it must not grow direct scene
    // access: anything it draws has to be a primitive (which destroys its own
    // graphics) or a kit method (whose objects go on the run's junk list), or
    // the cap can abort mid-beat and leave the field dirty.
    expect(OVERRIDES_SRC).not.toMatch(/from 'phaser'/);
    expect(OVERRIDES_SRC).not.toMatch(/\bPhaser\./);
    for (const api of ['add', 'make', 'tweens', 'time', 'cameras', 'children',
      'textures', 'sys', 'events', 'input', 'load']) {
      expect(OVERRIDES_SRC).not.toMatch(new RegExp(`scene\\.${api}\\b`));
    }
    // The scene reference it does hold is only ever handed to a primitive.
    const uses = [...OVERRIDES_SRC.matchAll(/kit\.scene\b(.)/g)].map(m => m[1]);
    expect(uses.length).toBeGreaterThan(0);
    for (const next of uses) expect(next).toBe(',');
  });

  it('imports only primitives MoveAnimations actually exports', () => {
    const imported = OVERRIDES_SRC.split("} from '../MoveAnimations'")[0]
      .split('import {').pop()!
      .split(',').map(s => s.trim()).filter(Boolean);
    expect(imported.length).toBeGreaterThan(5);
    for (const fn of imported) {
      expect(MOVE_ANIMATIONS_SRC).toContain(`export function ${fn}`);
    }
  });

  it('gives all twelve the same skeleton: phases from splitPhases, a cry, abort checks', () => {
    expect(renderers).toHaveLength(12);
    for (const { name, body } of renderers) {
      // Beats are WEIGHTS, not milliseconds: the window is smaller for a
      // send-out and varies by shape row, so a hard-coded ms would overrun.
      expect(body, name).toContain('splitPhases(kit.ms, [');
      // The cry is E1's, fired once, on the reveal.
      expect([...body.matchAll(/kit\.cry\(\)/g)], name).toHaveLength(1);
      // The cap can abort at any await; a renderer that ignores that keeps
      // drawing into a field the finally has already cleaned.
      expect(body, name).toContain('if (kit.aborted) return;');
      // Travel scales with the amplitude, so a send-out cannot upstage a
      // fight: every pixel distance in the file is `N * kit.amp`, never `N`.
      for (const m of body.matchAll(/Math\.round\(\d+ \* ([\w.]+)\)/g)) {
        expect(m[1], name).toBe('kit.amp');
      }
    }
  });

  it('keeps the design section 5 details that are easy to get wrong', () => {
    const byName = Object.fromEntries(renderers.map(r => [r.name, r.body]));
    // GENGAR is a hole in the field, not a pale silhouette.
    expect(OVERRIDES_SRC).toContain('GENGAR_TINT = 0x202040');
    expect(byName.entranceGengar).toContain('kit.silhouette(GENGAR_TINT)');
    // ...and it fades UP to 0.3 rather than starting there (see the const's
    // comment): a full-size silhouette on frame one is a mon already present.
    expect(OVERRIDES_SRC).toContain('GENGAR_GHOST_ALPHA = 0.3');
    expect(byName.entranceGengar).toContain('kit.sprite.setAlpha(0)');
    // MEWTWO dims the screen 20 %, under the text box, and never lands.
    expect(OVERRIDES_SRC).toContain('MEWTWO_DIM = 0.2');
    expect(byName.entranceMewtwo).toContain('kit.dim(MEWTWO_DIM');
    expect(byName.entranceMewtwo).not.toContain('screenShake');
    expect(ENTRANCES_SRC).toContain('export const DIM_DEPTH = 899');
    // SNORLAX brings its own mass beat, louder than the generic one.
    expect(byName.entranceSnorlax).toContain('screenShake(kit.scene, 3,');
    expect(byName.entranceSnorlax).toContain("ease: 'Bounce.easeOut'");
    // PIKACHU: burst, two sparks, two hops.
    expect(byName.entrancePikachu).toContain('impactBurst(');
    expect(byName.entrancePikachu).toContain('kit.accent, 2,');
    expect([...byName.entrancePikachu.matchAll(/kit\.flourish\('hop'/g)]).toHaveLength(2);
    // The beam-led reveals put an empty beat FIRST, or the pillar is on screen
    // before the entrance has visibly begun (the runner samples at t0).
    for (const n of ['entranceCharizard', 'entranceLegendaryBird']) {
      expect(byName[n].indexOf('kit.frames(lead, NOTHING)'))
        .toBeLessThan(byName[n].indexOf('typeBeam('));
    }
  });

  it('folds the mass shake into the override but leaves the rare sparkle generic', () => {
    const play = ENTRANCES_SRC.split('export async function playEntrance')[1] ?? '';
    // Rarity is a property of the species, not of the arrival, so MEWTWO and
    // the birds keep the generic sparkle wherever the dispatch goes...
    expect(play.indexOf('if (spec.rare)')).toBeLessThan(play.indexOf('if (override) {'));
    // ...while the generic mass shake belongs to the shape rows only: a
    // hand-authored landing lands its own weight (SNORLAX at 3, MEWTWO never).
    expect(play).toContain('No generic mass shake here');
  });

  it('still throws the ball for a send-out, then hands the rest to the override', () => {
    const play = ENTRANCES_SRC.split('export async function playEntrance')[1] ?? '';
    const branch = play.split('if (override) {')[1].split('\n    }')[0];
    expect(branch.indexOf("spec.kind === 'sendout'")).toBeLessThan(branch.indexOf('await override('));
    expect(branch).toContain('await ballThrow(');
    // The override's window is what is left after the arc and the ball's open.
    expect(branch).toContain('budget - throwMs - BALL_OPEN_MS - OVERRIDE_BEAT_RESERVE_MS');
    // ...minus one more beat allowance, because a tier-3 window is split into
    // up to six phases and every one of them rounds up to the next frame.
    expect(ENTRANCES_SRC).toContain('OVERRIDE_BEAT_RESERVE_MS = 40');
    // ...and it runs at the send-out amplitude the shape rows use.
    expect(branch).toContain('makeKit(run, overrideMs, amp, cry)');
  });

  it('reports which renderer ran, so the e2e can prove the override fired', () => {
    expect(ENTRANCES_SRC).toContain('export const entranceTelemetry');
    expect(ENTRANCES_SRC).toContain('lastRenderer');
    expect(ENTRANCES_SRC).toContain('overrideRuns');
    // Hung off playEntrance itself: BattleScene already publishes that function
    // on window.__claudemon, so the runner needs no scene change to read it.
    expect(ENTRANCES_SRC).toContain('(playEntrance as unknown as { telemetry: EntranceTelemetry }).telemetry');
    const play = ENTRANCES_SRC.split('export async function playEntrance')[1] ?? '';
    expect(play).toContain('entranceTelemetry.lastRenderer = override ? spec.overrideId!');
    expect(play).toContain('entranceTelemetry.overrideRuns++');
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
    expect(voluntary).toContain('this.executeMove(false, aiMoveIndex)');
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

describe('the catch sequence (E5)', () => {
  const useBall = BATTLE_SCENE_SRC.split('private async useBall(')[1].split('\n  private usePotion')[0];
  const seq = ENTRANCES_SRC.split('export async function catchSequence')[1] ?? '';

  it('is what useBall plays, between "used BALL!" and the outcome text', () => {
    const used = useBall.indexOf('used\\n${ballName}!');
    const call = useBall.indexOf('await catchSequence(this, {');
    const gotcha = useBall.indexOf('Gotcha! ${oppName}');
    const free = useBall.indexOf('Oh no! The POKeMON');
    expect(used).toBeGreaterThan(-1);
    expect(call).toBeGreaterThan(used);
    expect(call).toBeLessThan(gotcha);
    expect(call).toBeLessThan(free);
    // ...and the roll still happens before it: the animation PLAYS a result,
    // it does not decide one.
    expect(useBall.indexOf('attemptCatch(this.opponentPokemon, ballType)')).toBeLessThan(call);
  });

  it('throws from the player side, in the wild mon\'s palette, at its sprite', () => {
    expect(useBall).toContain('sprite: this.opponentSprite');
    expect(useBall).toContain('palette: this.catchPalette()');
    expect(useBall).toContain("from: this.ballOrigin('player')");
    const palette = BATTLE_SCENE_SRC.split('private catchPalette()')[1].split('\n  }')[0];
    expect(palette).toContain('POKEMON_DATA[this.opponentPokemon.speciesId]?.types[0]');
  });

  it('no longer wobbles the Pokemon\'s own sprite, and no longer shrinks it', () => {
    // Today's useBall tweened `opponentSprite.angle` once per shake and then
    // tweened it to alpha 0 / scale 0 on a catch. The ball is what moves now;
    // the mon is pulled into it by `dematerialise`.
    expect(useBall).not.toContain('angle: 10');
    expect(useBall).not.toContain('targets: this.opponentSprite');
    expect(useBall).not.toContain('this.delay(500)');
    expect(useBall).not.toContain('soundSystem.catchShake()');
    expect(useBall).not.toContain('soundSystem.catchSuccess()');
  });

  it('keeps everything else about useBall: the item, the misses, the free move', () => {
    expect(useBall).toContain('No balls left!');
    expect(useBall).toContain('this.playerState.useItem(ballType)');
    expect(useBall).toContain('this.playerState.addToParty(this.opponentPokemon)');
    expect(useBall).toContain('was sent\\nto the PC!');
    expect(useBall).toContain("this.finishForcedEncounter('caught')");
    // The break-out still hands the AI a free swing, after the text.
    expect(useBall.indexOf('Oh no! The POKeMON'))
      .toBeLessThan(useBall.indexOf('this.executeMove(false, aiMoveIndex)'));
  });

  it('leaves the trainer short-circuit alone', () => {
    const bag = BATTLE_SCENE_SRC.split('private handleBagSelection(')[1].split('\n  private ')[0];
    const shortCircuit = bag.split('The TRAINER blocked')[1].split('return;')[0];
    // Still the same two lines, the same free AI swing, and no ball animation:
    // nothing is thrown, so there is nothing to animate.
    expect(bag).toContain('The TRAINER blocked\\nthe BALL!');
    expect(bag).toContain("Don't be a thief!");
    expect(shortCircuit).toContain('this.executeMove(false, aiMoveIndex)');
    expect(shortCircuit).not.toContain('catchSequence');
    expect(shortCircuit).not.toContain('useBall');
  });

  it('is the only ball path: every attemptCatch caller goes through it', () => {
    const callers = [...BATTLE_SCENE_SRC.matchAll(/attemptCatch\(/g)];
    expect(callers).toHaveLength(1);
    expect([...BATTLE_SCENE_SRC.matchAll(/catchSequence\(/g)]).toHaveLength(1);
  });

  it('plays throw -> capture -> drop -> shakes -> outcome, in that order', () => {
    const order = ['await ballThrow(', 'await dematerialise(', 'soundSystem.ballDrop()',
      'CATCH_DROP_MS', 'soundSystem.catchShake()', 'CATCH_ROCK_MS', 'CATCH_STILL_MS'];
    let at = -1;
    for (const needle of order) {
      const i = seq.indexOf(needle);
      expect(needle && i).toBeGreaterThan(at);
      at = i;
    }
    // The drop is a thud, not a shake: playing catchShake there would make a
    // zero-shake break-out sound like a one-shake one.
    expect(seq.indexOf('soundSystem.ballDrop()')).toBeLessThan(seq.indexOf('soundSystem.catchShake()'));
    expect(typeof soundSystem.ballDrop).toBe('function');
  });

  it('renders BOTH outcomes', () => {
    // Caught: the success SFX, the button flashing twice, four sparkles, and a
    // ball that is still there when the promise resolves.
    expect(seq).toContain('soundSystem.catchSuccess()');
    expect(seq).toContain('spriteFlash(ball as unknown as Phaser.GameObjects.Sprite, scene, 0xFFFFFF, 2)');
    expect(seq).toContain('sparkle(scene, homeX, groundY, 0xFFFFFF, 4, CATCH_CAUGHT_MS)');
    // Broke free: the ball bursts open, is destroyed, and the mon comes back.
    expect(seq).toContain('void impactBurst(scene, homeX, groundY, 0xFFFFFF');
    expect(seq).toContain('await materialise(scene, sprite, ctx.palette, CATCH_BREAK_MS - CATCH_OPEN_MS, run)');
  });

  it('rocks the BALL, by 20 degrees, once per shake', () => {
    expect(ENTRANCES_SRC).toContain('export const CATCH_ROCK_ANGLE = 20');
    expect(seq).toContain('for (let i = 0; i < Math.max(0, Math.min(3, result.shakes)); i++)');
    expect(seq).toContain('ball.setAngle(Math.round(Math.sin(t * Math.PI * 2) * -CATCH_ROCK_ANGLE))');
  });

  it('drops the ball to the mon\'s ground line, on integer pixels, with a bounce', () => {
    expect(seq).toContain('Phaser.Math.Easing.Bounce.Out(t)');
    expect(seq).toContain('ball.setPosition(homeX, Math.round(homeY + (groundY - homeY) * e))');
    expect(seq).toContain('const groundY = Math.round(homeY + sprite.displayHeight / 2)');
  });

  it('reverses materialise to pull the mon in, and restores nothing itself', () => {
    const demat = ENTRANCES_SRC.split('export async function dematerialise')[1].split('\n}')[0];
    // Pale silhouette first (a ghost fading IN, the mirror of crossFade), then
    // the collapse toward the ball, ending invisible.
    expect(demat).toContain('ghost.setTintFill(pale)');
    expect(demat).toContain('ghost.setAlpha(0)');
    expect(demat).toContain('targets: ghost, alpha: 1');
    expect(demat).toContain('sprite.setTintFill(pale)');
    expect(demat).toContain('sprite.setScale(sx * (1 - e), sy * (1 - e))');
    expect(demat).toContain('sprite.setAlpha(0)');
    expect(demat).not.toContain('restore(');
  });

  it('holds the same restore/cleanup/cap contract, with the alpha decided by the outcome', () => {
    expect(seq).toContain('const state = snapshot(sprite)');
    expect(seq).toContain('} finally {');
    const fin = seq.split('} finally {')[1];
    expect(fin).toContain('killTweensOf(sprite)');
    expect(fin).toContain('obj.destroy()');
    expect(fin).toContain('restore(state)');
    // An entrance always ends visible. A catch is the one animation that can
    // legitimately end with the mon gone.
    expect(fin).toContain('sprite.setAlpha(result.caught ? 0 : 1)');
    expect(fin).toContain('if (!result.caught) killBall()');
    expect(seq).toContain('delay(scene, plan.cap).then(() => { run.aborted = true; })');
  });

  it('races the 2500 + 700 x shakes cap the spec module owns', () => {
    expect(seq).toContain('const plan = catchTimeline(result.shakes, result.caught)');
    expect(MAX_CATCH_BASE_MS).toBe(2500);
    expect(MAX_CATCH_PER_SHAKE_MS).toBe(700);
    for (const shakes of [0, 1, 2, 3]) {
      const t = catchTimeline(shakes, shakes === 3);
      expect(t.cap).toBe(2500 + 700 * shakes);
      expect(t.total).toBeLessThanOrEqual(t.budget);
    }
  });

  it('hands the scene a handle so the ball outlives "Gotcha!" and no longer', () => {
    expect(seq).toContain('return { done: killBall }');
    // Caught: destroyed AFTER the text. Broke free: destroyed before it, by
    // the burst, and `done()` is the idempotent belt-and-braces call.
    expect(useBall.indexOf('Gotcha! ${oppName}')).toBeLessThan(useBall.indexOf('catchAnim.done();'));
    const broke = useBall.split('} else {')[1];
    expect(broke.indexOf('catchAnim.done();')).toBeLessThan(broke.indexOf('Oh no! The POKeMON'));
  });
});
