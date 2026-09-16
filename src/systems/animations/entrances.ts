import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../../utils/constants';
import { PokemonType } from '../../types/pokemon.types';
import { TYPE_VOCAB } from '../../logic/moveAnimationSpec';
import {
  EntranceSpec, EntranceShape, Flourish, MAX_WILD_MS, MAX_SENDOUT_MS,
} from '../../logic/entranceSpec';
import {
  afterimage, animateFrames, delay, directionalParticles, fallingBlocks,
  groundHeave, impactBurst, lunge, ring, screenFlash, screenShake, sparkle,
  spriteFlash, tweenPromise, warpArcs,
} from '../MoveAnimations';
import { soundSystem } from '../SoundSystem';
import { CatchResult } from '../CatchSystem';
import {
  CATCH_BREAK_MS, CATCH_CAUGHT_MS, CATCH_DROP_MS, CATCH_OPEN_MS, CATCH_PULL_MS,
  CATCH_ROCK_MS, CATCH_STILL_MS, CATCH_THROW_MS, catchTimeline,
} from '../../logic/catchSequenceSpec';

/**
 * Battle entrances: how a Pokemon arrives on the field.
 *
 * The shape of this module deliberately mirrors `MoveAnimations.renderSpec`:
 * a Phaser-free resolver (`logic/entranceSpec.ts`) decides WHAT an entrance is,
 * and this file is the only place that knows how to draw one. Everything it
 * draws is built from the primitives `MoveAnimations` already exports, so the
 * entrances share the move vocabulary's look (colours, particle shapes, the
 * DIG mask, the TRANSFORM silhouette) instead of inventing a second one.
 *
 * Three contracts hold for every entrance:
 *
 *  1. RESTORE. The sprite's geometry is snapshotted up front and put back on
 *     completion AND on a throw: position, scale, angle, tint and mask. Alpha
 *     is the one exception - an entrance is a TRANSITION, not an overlay, so
 *     it always ends with the sprite visible (alpha 1), which is the canonical
 *     resting value for a Pokemon that has just arrived.
 *  2. CLEANUP. Every graphics/image this module creates is tracked and
 *     destroyed, and every tween on the sprite is killed, so the display list
 *     and the sprite's tween count come back to where they started.
 *  3. CAP. The whole thing races `MAX_WILD_MS` / `MAX_SENDOUT_MS`; if a
 *     renderer overruns we abort, restore, and let the battle carry on - the
 *     same bargain `OVERRIDE_DURATION` strikes for move overrides.
 */

/** Extra wiring the scene passes in; everything here is optional. */
export interface EntranceContext {
  /**
   * Fired once the mon is recognisably itself (the end of materialise). The
   * scene plays the cry here, so the cry lands on the reveal rather than on
   * the scene's first frame as it used to.
   */
  onMaterialise?: () => void;
  /** Which side is arriving. Chooses the side a slide/swoop comes in from. */
  side?: 'player' | 'opponent';
  /**
   * Where a send-out's ball is thrown FROM, in game pixels. The scene passes
   * the trainer sprite's live position (it is mid-slide-out, so the ball
   * leaves the hand rather than a spot the trainer has already left); a
   * switch-in with no trainer on screen leaves this unset and the renderer
   * falls back to the screen edge on that side.
   */
  from?: { x: number; y: number };
}

/**
 * Everything a tier-3 entrance override (`animations/entranceOverrides.ts`) is
 * allowed to touch.
 *
 * An override replaces a shape row's arrival AND its flourish, so it needs the
 * same tools the rows use - but it must not be able to break the three
 * contracts above. The kit is how: every drawing it can do is either a
 * `MoveAnimations` primitive (which cleans up after itself) or a method here
 * that registers its objects with the run's junk list, and `aborted` tells a
 * frame loop when the cap has fired. An override file therefore never names a
 * Phaser scene API of its own, which a contract test pins.
 */
export interface EntranceKit {
  /** For the `MoveAnimations` primitives, which all take the scene first. */
  readonly scene: Phaser.Scene;
  readonly sprite: Phaser.GameObjects.Sprite;
  readonly spec: EntranceSpec;
  readonly ctx: EntranceContext;
  /** Where the mon has to end up (integers). */
  readonly homeX: number;
  readonly homeY: number;
  /** The primary type's palette, already resolved out of `TYPE_VOCAB`. */
  readonly color: number;
  readonly accent: number;
  /** The silhouette wash: the type colour blended most of the way to white. */
  readonly pale: number;
  /** The whole window the override may spend, arrival AND flourish. */
  readonly ms: number;
  /** 1 for a wild arrival, 0.6 out of a ball: travel and flourish amplitude. */
  readonly amp: number;
  /** True once the cap has fired. Stop drawing: the restore is on its way. */
  readonly aborted: boolean;
  /** `animateFrames` that goes quiet on abort instead of fighting `restore`. */
  frames(ms: number, onFrame: (t: number) => void): Promise<void>;
  /** `tweenPromise` on this scene. */
  tween(config: Phaser.Types.Tweens.TweenBuilderConfig): Promise<void>;
  /** A rectangular reveal window over the sprite (the DIG mask idiom). */
  wipe(): Wipe;
  /** A black sheet over the field that holds and fades (MEWTWO, design 5). */
  dim(alpha: number, ms: number): Promise<void>;
  /** Put the sprite into its flat pre-reveal silhouette, without moving it. */
  silhouette(tint?: number): void;
  /** Silhouette pops 0 -> 1 `Back.easeOut`, then cross-fades to real colours. */
  materialise(ms: number, tint?: number): Promise<void>;
  /** Just the cross-fade, for a row that formed its silhouette its own way. */
  crossFade(ms: number, tint?: number): Promise<void>;
  /** One of the seven shape flourishes, at this run's amplitude. */
  flourish(name: Flourish, ms: number, amp?: number): Promise<void>;
  /** Fire the cry. Idempotent: the end of materialise is where it belongs. */
  cry(): void;
}

/** A tier-3 per-species entrance, keyed by `EntranceSpec.overrideId`. */
export type EntranceOverrideFn = (kit: EntranceKit) => Promise<void>;

const entranceOverrides = new Map<string, EntranceOverrideFn>();

/**
 * Register a hand-authored entrance for one species, mirroring
 * `registerSpecOverride`. `playEntrance` consults this registry: a spec with an
 * `overrideId` that has a renderer plays it instead of the shape row, and an
 * id with no renderer falls through to the row rather than throwing.
 */
export function registerEntranceOverride(id: string, fn: EntranceOverrideFn): void {
  entranceOverrides.set(id, fn);
}

/**
 * DEV telemetry: which renderer the last entrance went through and how many
 * entrances have gone through a tier-3 override.
 *
 * It is published on `playEntrance` itself (bottom of this file) so it rides
 * along on the scene's `game.entrances` DEV hook and the e2e runner can assert
 * OVERRIDE-USED without the scene having to know this exists.
 */
export interface EntranceTelemetry {
  /** An override id, or `shape:<row>` when the generic row drew the arrival. */
  lastRenderer: string | null;
  overrideRuns: number;
}

export const entranceTelemetry: EntranceTelemetry = { lastRenderer: null, overrideRuns: 0 };

/** The override registered for `id`, or undefined. For E4 and for tests. */
export function entranceOverride(id: string): EntranceOverrideFn | undefined {
  return entranceOverrides.get(id);
}

// ---------------------------------------------------------------------------
// Snapshot / restore
// ---------------------------------------------------------------------------

interface EntranceState {
  sprite: Phaser.GameObjects.Sprite;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  angle: number;
  tinted: boolean;
  tint: number;
  tintFill: boolean;
  mask: Phaser.Display.Masks.BitmapMask | Phaser.Display.Masks.GeometryMask | null;
}

function snapshot(sprite: Phaser.GameObjects.Sprite): EntranceState {
  return {
    sprite,
    x: sprite.x,
    y: sprite.y,
    scaleX: sprite.scaleX,
    scaleY: sprite.scaleY,
    angle: sprite.angle,
    tinted: sprite.isTinted,
    tint: sprite.tintTopLeft,
    tintFill: sprite.tintFill,
    mask: sprite.mask ?? null,
  };
}

function restore(state: EntranceState): void {
  const s = state.sprite;
  s.setPosition(state.x, state.y);
  s.setScale(state.scaleX, state.scaleY);
  s.setAngle(state.angle);
  if (state.tinted) {
    s.setTint(state.tint);
    s.tintFill = state.tintFill;
  } else {
    s.clearTint();
  }
  if (state.mask) s.setMask(state.mask);
  else s.clearMask(false);
  // The one value we do NOT put back: an entrance ends with the mon on screen.
  s.setAlpha(1);
}

// ---------------------------------------------------------------------------
// Run bookkeeping
// ---------------------------------------------------------------------------

interface Run {
  scene: Phaser.Scene;
  sprite: Phaser.GameObjects.Sprite;
  spec: EntranceSpec;
  ctx: EntranceContext;
  /** Everything we put on the display list, destroyed in the finally. */
  junk: Phaser.GameObjects.GameObject[];
  /** Masks we created, destroyed in the finally. */
  masks: Phaser.Display.Masks.GeometryMask[];
  /** Set when the cap fires: frame loops go quiet instead of fighting restore. */
  aborted: boolean;
  /** Home position, so a renderer can fly the sprite in from somewhere else. */
  homeX: number;
  homeY: number;
  color: number;
  accent: number;
  /** Pale wash used for the silhouette. */
  pale: number;
}

function track<T extends Phaser.GameObjects.GameObject>(run: Run, obj: T): T {
  run.junk.push(obj);
  return obj;
}

/** `animateFrames` that stops writing to the scene once the cap has fired. */
function frames(run: Run, ms: number, onFrame: (t: number) => void): Promise<void> {
  return animateFrames(run.scene, Math.max(1, Math.round(ms)), t => {
    if (run.aborted) return;
    onFrame(t);
  });
}

/** Blend a type colour most of the way to white: the silhouette wash. */
export function paleOf(color: number): number {
  const mix = (c: number): number => Math.min(255, Math.round(c + (255 - c) * 0.6));
  const r = mix((color >> 16) & 0xFF);
  const g = mix((color >> 8) & 0xFF);
  const b = mix(color & 0xFF);
  return (r << 16) | (g << 8) | b;
}

/**
 * A rectangular reveal window over the sprite.
 *
 * `renderDig` masks the attacker to the ground line with a geometry mask; the
 * wipes here are the same trick with a moving rectangle. Unlike
 * `defenderCutout` there is no WebGL bitmap path, and there is nothing to
 * gain from one: a bitmap mask exists to use a SPRITE's own alpha as the
 * shape, whereas a wipe is a rectangle by definition and a geometry mask draws
 * a rectangle identically on both renderers (which is why DIG uses one).
 */
export interface Wipe {
  to(x: number, y: number, w: number, h: number): void;
}

function makeWipe(run: Run): Wipe {
  const shape = run.scene.make.graphics({ x: 0, y: 0 }, false);
  const mask = shape.createGeometryMask();
  run.junk.push(shape);
  run.masks.push(mask);
  run.sprite.setMask(mask);
  return {
    to(x, y, w, h) {
      shape.clear();
      shape.fillStyle(0xFFFFFF, 1);
      shape.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    },
  };
}

/**
 * MEWTWO's "the screen dims 20 %" (design section 5).
 *
 * Depth 899 is the one number that matters: it is UNDER the text box (1000)
 * and under the ball's white `screenFlash` (900), so the sheet can cover the
 * whole 160x144 field and still never darken a line of text the player is
 * reading. It holds at full opacity for most of its life and fades out over
 * the rest, so the dim reads as an event rather than a slow bruise.
 */
export const DIM_DEPTH = 899;

function dimField(run: Run, alpha: number, ms: number): Promise<void> {
  const g = run.scene.add.graphics();
  g.setDepth(DIM_DEPTH);
  g.setScrollFactor(0);
  g.fillStyle(0x000000, alpha);
  g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  track(run, g);
  // Ramp in / hold / ramp out, driven by frames rather than a tween: a sheet
  // that is already at full opacity on frame one darkens the home box before
  // the mon has drawn anything, which is the runner's INVISIBLE-AT-T0 reading
  // a dimmer as an arrival. 20 % black over the field is above the sampler's
  // per-channel threshold on its own.
  g.setAlpha(0);
  const total = Math.max(2, Math.round(ms));
  return frames(run, total, t => {
    g.setAlpha(t < 0.25 ? t / 0.25 : t > 0.6 ? Math.max(0, 1 - (t - 0.6) / 0.4) : 1);
  }).then(() => { g.destroy(); });
}

// ---------------------------------------------------------------------------
// materialise
// ---------------------------------------------------------------------------

/**
 * The reveal every arrival shares: a flat pale silhouette (`setTintFill`, the
 * trick `renderTransform` uses at `overrides.ts:2821`) pops from scale 0 to
 * full with `Back.easeOut`, then cross-fades to the mon's real colours.
 *
 * The cross-fade needs two images because `setTintFill` is all-or-nothing: the
 * sprite drops its tint and a tinted copy of it fades out on top.
 */
export async function materialise(
  scene: Phaser.Scene,
  sprite: Phaser.GameObjects.Sprite,
  palette: PokemonType,
  ms: number,
  run?: Run,
  tint?: number,
): Promise<void> {
  const vocab = TYPE_VOCAB[palette] ?? TYPE_VOCAB[PokemonType.NORMAL];
  // GENGAR forms out of a DARK silhouette rather than a pale one, so the wash
  // is a parameter rather than always `paleOf(type)` (design section 5).
  const pale = tint ?? paleOf(vocab.color);
  const pop = Math.round(ms * 0.62);
  const fade = Math.max(1, ms - pop);
  const sx = run ? 1 : sprite.scaleX;
  const sy = run ? 1 : sprite.scaleY;

  sprite.setAlpha(1);
  sprite.setTintFill(pale);
  sprite.setScale(0, 0);
  await tweenPromise(scene, {
    targets: sprite, scaleX: sx, scaleY: sy,
    duration: Math.max(1, pop), ease: 'Back.easeOut',
  });
  await crossFade(scene, sprite, pale, fade, run);
}

/** Drop the silhouette: a tinted copy of the sprite fades off the real one. */
function crossFade(
  scene: Phaser.Scene,
  sprite: Phaser.GameObjects.Sprite,
  pale: number,
  ms: number,
  run?: Run,
): Promise<void> {
  const ghost = scene.add.image(sprite.x, sprite.y, sprite.texture.key, sprite.frame.name);
  ghost.setDepth(sprite.depth + 1);
  ghost.setScrollFactor(0);
  ghost.setScale(sprite.scaleX, sprite.scaleY);
  ghost.setAngle(sprite.angle);
  ghost.setTintFill(pale);
  if (sprite.mask) ghost.setMask(sprite.mask);
  if (run) run.junk.push(ghost);
  sprite.clearTint();
  sprite.setAlpha(1);
  return tweenPromise(scene, {
    targets: ghost, alpha: 0,
    duration: Math.max(1, Math.round(ms)), ease: 'Linear',
  }).then(() => { ghost.destroy(); });
}

// ---------------------------------------------------------------------------
// The ball throw (design section 3.1, the send-out vehicle)
// ---------------------------------------------------------------------------

/** The 8x8 ball BootScene bakes for the Pokemon Centre; no new art needed. */
export const BALL_TEXTURE = 'pokeball_icon';
/** Just above the battle sprites (depth 5) and far below the text box. */
export const BALL_DEPTH = 6;
/** Design section 3.1's throw length; shortened when the budget is tighter. */
export const BALL_ARC_MS = 350;
/** The white pop as the ball opens. Short: it is a punctuation mark. */
export const BALL_OPEN_MS = 60;

/**
 * Arc a Pokeball from `from` to `to` and open it.
 *
 * The arc is the Pokemon Centre's idiom (`OverworldScene.ts:2560-2570`): a
 * linear interpolation with `sin(t * PI)` lifted out of it, driven by
 * `animateFrames` so every position is an integer on the 160x144 grid. The
 * ball spins exactly once on the way over, which is what sells it as thrown
 * rather than slid.
 *
 * The open is `impactBurst` in the arriving mon's type colour (unawaited: it
 * keeps burning while the mon materialises inside it) plus a 60 ms white
 * `screenFlash` at depth 900 - over the HP boxes, under the text box.
 *
 * The ball image is destroyed here; when a `run` is passed it is also tracked,
 * so an abort mid-flight cannot leave one on the field.
 */
export async function ballThrow(
  scene: Phaser.Scene,
  from: { x: number; y: number },
  to: { x: number; y: number },
  palette: PokemonType,
  ms: number = BALL_ARC_MS,
  run?: Run,
): Promise<void> {
  const vocab = TYPE_VOCAB[palette] ?? TYPE_VOCAB[PokemonType.NORMAL];
  const x0 = Math.round(from.x);
  const y0 = Math.round(from.y);
  const x1 = Math.round(to.x);
  const y1 = Math.round(to.y);

  // A throw across the field lifts higher than a lob from the screen edge,
  // but never so high that the ball leaves the 144 px field.
  const lift = Math.min(26, 10 + Math.round(Math.abs(x1 - x0) * 0.12));
  const ball = scene.textures.exists(BALL_TEXTURE)
    ? scene.add.image(x0, y0, BALL_TEXTURE)
    : null;
  if (ball) {
    ball.setDepth(BALL_DEPTH);
    ball.setScrollFactor(0);
    if (run) run.junk.push(ball);
  }

  await animateFrames(scene, Math.max(1, Math.round(ms)), t => {
    if (!ball || !ball.active || run?.aborted) return;
    ball.setPosition(
      Math.round(x0 + (x1 - x0) * t),
      Math.round(y0 + (y1 - y0) * t - Math.sin(t * Math.PI) * lift),
    );
    ball.setAngle(Math.round(t * 360));
  });
  // Destroying it here (as well as in the run's finally) is what BALL-SEEN
  // measures: a ball on the field DURING the throw and none at the end.
  ball?.destroy();
  if (run?.aborted) return;

  void impactBurst(scene, x1, y1, vocab.color, vocab.accentColor, 14, 180);
  await screenFlash(scene, 0xFFFFFF, BALL_OPEN_MS);
}

/**
 * Where the ball comes from when the scene did not say: the screen edge on the
 * arriving side, level with the sprite. That is the switch-in case - the
 * trainer sprites left the field during the intro.
 */
function defaultBallOrigin(run: Run): { x: number; y: number } {
  return {
    x: run.ctx.side === 'player' ? -8 : GAME_WIDTH + 8,
    y: run.homeY,
  };
}

/**
 * The send-out arrival: ball throw, open, materialise. Every species uses it -
 * the shape row only chooses the flourish, because a mon coming out of a ball
 * is coming out of a ball whatever shape it is (design section 3.1).
 */
const arriveSendOut: ArrivalFn = async (run, ms) => {
  const { scene, sprite } = run;
  const throwMs = Math.min(BALL_ARC_MS, Math.round(ms * 0.45));
  const revealMs = Math.max(120, ms - throwMs - BALL_OPEN_MS);

  // Nothing of the mon is on screen while the ball is in the air.
  sprite.setPosition(run.homeX, run.homeY);
  sprite.setScale(1, 1);
  sprite.setAlpha(0);

  await ballThrow(
    scene,
    run.ctx.from ?? defaultBallOrigin(run),
    { x: run.homeX, y: run.homeY },
    run.spec.palette,
    throwMs,
    run,
  );
  if (run.aborted) return;
  if (run.spec.mass) void screenShake(scene, 2, 120);
  await materialise(scene, sprite, run.spec.palette, revealMs, run);
};

// ---------------------------------------------------------------------------
// The seven shape rows (design section 4)
// ---------------------------------------------------------------------------

type ArrivalFn = (run: Run, ms: number) => Promise<void>;

/** Round: drops in from above, bounces twice with a squash, ring on landing. */
const arriveRound: ArrivalFn = async (run, ms) => {
  const { scene, sprite } = run;
  const drop = Math.round(ms * 0.7);
  const land = Math.max(1, ms - drop);
  sprite.setPosition(run.homeX, run.homeY - 34);
  await Promise.all([
    materialise(scene, sprite, run.spec.palette, drop, run),
    tweenPromise(scene, {
      targets: sprite, y: run.homeY,
      duration: drop, ease: 'Bounce.easeOut',
    }),
  ]);
  if (run.aborted) return;
  if (run.spec.mass) void screenShake(scene, 2, 120);
  await Promise.all([
    ring(scene, run.homeX, run.homeY + 14, run.color, 20, land, 1),
    frames(run, land, t => {
      // Two squashes, integer-safe: scaleY 1 -> 0.8 -> 1 -> 0.9 -> 1.
      const squash = Math.abs(Math.sin(t * Math.PI * 2));
      sprite.setScale(1 + squash * 0.12, 1 - squash * 0.2 * (1 - t * 0.5));
    }),
  ]);
  sprite.setScale(1, 1);
};

/** Angular: rises out of the ground behind a bottom-up wipe, throwing rock. */
const arriveAngular: ArrivalFn = async (run, ms) => {
  const { scene, sprite } = run;
  const rise = Math.round(ms * 0.62);
  const fade = Math.max(1, ms - rise);
  const half = Math.round(sprite.displayHeight / 2) + 1;
  const top = run.homeY - half;
  const foot = run.homeY + half;

  const wipe = makeWipe(run);
  wipe.to(0, foot, GAME_WIDTH, 0);
  sprite.setAlpha(1);
  sprite.setTintFill(run.pale);
  sprite.setPosition(run.homeX, run.homeY);

  await Promise.all([
    frames(run, rise, t => {
      const h = Math.round((foot - top) * t);
      wipe.to(0, foot - h, GAME_WIDTH, h);
    }),
    groundHeave(scene, run.color, run.accent, 1, rise),
    fallingBlocks(scene, run.homeX, foot, run.color, run.accent, 4, rise),
  ]);
  if (run.aborted) return;
  wipe.to(0, 0, GAME_WIDTH, 144);
  if (run.spec.mass) void screenShake(scene, 2, 120);
  await crossFade(scene, sprite, run.pale, fade, run);
};

/** Tall: assembles on the spot, afterimages snapping into place. */
const arriveTall: ArrivalFn = async (run, ms) => {
  const { scene, sprite } = run;
  const pop = Math.round(ms * 0.32);
  const flick = Math.round(ms * 0.24);
  const fade = Math.max(1, ms - pop - flick);
  sprite.setPosition(run.homeX, run.homeY);
  sprite.setAlpha(1);
  sprite.setTintFill(run.pale);
  sprite.setScale(0, 0);

  // The silhouette forms FIRST, on its own. `afterimage` clones the sprite's
  // texture at its natural size and does not inherit the sprite's scale, so
  // starting it during the scale-up would put two full-size ghosts on screen
  // before the mon itself had arrived - which is exactly what the runner's
  // INVISIBLE-AT-T0 check caught.
  const forming: Array<Promise<void>> = [
    tweenPromise(scene, {
      targets: sprite, scaleX: 1, scaleY: 1,
      duration: Math.max(1, pop), ease: 'Back.easeOut',
    }),
  ];
  if (run.spec.palette === PokemonType.PSYCHIC) {
    forming.push(warpArcs(scene, run.homeX, run.homeY, run.color, run.accent, pop + flick));
  }
  await Promise.all(forming);
  if (run.aborted) return;

  // Now it is full size: two afterimages flick it onto the spot.
  await Promise.all([
    afterimage(scene, sprite, run.color, 2, flick),
    frames(run, flick, t => {
      sprite.setX(run.homeX + Math.round(Math.sin(t * Math.PI * 2) * 3 * (1 - t)));
    }),
  ]);
  sprite.setPosition(run.homeX, run.homeY);
  if (run.aborted) return;
  if (run.spec.mass) void screenShake(scene, 2, 120);
  await crossFade(scene, sprite, run.pale, fade, run);
};

/** Wide: a slow fade-in under drifting type motes. Big things take their time. */
const arriveWide: ArrivalFn = async (run, ms) => {
  const { scene, sprite } = run;
  const fadeIn = Math.round(ms * 0.56);
  const fade = Math.max(1, ms - fadeIn);
  sprite.setPosition(run.homeX, run.homeY);
  sprite.setScale(1, 1);
  sprite.setAlpha(0);
  sprite.setTintFill(run.pale);

  // The motes drift for the WHOLE arrival but do not gate it: awaiting them
  // pushed the cross-fade past the phase they belong to and the whole row over
  // its budget (817 ms measured against a 700 ms plan).
  void directionalParticles(scene, run.homeX, run.homeY + 10, run.color, 6, {
    dirY: -1, spread: 16, duration: ms, gravity: -0.4,
    shape: vocabParticle(run), accentColor: run.accent,
  });
  await tweenPromise(scene, {
    targets: sprite, alpha: 1,
    duration: Math.max(1, fadeIn), ease: 'Linear',
  });
  if (run.aborted) return;
  if (run.spec.mass) void screenShake(scene, 2, 120);
  await crossFade(scene, sprite, run.pale, fade, run);
};

/** Bird: swoops in on an arc from the top corner, fluttering as it comes. */
const arriveBird: ArrivalFn = async (run, ms) => {
  const { scene, sprite } = run;
  const swoop = Math.round(ms * 0.73);
  const fade = Math.max(1, ms - swoop);
  // In from whichever corner is further away, so the arc crosses the field.
  const fromX = run.homeX < GAME_WIDTH / 2 ? GAME_WIDTH + 24 : -24;
  const fromY = Math.max(4, run.homeY - 28);
  sprite.setScale(1, 1);
  sprite.setAlpha(1);
  sprite.setTintFill(run.pale);
  sprite.setPosition(fromX, fromY);

  await frames(run, swoop, t => {
    const x = Math.round(fromX + (run.homeX - fromX) * t);
    // A shallow parabola: dips below the line mid-flight, then flares up.
    const y = Math.round(fromY + (run.homeY - fromY) * t + Math.sin(t * Math.PI) * 10);
    sprite.setPosition(x, y);
    // Three wing beats. The sprite's second frame is the BACK view, not a
    // wing-up pose, so a frame flip would turn the mon around mid-swoop: the
    // flutter is done with scaleY instead (deviation from design section 4).
    sprite.setScale(1, 1 - Math.abs(Math.sin(t * Math.PI * 3)) * 0.25);
  });
  if (run.aborted) return;
  sprite.setPosition(run.homeX, run.homeY);
  sprite.setScale(1, 1);
  if (run.spec.mass) void screenShake(scene, 2, 120);
  await crossFade(scene, sprite, run.pale, fade, run);
};

/** Snake: pours in from the side, wobbling, behind a side-to-side wipe. */
const arriveSnake: ArrivalFn = async (run, ms) => {
  const { scene, sprite } = run;
  const slide = Math.round(ms * 0.74);
  const fade = Math.max(1, ms - slide);
  const halfW = Math.round(sprite.displayWidth / 2) + 1;
  const dir = run.homeX < GAME_WIDTH / 2 ? -1 : 1;
  const fromX = run.homeX + dir * (halfW * 2 + 6);

  const wipe = makeWipe(run);
  sprite.setScale(1, 1);
  sprite.setAlpha(1);
  sprite.setTintFill(run.pale);
  sprite.setPosition(fromX, run.homeY);

  await frames(run, slide, t => {
    const x = Math.round(fromX + (run.homeX - fromX) * t);
    // Amplitude 3 px, two periods, dying out as it settles.
    const y = Math.round(run.homeY + Math.sin(t * Math.PI * 4) * 3 * (1 - t));
    sprite.setPosition(x, y);
    // The wipe edge retreats ahead of the leading side, so the body appears to
    // pour in from off-screen: at t=0 nothing of the home box is revealed, at
    // t=1 the whole sprite is. (The sign matters - the other way round the
    // mon slides INTO the mask and vanishes just before the cross-fade.)
    const edge = Math.round(run.homeX + dir * (halfW - halfW * 2 * t));
    if (dir < 0) wipe.to(0, 0, Math.max(0, edge), 144);
    else wipe.to(edge, 0, Math.max(0, GAME_WIDTH - edge), 144);
  });
  if (run.aborted) return;
  wipe.to(0, 0, GAME_WIDTH, 144);
  sprite.setPosition(run.homeX, run.homeY);
  if (run.spec.mass) void screenShake(scene, 2, 120);
  await crossFade(scene, sprite, run.pale, fade, run);
};

/** Bug: pops in, skitters sideways four times, then flashes its type colour. */
const arriveBug: ArrivalFn = async (run, ms) => {
  const { scene, sprite } = run;
  const pop = Math.round(ms * 0.3);
  const skitter = Math.round(ms * 0.47);
  const flash = Math.max(1, ms - pop - skitter);
  sprite.setPosition(run.homeX, run.homeY);
  sprite.setAlpha(1);
  sprite.setTintFill(run.pale);
  sprite.setScale(0, 0);
  await tweenPromise(scene, {
    targets: sprite, scaleX: 1, scaleY: 1,
    duration: Math.max(1, pop), ease: 'Back.easeOut',
  });
  if (run.aborted) return;
  await Promise.all([
    afterimage(scene, sprite, run.color, 2, skitter),
    frames(run, skitter, t => {
      // Four 3 px side-steps: a square wave, not a sine - it should read as
      // a jitter, not a sway.
      const step = Math.floor(t * 8) % 2 === 0 ? 3 : -3;
      sprite.setPosition(run.homeX + step, run.homeY);
    }),
  ]);
  if (run.aborted) return;
  sprite.setPosition(run.homeX, run.homeY);
  if (run.spec.mass) void screenShake(scene, 2, 120);
  await crossFade(scene, sprite, run.pale, Math.round(flash * 0.5), run);
  if (run.aborted) return;
  await spriteFlash(sprite, scene, run.color, 2);
};

/** One arrival per shape. The contract test asserts this map is total. */
export const ARRIVALS: Record<EntranceShape, ArrivalFn> = {
  round: arriveRound,
  angular: arriveAngular,
  tall: arriveTall,
  wide: arriveWide,
  bird: arriveBird,
  snake: arriveSnake,
  bug: arriveBug,
};

function vocabParticle(run: Run): 'dust' | 'leaf' | 'mote' {
  return particleFor(run.spec.palette);
}

export function particleFor(palette: PokemonType): 'dust' | 'leaf' | 'mote' {
  const p = TYPE_VOCAB[palette]?.particle;
  return p === 'leaf' ? 'leaf' : p === 'mote' ? 'mote' : 'dust';
}

// ---------------------------------------------------------------------------
// Flourishes (design section 4, right-hand column)
// ---------------------------------------------------------------------------

/**
 * `ms` is optional and defaults to the row's own length: a shape row always
 * plays its flourish at the design's length, while a tier-3 override borrowing
 * one has to fit it inside whatever is left of its own window.
 */
type FlourishFn = (run: Run, amp: number, ms?: number) => Promise<void>;

/** Flourish lengths in ms, all inside the design's 150-250 window. */
export const FLOURISH_MS: Record<EntranceSpec['flourish'], number> = {
  hop: 120, shake: 160, stance: 150, settle: 160, bob: 200, tilt: 180, twitch: 180,
};

const FLOURISHES: Record<EntranceSpec['flourish'], FlourishFn> = {
  hop: (run, amp, ms = FLOURISH_MS.hop) =>
    lunge(run.scene, run.sprite, run.homeX, run.homeY - 4 * amp, ms, 1),
  shake: (run, amp, ms = FLOURISH_MS.shake) => frames(run, ms, t => {
    run.sprite.setX(run.homeX + Math.round(Math.sin(t * Math.PI * 4) * 2 * amp));
  }).then(() => { run.sprite.setX(run.homeX); }),
  stance: (run, amp, ms = FLOURISH_MS.stance) => frames(run, ms, t => {
    run.sprite.setScale(1 + 0.1 * amp * (1 - t), 1);
  }).then(() => { run.sprite.setScale(1, 1); }),
  settle: (run, amp, ms = FLOURISH_MS.settle) => frames(run, ms, t => {
    run.sprite.setY(run.homeY + Math.round(Math.sin(t * Math.PI) * 2 * amp));
  }).then(() => { run.sprite.setY(run.homeY); }),
  bob: (run, amp, ms = FLOURISH_MS.bob) => frames(run, ms, t => {
    run.sprite.setY(run.homeY - Math.round(Math.abs(Math.sin(t * Math.PI * 2)) * 2 * amp));
  }).then(() => { run.sprite.setY(run.homeY); }),
  tilt: (run, amp, ms = FLOURISH_MS.tilt) => frames(run, ms, t => {
    run.sprite.setAngle(Math.sin(t * Math.PI * 2) * 6 * amp);
  }).then(() => { run.sprite.setAngle(0); }),
  twitch: (run, amp, ms = FLOURISH_MS.twitch) => frames(run, ms, t => {
    run.sprite.setAngle(Math.sin(t * Math.PI * 6) * 4 * amp);
  }).then(() => { run.sprite.setAngle(0); }),
};

/** Hand a running entrance to a tier-3 override, with nothing else attached. */
function makeKit(run: Run, ms: number, amp: number, cry: () => void): EntranceKit {
  return {
    scene: run.scene,
    sprite: run.sprite,
    spec: run.spec,
    ctx: run.ctx,
    homeX: run.homeX,
    homeY: run.homeY,
    color: run.color,
    accent: run.accent,
    pale: run.pale,
    ms,
    amp,
    get aborted(): boolean { return run.aborted; },
    frames: (d, onFrame) => frames(run, d, onFrame),
    tween: config => tweenPromise(run.scene, config),
    wipe: () => makeWipe(run),
    dim: (alpha, d) => dimField(run, alpha, d),
    silhouette: tint => {
      run.sprite.setAlpha(1);
      run.sprite.setTintFill(tint ?? run.pale);
    },
    materialise: (d, tint) =>
      materialise(run.scene, run.sprite, run.spec.palette, d, run, tint),
    crossFade: (d, tint) => crossFade(run.scene, run.sprite, tint ?? run.pale, d, run),
    flourish: (name, d, a) => FLOURISHES[name](run, a ?? amp, d),
    cry,
  };
}

// ---------------------------------------------------------------------------
// playEntrance
// ---------------------------------------------------------------------------

/** What the frame driver and the tween scheduler cost us on top of the plan. */
const QUANTISATION_MS = 90;

/**
 * A send-out pays the same rounding on two MORE awaited phases than a wild
 * arrival does (the arc and the ball's open), and its nominal 900 ms IS the
 * cap, so it reserves more. Without this the flourish is the thing the cap
 * race eats, every single time - the bug the E2 runner caught for ANGULAR.
 */
const SENDOUT_RESERVE_MS = 150;

/**
 * What a hand-authored send-out gives back on top of that.
 *
 * `SENDOUT_RESERVE_MS` was measured against the shape rows, which await three
 * phases (arc, open, arrival). A tier-3 renderer splits its window into up to
 * six beats and every one of them rounds up to the next 16 ms frame, so the
 * same reserve left the longest of them measuring ~920 ms against a 900 ms cap
 * - inside the runner's slack, but over the number the design promises.
 */
const OVERRIDE_BEAT_RESERVE_MS = 40;

/** Frame-rounding allowance for a kind, subtracted from its budget. */
export function reserveFor(spec: EntranceSpec): number {
  return spec.kind === 'sendout' ? SENDOUT_RESERVE_MS : QUANTISATION_MS;
}

/** Hard ceiling for a kind, from the spec module so logic and renderer agree. */
export function capFor(spec: EntranceSpec): number {
  return spec.kind === 'sendout' ? MAX_SENDOUT_MS : MAX_WILD_MS;
}

/**
 * Draw `spec` on `sprite` and resolve when the mon has finished arriving.
 *
 * Never rejects and never leaves the sprite in a half-animated state: whatever
 * happens inside, the finally puts the geometry back, kills the tweens and
 * clears the display list.
 */
export async function playEntrance(
  scene: Phaser.Scene,
  sprite: Phaser.GameObjects.Sprite,
  spec: EntranceSpec,
  ctx: EntranceContext = {},
): Promise<void> {
  const vocab = TYPE_VOCAB[spec.palette] ?? TYPE_VOCAB[PokemonType.NORMAL];
  const state = snapshot(sprite);
  const run: Run = {
    scene, sprite, spec, ctx,
    junk: [], masks: [], aborted: false,
    homeX: Math.round(sprite.x),
    homeY: Math.round(sprite.y),
    color: vocab.color,
    accent: vocab.accentColor,
    pale: paleOf(vocab.color),
  };

  const flourishMs = FLOURISH_MS[spec.flourish];
  // Every phase rounds up and every tween settles on the next 16 ms frame, so
  // a plan that spends the full nominal duration lands just OVER the cap and
  // the race below cuts the flourish off. The renderer budgets below the cap
  // and gives the difference back to the frame driver.
  const budget = Math.max(240, Math.min(spec.duration, capFor(spec)) - reserveFor(spec));
  const arrivalMs = Math.max(120, budget - flourishMs);
  const amp = spec.kind === 'sendout' ? 0.6 : 1;

  let cried = false;
  const cry = (): void => {
    if (cried) return;
    cried = true;
    ctx.onMaterialise?.();
  };

  // Tier 3 (design section 5): a hand-authored arrival for this species, which
  // replaces BOTH the shape row and its flourish. An `overrideId` with nothing
  // registered for it falls straight through to the row - the resolver names
  // the twelve keys, and an unfinished renderer must never be able to throw.
  const override = spec.overrideId ? entranceOverride(spec.overrideId) : undefined;
  entranceTelemetry.lastRenderer = override ? spec.overrideId! : `shape:${spec.shape}`;

  const body = (async () => {
    // Rarity reads as a shimmer over the whole reveal (catchRate <= 45). It is
    // a property of the SPECIES, not of the row, so an override gets it too.
    if (spec.rare) {
      void sparkle(scene, run.homeX, run.homeY, vocab.accentColor, 8, arrivalMs);
    }

    if (override) {
      entranceTelemetry.overrideRuns++;
      let overrideMs = budget;
      if (spec.kind === 'sendout') {
        // The ball is the VEHICLE (design section 3.1) and stays the renderer's
        // job for every species: the override owns what happens once it opens.
        const throwMs = Math.min(BALL_ARC_MS, Math.round(budget * 0.35));
        sprite.setPosition(run.homeX, run.homeY);
        sprite.setScale(1, 1);
        sprite.setAlpha(0);
        await ballThrow(
          scene,
          ctx.from ?? defaultBallOrigin(run),
          { x: run.homeX, y: run.homeY },
          spec.palette,
          throwMs,
          run,
        );
        overrideMs = Math.max(160, budget - throwMs - BALL_OPEN_MS - OVERRIDE_BEAT_RESERVE_MS);
      }
      if (run.aborted) return;
      // No generic mass shake here: a hand-authored arrival lands its own
      // weight (SNORLAX shakes harder than the row does, MEWTWO never lands).
      await override(makeKit(run, overrideMs, amp, cry));
      // Belt and braces - every override cries at its own materialise, and
      // `cry` is idempotent.
      cry();
      return;
    }

    // A send-out arrives out of a ball whatever its shape; the shape row is
    // the WILD vehicle (design section 3.1: two vehicles, one materialise).
    const arrival = spec.kind === 'sendout' ? arriveSendOut : ARRIVALS[spec.shape];
    await arrival(run, arrivalMs);
    if (run.aborted) return;
    // The mon is itself now: this is where the cry belongs.
    cry();
    if (run.aborted) return;
    await FLOURISHES[spec.flourish](run, amp);
  })();

  try {
    await Promise.race([
      body.catch(() => undefined),
      delay(scene, capFor(spec)).then(() => { run.aborted = true; }),
    ]);
  } finally {
    run.aborted = true;
    scene.tweens.killTweensOf(sprite);
    for (const obj of run.junk) {
      scene.tweens.killTweensOf(obj);
      obj.destroy();
    }
    run.junk.length = 0;
    // Drop the mask BEFORE destroying it, or the sprite keeps a dead reference.
    restore(state);
    for (const mask of run.masks) mask.destroy();
    run.masks.length = 0;
    // A mon that timed out mid-arrival is on screen anyway, so it still cries:
    // losing the animation is a glitch, losing the cry is a missing sound.
    cry();
  }
}

// The DEV hook the scene publishes is `{ playEntrance, resolveEntrance,
// replayIntro }`, so hanging the telemetry off the function itself is what
// puts it on `game.entrances` for the e2e runner without BattleScene.ts (owned
// by another PR right now) needing a line about it.
(playEntrance as unknown as { telemetry: EntranceTelemetry }).telemetry = entranceTelemetry;

// ---------------------------------------------------------------------------
// dematerialise: the E2 reveal, played backwards (E5)
// ---------------------------------------------------------------------------

/**
 * The mon is pulled into the ball: `materialise` in reverse.
 *
 * Forwards, a pale silhouette pops out of nothing and cross-fades to colour.
 * Backwards, the colours drain to the same pale `setTintFill` wash (150 ms, a
 * pale ghost fading IN over the sprite - the mirror of `crossFade`), and then
 * the silhouette shrinks to scale 0 toward `to`, which is where the ball is
 * (250 ms). The sprite is left at alpha 0: it is inside the ball now.
 *
 * Geometry is NOT restored here. The caller owns the snapshot/restore contract,
 * because on a catch the mon stays gone and on a break-out it comes back.
 */
export async function dematerialise(
  scene: Phaser.Scene,
  sprite: Phaser.GameObjects.Sprite,
  palette: PokemonType,
  ms: number,
  to: { x: number; y: number },
  run?: Run,
): Promise<void> {
  const vocab = TYPE_VOCAB[palette] ?? TYPE_VOCAB[PokemonType.NORMAL];
  const pale = paleOf(vocab.color);
  const drain = Math.round(ms * 0.38);
  const shrink = Math.max(1, ms - drain);

  // 1. Colour -> silhouette. Two images again, for the reason `crossFade`
  // documents: `setTintFill` is all-or-nothing, so the wash has to arrive as a
  // separate copy fading in on top of the real, still-coloured sprite.
  const ghost = scene.add.image(sprite.x, sprite.y, sprite.texture.key, sprite.frame.name);
  ghost.setDepth(sprite.depth + 1);
  ghost.setScrollFactor(0);
  ghost.setScale(sprite.scaleX, sprite.scaleY);
  ghost.setAngle(sprite.angle);
  ghost.setTintFill(pale);
  ghost.setAlpha(0);
  if (sprite.mask) ghost.setMask(sprite.mask);
  if (run) run.junk.push(ghost);
  await tweenPromise(scene, {
    targets: ghost, alpha: 1,
    duration: Math.max(1, drain), ease: 'Linear',
  });
  sprite.setTintFill(pale);
  ghost.destroy();
  if (run?.aborted) return;

  // 2. The silhouette collapses into the ball.
  const x0 = sprite.x;
  const y0 = sprite.y;
  const sx = sprite.scaleX;
  const sy = sprite.scaleY;
  await animateFrames(scene, Math.max(1, Math.round(shrink)), t => {
    if (run?.aborted) return;
    const e = Phaser.Math.Easing.Back.In(t);
    sprite.setPosition(
      Math.round(x0 + (to.x - x0) * e),
      Math.round(y0 + (to.y - y0) * e),
    );
    sprite.setScale(sx * (1 - e), sy * (1 - e));
  });
  sprite.setScale(0, 0);
  sprite.setAlpha(0);
}

// ---------------------------------------------------------------------------
// catchSequence (E5, design section 8's catch row)
// ---------------------------------------------------------------------------

/** What the scene tells the catch sequence about the mon being thrown at. */
export interface CatchContext {
  /** The wild Pokemon's sprite. Snapshotted and restored by the sequence. */
  sprite: Phaser.GameObjects.Sprite;
  /** The mon's primary type: the palette the ball opens in. */
  palette: PokemonType;
  /** Where the ball is thrown from, in game pixels (the player's side). */
  from: { x: number; y: number };
}

/**
 * The ball outlives `catchSequence` on a successful catch: it sits on the
 * ground under `Gotcha! X was caught!` and is destroyed once the text is gone.
 * `done()` is that destruction, and is safe to call more than once (and after a
 * break-out, where there is nothing left to destroy).
 */
export interface CatchHandle {
  done(): void;
}

/** Depth for the thrown ball once it is a prop rather than a projectile. */
export const CATCH_BALL_DEPTH = BALL_DEPTH;

/** How far the ball rocks, in degrees, on each shake. */
export const CATCH_ROCK_ANGLE = 20;

/**
 * Throw a ball at the wild Pokemon, suck it in, drop the ball, shake it, and
 * play the outcome `result` already rolled.
 *
 * The sequence is the Gen I one (helper repo design doc section 8):
 *
 *   1. `ballThrow` from the player's side - the same exported helper the
 *      send-out uses, so a throw is a throw whichever direction it goes; it
 *      ends on the white flash + type-coloured burst of the ball opening.
 *   2. `dematerialise`: the mon drains to a pale silhouette and collapses into
 *      the ball.
 *   3. The ball falls to the mon's ground line with one `Bounce.easeOut`
 *      bounce and a low thud. NOT `catchShake()` - that SFX belongs to a shake.
 *   4. One rock per shake the roll produced (`catchShake()`, angle -20/+20/0),
 *      each followed by a dead-still pause. These replace `useBall`'s old
 *      500 + 300 ms dead gaps and its wobble of the MON's own sprite.
 *   5. Caught: the button flashes twice, sparkles go up, and the ball STAYS
 *      (see `CatchHandle`). Broke free: the ball bursts open, is destroyed, and
 *      the mon `materialise`s back at its spot.
 *
 * Contracts, the same three `playEntrance` holds: the sprite's geometry is
 * snapshotted and restored whatever happens (alpha alone is decided by the
 * outcome - 0 caught, 1 free), everything drawn is destroyed, and the whole
 * thing races `catchTimeline().cap` = 2500 + 700 ms per shake.
 */
export async function catchSequence(
  scene: Phaser.Scene,
  ctx: CatchContext,
  result: CatchResult,
): Promise<CatchHandle> {
  const sprite = ctx.sprite;
  const plan = catchTimeline(result.shakes, result.caught);
  const vocab = TYPE_VOCAB[ctx.palette] ?? TYPE_VOCAB[PokemonType.NORMAL];
  const state = snapshot(sprite);
  const homeX = Math.round(sprite.x);
  const homeY = Math.round(sprite.y);
  // The ball lands at the mon's feet, not at its middle.
  const groundY = Math.round(homeY + sprite.displayHeight / 2);

  // `ballThrow` and `materialise` take a `Run` purely as a junk/abort ledger;
  // neither reads the spec, so this one is a placeholder that keeps the shared
  // helpers' signature honest without inventing a species.
  const spec: EntranceSpec = {
    speciesId: 0,
    shape: 'round',
    kind: 'wild',
    palette: ctx.palette,
    mass: false,
    rare: false,
    flourish: 'hop',
    duration: plan.budget,
  };
  const run: Run = {
    scene, sprite, spec, ctx: {}, junk: [], masks: [], aborted: false,
    homeX, homeY,
    color: vocab.color,
    accent: vocab.accentColor,
    pale: paleOf(vocab.color),
  };

  // The prop ball, tracked separately from `run.junk`: on a catch it has to
  // survive the finally and be destroyed by the handle instead.
  let ball: Phaser.GameObjects.Image | null = null;
  const killBall = (): void => {
    if (!ball) return;
    scene.tweens.killTweensOf(ball);
    if (ball.active) ball.destroy();
    ball = null;
  };

  const body = async (): Promise<void> => {
    // 1. THROW. Ends with the ball opening: white flash + type-coloured burst.
    await ballThrow(
      scene, ctx.from, { x: homeX, y: homeY }, ctx.palette, CATCH_THROW_MS, run,
    );
    if (run.aborted) return;

    // The open ball sits where the mon is while the mon is pulled into it.
    if (scene.textures.exists(BALL_TEXTURE)) {
      ball = scene.add.image(homeX, homeY, BALL_TEXTURE);
      ball.setDepth(CATCH_BALL_DEPTH);
      ball.setScrollFactor(0);
    }

    // 2. CAPTURE.
    await dematerialise(scene, sprite, ctx.palette, CATCH_PULL_MS, { x: homeX, y: homeY }, run);
    if (run.aborted) return;

    // 3. DROP. Integer y, one visible bounce, a thud rather than a shake.
    soundSystem.ballDrop();
    await frames(run, CATCH_DROP_MS, t => {
      if (!ball || !ball.active) return;
      const e = Phaser.Math.Easing.Bounce.Out(t);
      ball.setPosition(homeX, Math.round(homeY + (groundY - homeY) * e));
      ball.setAngle(0);
    });
    if (run.aborted) return;
    ball?.setPosition(homeX, groundY);

    // 4. SHAKES. One rock per shake, then dead still - the stillness is what
    // makes the next rock land as a beat rather than a wobble.
    for (let i = 0; i < Math.max(0, Math.min(3, result.shakes)); i++) {
      soundSystem.catchShake();
      await frames(run, CATCH_ROCK_MS, t => {
        if (!ball || !ball.active) return;
        // 0 -> -20 -> 0 -> +20 -> 0 over the rock.
        ball.setAngle(Math.round(Math.sin(t * Math.PI * 2) * -CATCH_ROCK_ANGLE));
      });
      if (run.aborted) return;
      ball?.setAngle(0);
      await delay(scene, CATCH_STILL_MS);
      if (run.aborted) return;
    }

    // 5. OUTCOME.
    if (result.caught) {
      soundSystem.catchSuccess();
      const flash = ball
        ? spriteFlash(ball as unknown as Phaser.GameObjects.Sprite, scene, 0xFFFFFF, 2)
        : Promise.resolve();
      await Promise.all([
        flash,
        sparkle(scene, homeX, groundY, 0xFFFFFF, 4, CATCH_CAUGHT_MS),
      ]);
      ball?.setAngle(0);
      return;
    }

    // Broke free: the ball bursts open and the mon comes back out of it.
    void impactBurst(scene, homeX, groundY, 0xFFFFFF, vocab.accentColor, 14, 180);
    killBall();
    await delay(scene, CATCH_OPEN_MS);
    if (run.aborted) return;
    sprite.setPosition(homeX, homeY);
    sprite.setScale(state.scaleX, state.scaleY);
    await materialise(scene, sprite, ctx.palette, CATCH_BREAK_MS - CATCH_OPEN_MS, run);
  };

  try {
    await Promise.race([
      body().catch(() => undefined),
      delay(scene, plan.cap).then(() => { run.aborted = true; }),
    ]);
  } finally {
    run.aborted = true;
    scene.tweens.killTweensOf(sprite);
    for (const obj of run.junk) {
      scene.tweens.killTweensOf(obj);
      obj.destroy();
    }
    run.junk.length = 0;
    restore(state);
    for (const mask of run.masks) mask.destroy();
    run.masks.length = 0;
    // `restore` always ends visible, because an ENTRANCE always does. A catch
    // is the one animation that can legitimately end with the mon gone.
    sprite.setAlpha(result.caught ? 0 : 1);
    // A sequence that ran out of clock leaves nothing on the field either way.
    if (!result.caught) killBall();
  }

  return { done: killBall };
}
