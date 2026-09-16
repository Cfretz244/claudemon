import Phaser from 'phaser';
import { GAME_WIDTH } from '../../utils/constants';
import { PokemonType } from '../../types/pokemon.types';
import { TYPE_VOCAB } from '../../logic/moveAnimationSpec';
import {
  EntranceSpec, EntranceShape, MAX_WILD_MS, MAX_SENDOUT_MS,
} from '../../logic/entranceSpec';
import {
  afterimage, animateFrames, delay, directionalParticles, fallingBlocks,
  groundHeave, lunge, ring, screenShake, sparkle, spriteFlash, tweenPromise,
  warpArcs,
} from '../MoveAnimations';

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
}

/** A tier-3 per-species entrance, keyed by `EntranceSpec.overrideId`. */
export type EntranceOverrideFn = (
  scene: Phaser.Scene,
  sprite: Phaser.GameObjects.Sprite,
  spec: EntranceSpec,
  ctx: EntranceContext,
) => Promise<void>;

const entranceOverrides = new Map<string, EntranceOverrideFn>();

/**
 * Register a hand-authored entrance for one species, mirroring
 * `registerSpecOverride`. NOTHING consults this registry yet: `playEntrance`
 * ignores `overrideId` in this PR and always draws the shape row, so that the
 * seven generic arrivals can be reviewed on their own. E4 adds the lookup.
 */
export function registerEntranceOverride(id: string, fn: EntranceOverrideFn): void {
  entranceOverrides.set(id, fn);
}

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
function paleOf(color: number): number {
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
interface Wipe {
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
): Promise<void> {
  const vocab = TYPE_VOCAB[palette] ?? TYPE_VOCAB[PokemonType.NORMAL];
  const pale = paleOf(vocab.color);
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

function particleFor(palette: PokemonType): 'dust' | 'leaf' | 'mote' {
  const p = TYPE_VOCAB[palette]?.particle;
  return p === 'leaf' ? 'leaf' : p === 'mote' ? 'mote' : 'dust';
}

// ---------------------------------------------------------------------------
// Flourishes (design section 4, right-hand column)
// ---------------------------------------------------------------------------

type FlourishFn = (run: Run, amp: number) => Promise<void>;

/** Flourish lengths in ms, all inside the design's 150-250 window. */
export const FLOURISH_MS: Record<EntranceSpec['flourish'], number> = {
  hop: 120, shake: 160, stance: 150, settle: 160, bob: 200, tilt: 180, twitch: 180,
};

const FLOURISHES: Record<EntranceSpec['flourish'], FlourishFn> = {
  hop: (run, amp) =>
    lunge(run.scene, run.sprite, run.homeX, run.homeY - 4 * amp, FLOURISH_MS.hop, 1),
  shake: (run, amp) => frames(run, FLOURISH_MS.shake, t => {
    run.sprite.setX(run.homeX + Math.round(Math.sin(t * Math.PI * 4) * 2 * amp));
  }).then(() => { run.sprite.setX(run.homeX); }),
  stance: (run, amp) => frames(run, FLOURISH_MS.stance, t => {
    run.sprite.setScale(1 + 0.1 * amp * (1 - t), 1);
  }).then(() => { run.sprite.setScale(1, 1); }),
  settle: (run, amp) => frames(run, FLOURISH_MS.settle, t => {
    run.sprite.setY(run.homeY + Math.round(Math.sin(t * Math.PI) * 2 * amp));
  }).then(() => { run.sprite.setY(run.homeY); }),
  bob: (run, amp) => frames(run, FLOURISH_MS.bob, t => {
    run.sprite.setY(run.homeY - Math.round(Math.abs(Math.sin(t * Math.PI * 2)) * 2 * amp));
  }).then(() => { run.sprite.setY(run.homeY); }),
  tilt: (run, amp) => frames(run, FLOURISH_MS.tilt, t => {
    run.sprite.setAngle(Math.sin(t * Math.PI * 2) * 6 * amp);
  }).then(() => { run.sprite.setAngle(0); }),
  twitch: (run, amp) => frames(run, FLOURISH_MS.twitch, t => {
    run.sprite.setAngle(Math.sin(t * Math.PI * 6) * 4 * amp);
  }).then(() => { run.sprite.setAngle(0); }),
};

// ---------------------------------------------------------------------------
// playEntrance
// ---------------------------------------------------------------------------

/** What the frame driver and the tween scheduler cost us on top of the plan. */
const QUANTISATION_MS = 90;

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
  const budget = Math.max(240, Math.min(spec.duration, capFor(spec)) - QUANTISATION_MS);
  const arrivalMs = Math.max(120, budget - flourishMs);
  const amp = spec.kind === 'sendout' ? 0.6 : 1;

  let cried = false;
  const cry = (): void => {
    if (cried) return;
    cried = true;
    ctx.onMaterialise?.();
  };

  const body = (async () => {
    // Rarity reads as a shimmer over the whole reveal (catchRate <= 45).
    if (spec.rare) {
      void sparkle(scene, run.homeX, run.homeY, vocab.accentColor, 8, arrivalMs);
    }
    await ARRIVALS[spec.shape](run, arrivalMs);
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
