import Phaser from 'phaser';

import { soundSystem } from './SoundSystem';
import {
  AnimationSpec,
  ParticleShape,
  SfxId,
  resolveAnimation,
} from '../logic/moveAnimationSpec';
import {
  MoveOutcome,
  OutcomePlan,
  NEUTRAL_PLAN,
  IMMUNE_WEIGHT,
  outcomePlan,
} from '../logic/animationOutcome';

// === Types ===

export interface AnimationContext {
  scene: Phaser.Scene;
  attackerSprite: Phaser.GameObjects.Sprite;
  defenderSprite: Phaser.GameObjects.Sprite;
  isPlayer: boolean; // true = player attacking (bottom-left → top-right)
  /**
   * Tier 4. Optional: leave it undefined (the battle simulator, the e2e, every
   * status move) and the move renders exactly as it did before tier 4.
   */
  outcome?: MoveOutcome;
}

// === Tier-4 outcome gate ===
//
// The shared impact helpers - `impactBurst`, `spriteFlash` on the defender,
// `screenShake`, plus `impactTint`/`impactTween` for the set-pieces that move
// the defender by hand - consult this gate, so a tier-3 override gets miss /
// immune / not-very-effective feedback without knowing tier 4 exists.
// `renderSpec` owns it: it sets the gate for the duration of one animation and
// restores the previous one in a finally. Animations are awaited one at a time
// by BattleScene, so a single module-level gate is enough; nesting (METRONOME)
// is handled by save/restore rather than by a stack.

let activePlan: OutcomePlan = NEUTRAL_PLAN;
/** The inverted mask `newGraphics` hangs on body drawings while it is set. */
let gateCutout: Phaser.Display.Masks.GeometryMask | null = null;
let gateDefender: Phaser.GameObjects.Sprite | null = null;
let gateAttacker: Phaser.GameObjects.Sprite | null = null;

/** The plan in force for the animation currently rendering. */
export function currentOutcomePlan(): OutcomePlan {
  return activePlan;
}

/** True when (x, y) is on the defender's side of the field, i.e. an impact. */
function atDefender(x: number, y: number): boolean {
  if (!gateDefender) return false;
  const dd = Phaser.Math.Distance.Between(x, y, gateDefender.x, gateDefender.y);
  if (!gateAttacker) return dd <= 40;
  return dd <= Phaser.Math.Distance.Between(x, y, gateAttacker.x, gateAttacker.y);
}

/** Blends a tint toward "no tint" (0xFFFFFF multiplies to the original sprite). */
function dimTint(color: number, strength: number): number {
  const mix = (c: number, w: number): number => Math.round(0xFF + (c - 0xFF) * w);
  return (mix((color >> 16) & 0xFF, strength) << 16)
    | (mix((color >> 8) & 0xFF, strength) << 8)
    | mix(color & 0xFF, strength);
}

/**
 * "This draw lands on the defender and this outcome wants no impact there."
 * True for a miss (nothing connects) and for an immunity (the only thing drawn
 * at the defender is the single grey puff `renderSpec`'s overlay adds).
 */
function skipDrawAt(x: number, y: number): boolean {
  if (!activePlan.skipImpact && !activePlan.grey) return false;
  return atDefender(x, y);
}

/** The same question for a helper that draws the impact without a position. */
function skipImpactDraw(): boolean {
  return activePlan.skipImpact || activePlan.grey;
}

/** Does this tween move the sprite tier 4 is protecting? */
function targetsDefender(config: Phaser.Types.Tweens.TweenBuilderConfig): boolean {
  const t = config.targets as unknown;
  if (!gateDefender) return false;
  if (Array.isArray(t)) return t.includes(gateDefender);
  return t === gateDefender;
}

/** Wall-clock length of a tween config, so a suppressed one still costs its time. */
function tweenSpan(config: Phaser.Types.Tweens.TweenBuilderConfig): number {
  const dur = Number(config.duration ?? 0);
  const legs = config.yoyo ? 2 : 1;
  const reps = Number(config.repeat ?? 0) + 1;
  return Math.round(dur * legs * reps + Number(config.delay ?? 0) + Number(config.hold ?? 0));
}

// === Tier-3 override registry ===

export type SpecOverrideFn = (spec: AnimationSpec, ctx: AnimationContext) => Promise<void>;

/** Keyed by the MOVE_OVERRIDES value in the resolver, e.g. 'thunder'. */
const SPEC_OVERRIDES: Record<string, SpecOverrideFn> = {};

/**
 * Registers a tier-3 hand-written animation. `renderSpec` consults this table
 * before the generic tier-1/2 body, so an override is just a function keyed by
 * the same string the resolver puts in `spec.override`. The functions live in
 * `animations/overrides.ts`, which is pulled in by `animations/index.ts`.
 */
export function registerSpecOverride(key: string, fn: SpecOverrideFn): void {
  SPEC_OVERRIDES[key] = fn;
}

// === Helper Utilities ===

export function delay(scene: Phaser.Scene, ms: number): Promise<void> {
  return new Promise(resolve => {
    scene.time.delayedCall(ms, resolve);
  });
}

function rawTweenPromise(scene: Phaser.Scene, config: Phaser.Types.Tweens.TweenBuilderConfig): Promise<void> {
  return new Promise(resolve => {
    scene.tweens.add({
      ...config,
      onComplete: () => resolve(),
    });
  });
}

/**
 * Gated (tier 4). A tween that moves the DEFENDER is impact reaction - the
 * knock-back, the squash, the stagger a tier-3 set-piece writes by hand - so a
 * miss suppresses it and pays its time instead. Everything else (the attacker's
 * lunge, a Graphics fade) passes straight through.
 */
export function tweenPromise(scene: Phaser.Scene, config: Phaser.Types.Tweens.TweenBuilderConfig): Promise<void> {
  if (activePlan.skipImpact && targetsDefender(config)) return delay(scene, tweenSpan(config));
  return rawTweenPromise(scene, config);
}

function rawScreenFlash(
  scene: Phaser.Scene, color: number, duration: number, alpha = 0.6,
): Promise<void> {
  const overlay = scene.add.graphics();
  overlay.setDepth(900);
  overlay.setScrollFactor(0);
  overlay.fillStyle(color, alpha);
  overlay.fillRect(0, 0, 160, 144);
  overlay.setAlpha(1);

  return tweenPromise(scene, {
    targets: overlay,
    alpha: 0,
    duration,
    onComplete: () => { overlay.destroy(); },
  }).then(() => { overlay.destroy(); });
}

/**
 * Gated (tier 4). A miss connects with nothing and an immunity connects with
 * something that does not care, so neither lights the field; "not very
 * effective" gets the brief's SHORTER flash - scaled in both length and
 * opacity, because a half-length flash at full opacity still whites the field
 * out for the frame a sample lands on.
 */
export function screenFlash(scene: Phaser.Scene, color: number, duration: number): Promise<void> {
  if (skipImpactDraw()) return delay(scene, duration);
  if (activePlan.weight !== 1) {
    return rawScreenFlash(scene, color, Math.round(duration * activePlan.weight), 0.6 * activePlan.weight)
      .then(() => delay(scene, Math.round(duration * (1 - activePlan.weight))));
  }
  return rawScreenFlash(scene, color, duration);
}

function rawScreenShake(scene: Phaser.Scene, intensity: number, duration: number): Promise<void> {
  scene.cameras.main.shake(duration, intensity / 160);
  return delay(scene, duration);
}

/**
 * Gated (tier 4). Miss, immunity and "not very effective" all shake nothing;
 * tier 4's own crit / super-effective shakes call `rawScreenShake` so they are
 * not swallowed by the outcome that asked for them.
 */
export function screenShake(scene: Phaser.Scene, intensity: number, duration: number): Promise<void> {
  if (!activePlan.shake) return delay(scene, duration);
  return rawScreenShake(scene, intensity, duration);
}

function rawSpriteFlash(
  sprite: Phaser.GameObjects.Sprite, scene: Phaser.Scene, color: number, count: number, fill = false,
): Promise<void> {
  return new Promise(resolve => {
    let flashes = 0;
    const doFlash = () => {
      if (fill) sprite.setTintFill(color); else sprite.setTint(color);
      scene.time.delayedCall(60, () => {
        sprite.clearTint();
        flashes++;
        if (flashes < count) {
          scene.time.delayedCall(60, doFlash);
        } else {
          resolve();
        }
      });
    };
    doFlash();
  });
}

/**
 * Gated (tier 4), but only for the DEFENDER: a flash on the attacker (drain's
 * recovery, a self-buff) is not impact feedback. Miss and immunity drop it;
 * "not very effective" dims the tint toward white - tinting multiplies, so a
 * tint half-way to 0xFFFFFF is literally half the colour - and shortens it.
 */
export function spriteFlash(sprite: Phaser.GameObjects.Sprite, scene: Phaser.Scene, color: number, count: number): Promise<void> {
  if (sprite === gateDefender) {
    if (activePlan.skipImpact || activePlan.grey) return delay(scene, count * 120);
    if (activePlan.flashAlpha < 1) {
      return rawSpriteFlash(
        sprite, scene, dimTint(color, activePlan.flashAlpha),
        Math.max(1, Math.round(count * activePlan.weight)),
      );
    }
  }
  return rawSpriteFlash(sprite, scene, color, count);
}

/**
 * Gated (tier 4) stand-in for `defenderSprite.setTint(...)`. Several tier-3
 * set-pieces hold a tint across their own frame loop instead of calling
 * `spriteFlash`; routing them through here is what makes their impact obey the
 * outcome as well.
 */
export function impactTint(sprite: Phaser.GameObjects.Sprite, color: number): void {
  if (sprite === gateDefender) {
    if (activePlan.skipImpact || activePlan.grey) return;
    if (activePlan.flashAlpha < 1) { sprite.setTint(dimTint(color, activePlan.flashAlpha)); return; }
  }
  sprite.setTint(color);
}

/** Always clears: putting a sprite back is never something tier 4 wants skipped. */
export function clearImpactTint(sprite: Phaser.GameObjects.Sprite): void {
  sprite.clearTint();
}

export function lunge(
  scene: Phaser.Scene,
  sprite: Phaser.GameObjects.Sprite,
  targetX: number,
  targetY: number,
  duration: number,
  factor = 0.4,
): Promise<void> {
  const origX = sprite.x;
  const origY = sprite.y;
  const midX = origX + (targetX - origX) * factor;
  const midY = origY + (targetY - origY) * factor;

  return tweenPromise(scene, {
    targets: sprite,
    x: midX,
    y: midY,
    duration: duration / 2,
    ease: 'Power2',
  }).then(() =>
    tweenPromise(scene, {
      targets: sprite,
      x: origX,
      y: origY,
      duration: duration / 2,
      ease: 'Power2',
    })
  );
}

export function sparkle(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: number,
  count: number,
  duration: number,
): Promise<void> {
  if (skipDrawAt(x, y)) return delay(scene, duration);
  const graphics: Phaser.GameObjects.Graphics[] = [];
  for (let i = 0; i < count; i++) {
    const g = scene.add.graphics();
    g.setDepth(800);
    g.setScrollFactor(0);
    const sx = x + (Math.random() - 0.5) * 20;
    const sy = y + (Math.random() - 0.5) * 20;
    g.setPosition(sx, sy);
    // Draw a small star/cross
    g.lineStyle(1, color, 1);
    g.beginPath();
    g.moveTo(-2, 0); g.lineTo(2, 0);
    g.moveTo(0, -2); g.lineTo(0, 2);
    g.strokePath();
    g.setAlpha(0);
    graphics.push(g);
  }

  const promises = graphics.map((g, i) =>
    delay(scene, i * (duration / count / 2)).then(() =>
      tweenPromise(scene, {
        targets: g,
        alpha: 1,
        duration: duration / 4,
        yoyo: true,
        hold: duration / 4,
      }).then(() => { g.destroy(); })
    )
  );

  return Promise.all(promises).then(() => {});
}

// === Frame-driven helpers (one Graphics for the whole effect) ===

/**
 * Runs `onFrame(t)` with t going 0 -> 1 over `duration`, on a single timer.
 * Effects built on this draw every particle into ONE Graphics per frame
 * instead of one Graphics per particle, which is what keeps the object count
 * flat as the type vocabulary adds shapes.
 */
function animateFrames(
  scene: Phaser.Scene,
  duration: number,
  onFrame: (t: number) => void,
): Promise<void> {
  return new Promise(resolve => {
    const start = scene.time.now;
    const ev = scene.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        const t = Math.min(1, (scene.time.now - start) / Math.max(1, duration));
        onFrame(t);
        if (t >= 1) {
          ev.remove();
          resolve();
        }
      },
    });
  });
}

function rawNewGraphics(scene: Phaser.Scene, depth = 800): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  g.setDepth(depth);
  g.setScrollFactor(0);
  return g;
}

/**
 * Gated (tier 4). Every Graphics an animation BODY draws into - tier 1/2 here
 * and every tier-3 override, which routes its own `newG` through
 * `newBodyGraphics` below - is created here, so this is the one place tier 4
 * can reach a set-piece that draws its impact by hand.
 *
 * On a miss or an immunity `renderSpec` hangs an inverted geometry mask over
 * the defender on all of them: everything the body draws still renders, except
 * inside the defender's own footprint. A fireball still crosses the field and
 * a bolt still falls out of the sky; neither leaves a detonation on a target
 * it did not connect with. No override has to know an outcome exists.
 */
function newGraphics(scene: Phaser.Scene, depth = 800): Phaser.GameObjects.Graphics {
  const g = rawNewGraphics(scene, depth);
  if (gateCutout) g.setMask(gateCutout);
  return g;
}

/** The same factory, for the tier-3 overrides in `animations/overrides.ts`. */
export function newBodyGraphics(scene: Phaser.Scene, depth: number): Phaser.GameObjects.Graphics {
  return newGraphics(scene, depth);
}

/**
 * Draws one particle of the given type shape at (x, y), centred.
 *
 * Every shape is 4-6 px across and opaque: on a 160x144 screen a 2 px speck
 * reads as noise, not as an effect. Counts stay low instead - the whole burst
 * still lands in ONE Graphics per frame.
 */
function drawParticle(
  g: Phaser.GameObjects.Graphics,
  shape: ParticleShape,
  x: number,
  y: number,
  size: number,
  color: number,
  accentColor: number,
  seed: number,
): void {
  const alt = seed % 2 === 0 ? color : accentColor;
  const s = Math.max(4, Math.round(size));
  switch (shape) {
    case 'mote': // Fire: 4 px ember with a hot core
      g.fillStyle(color, 1);
      g.fillRect(x - 2, y - 2, 5, 5);
      g.fillStyle(accentColor, 1);
      g.fillRect(x - 1, y - 1, 2, 2);
      break;
    case 'droplet': // Water: 5 px teardrop with a pale highlight
      g.fillStyle(color, 1);
      g.fillRect(x - 1, y - 2, 3, 6);
      g.fillRect(x - 2, y - 1, 5, 4);
      g.fillStyle(accentColor, 1);
      g.fillRect(x - 1, y - 1, 2, 2);
      break;
    case 'bolt': // Electric: 6 px cross with 2 px arms
      g.fillStyle(color, 1);
      g.fillRect(x - 3, y - 1, 7, 2);
      g.fillRect(x - 1, y - 3, 2, 7);
      g.fillStyle(accentColor, 1);
      g.fillRect(x - 1, y - 1, 2, 2);
      break;
    case 'leaf': // Grass: 5x5 blade with a lighter vein
      g.fillStyle(color, 1);
      g.fillRect(x - 2, y - 1, 5, 3);
      g.fillRect(x - 1, y - 2, 3, 5);
      g.fillStyle(accentColor, 1);
      g.fillRect(x - 2, y, 5, 1);
      break;
    case 'shard': // Ice: 5 px diamond with a white core
      g.fillStyle(color, 1);
      g.fillRect(x - 2, y - 1, 5, 3);
      g.fillRect(x - 1, y - 2, 3, 5);
      g.fillStyle(accentColor, 1);
      g.fillRect(x - 1, y - 1, 2, 2);
      break;
    case 'streak': // Fighting: 6x2 radial streak
      g.fillStyle(color, 1);
      g.fillRect(x - 3, y - 1, 7, 2);
      g.fillStyle(alt, 1);
      g.fillRect(x - 1, y - 1, 2, 2);
      break;
    case 'bubble': // Poison: 5 px bubble with a lighter cap
      g.fillStyle(color, 1);
      g.fillRect(x - 2, y - 2, 5, 5);
      g.fillStyle(accentColor, 1);
      g.fillRect(x - 1, y - 2, 2, 2);
      break;
    case 'grit': // Ground: 4-5 px clod
      g.fillStyle(color, 1);
      g.fillRect(x - 2, y - 2, s, s);
      g.fillStyle(alt, 1);
      g.fillRect(x - 1, y - 1, 2, 2);
      break;
    case 'block': // Rock: 6 px block with a dark face
      g.fillStyle(color, 1);
      g.fillRect(x - 3, y - 3, 6, 6);
      g.fillStyle(accentColor, 1);
      g.fillRect(x - 1, y - 1, 3, 3);
      break;
    case 'dash': // Flying: 6x2 streak with a pale head
      g.fillStyle(color, 1);
      g.fillRect(x - 3, y - 1, 7, 2);
      g.fillStyle(accentColor, 1);
      g.fillRect(x + 2, y - 1, 2, 2);
      break;
    case 'dart': // Bug: 4 px dot
      g.fillStyle(color, 1);
      g.fillRect(x - 2, y - 2, 4, 4);
      g.fillStyle(alt, 1);
      g.fillRect(x - 1, y - 1, 2, 2);
      break;
    case 'wisp': // Ghost: 6x4 blot
      g.fillStyle(color, 0.95);
      g.fillRect(x - 3, y - 2, 6, 4);
      g.fillStyle(accentColor, 0.95);
      g.fillRect(x - 1, y - 1, 3, 2);
      break;
    case 'ring': // Psychic: 5 px lozenge
      g.fillStyle(color, 1);
      g.fillRect(x - 2, y - 2, 5, 5);
      g.fillStyle(accentColor, 1);
      g.fillRect(x - 1, y - 1, 3, 3);
      break;
    case 'trail': // Dragon: 5 px scale with a bright core
      g.fillStyle(color, 1);
      g.fillRect(x - 2, y - 2, 5, 5);
      g.fillStyle(accentColor, 1);
      g.fillRect(x - 1, y - 1, 2, 2);
      break;
    case 'dust':
    default:
      g.fillStyle(color, 1);
      g.fillRect(x - 2, y - 2, s, s);
      g.fillStyle(accentColor, 1);
      g.fillRect(x - 1, y - 1, 2, 2);
      break;
  }
}

export interface EmitOptions {
  /** Unit direction the cloud drifts in; (0,0) = radial. */
  dirX?: number;
  dirY?: number;
  spread?: number;
  duration?: number;
  shape?: ParticleShape;
  accentColor?: number;
  /** Downward pull; negative floats the particles up. */
  gravity?: number;
  /** Sine wobble amplitude across the direction of travel. */
  wobble?: number;
}

/**
 * A directional burst of type-shaped particles, drawn into one Graphics.
 * Replaces per-particle Graphics for every new effect in the vocabulary.
 */
export function directionalParticles(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: number,
  count: number,
  opts: EmitOptions = {},
): Promise<void> {
  if (skipDrawAt(x, y)) return delay(scene, opts.duration ?? 300);
  // "Not very effective" is the brief's FEWER particles: the same emission,
  // thinned at the defender only, so a self-buff's own motes are untouched.
  if (atDefender(x, y) && activePlan.weight !== 1) count = Math.max(1, Math.round(count * activePlan.weight));
  const {
    dirX = 0, dirY = 0, spread = 14, duration = 260,
    shape = 'dust', accentColor = color, gravity = 0, wobble = 0,
  } = opts;

  const parts = Array.from({ length: count }, (_, i) => {
    const ang = (i / count) * Math.PI * 2 + Math.random();
    const speed = 0.4 + Math.random() * 0.6;
    return {
      vx: (dirX * 1.6 + Math.cos(ang) * (dirX || dirY ? 0.45 : 1)) * spread * speed,
      vy: (dirY * 1.6 + Math.sin(ang) * (dirX || dirY ? 0.45 : 1)) * spread * speed,
      size: 4 + (i % 2),
      phase: Math.random() * Math.PI * 2,
      seed: i,
    };
  });

  const g = newGraphics(scene);
  return animateFrames(scene, duration, t => {
    g.clear();
    // Hold full opacity for most of the burst, then cut - a burst that starts
    // fading on frame 1 is what made the old pass read as washed out.
    g.setAlpha(t < 0.6 ? 1 : Math.max(0, 1 - (t - 0.6) / 0.4));
    for (const p of parts) {
      const wob = wobble ? Math.sin(p.phase + t * 6) * wobble : 0;
      drawParticle(
        g, shape,
        Math.round(x + p.vx * t + wob),
        Math.round(y + p.vy * t + gravity * t * t * 24),
        p.size, color, accentColor, p.seed,
      );
    }
  }).then(() => { g.destroy(); });
}

/**
 * A projectile that travels on a parabolic arc, drawn as a >= 6 px ball with a
 * fading trail behind it so a single frame still shows where it came from.
 */
export function arcProjectile(
  scene: Phaser.Scene,
  fromX: number, fromY: number,
  toX: number, toY: number,
  color: number,
  size: number,
  duration: number,
  arcHeight = 18,
  shape: ParticleShape = 'dust',
  accentColor = color,
): Promise<void> {
  const g = newGraphics(scene);
  const r = Math.max(3, Math.round(size)); // >= 6 px across
  const at = (t: number): [number, number] => [
    fromX + (toX - fromX) * t,
    fromY + (toY - fromY) * t - Math.sin(t * Math.PI) * arcHeight,
  ];
  return animateFrames(scene, duration, t => {
    g.clear();
    for (let i = 5; i >= 1; i--) {
      const tt = t - i * 0.05;
      if (tt <= 0) continue;
      const [tx, ty] = at(tt);
      g.fillStyle(color, 0.9 - i * 0.12);
      g.fillCircle(Math.round(tx), Math.round(ty), Math.max(1, r - i));
    }
    const [x, y] = at(t);
    g.fillStyle(color, 0.5);
    g.fillCircle(Math.round(x), Math.round(y), r + 2);
    g.fillStyle(color, 1);
    g.fillCircle(Math.round(x), Math.round(y), r);
    g.fillStyle(accentColor, 1);
    g.fillCircle(Math.round(x), Math.round(y), 2);
    if (shape !== 'dust') {
      drawParticle(g, shape, Math.round(x), Math.round(y), 4, color, accentColor, 0);
    }
  }).then(() => { g.destroy(); });
}

/** Concentric rings pulsing outward (Psychic) or inward (bind, drain). */
export function ring(
  scene: Phaser.Scene,
  x: number, y: number,
  color: number,
  maxRadius: number,
  duration: number,
  count = 2,
  inward = false,
): Promise<void> {
  if (skipDrawAt(x, y)) return delay(scene, duration);
  const g = newGraphics(scene);
  return animateFrames(scene, duration, t => {
    g.clear();
    for (let i = 0; i < count; i++) {
      const phase = (t + i / count) % 1;
      const r = (inward ? 1 - phase : phase) * maxRadius;
      if (r < 1) continue;
      g.lineStyle(3, color, 1 - phase * 0.35);
      g.strokeCircle(x, y, Math.round(r));
    }
  }).then(() => { g.destroy(); });
}

/** Rock: 5-6 px blocks dropping from above the target onto it. */
export function fallingBlocks(
  scene: Phaser.Scene,
  x: number, y: number,
  color: number,
  accentColor: number,
  count: number,
  duration: number,
): Promise<void> {
  if (skipDrawAt(x, y)) return delay(scene, duration);
  // The defender can sit near the top of the 144 px field, so the blocks start
  // from wherever there is actually room above it rather than off-screen.
  const headroom = Math.max(10, Math.min(34, y - 6));
  const blocks = Array.from({ length: count }, (_, i) => ({
    x: x + (i - (count - 1) / 2) * 8 + (Math.random() - 0.5) * 4,
    delay: (i / count) * 0.45,
    drop: headroom * (0.7 + Math.random() * 0.3),
    seed: i,
  }));
  const g = newGraphics(scene);
  return animateFrames(scene, duration, t => {
    g.clear();
    for (const b of blocks) {
      const local = (t - b.delay) / (1 - b.delay);
      if (local <= 0) continue;
      const f = Math.min(1, local);
      drawParticle(g, 'block', Math.round(b.x), Math.round(y - b.drop + b.drop * f * f), 6, color, accentColor, b.seed);
    }
  }).then(() => { g.destroy(); });
}

/**
 * Ground: the floor of the battle field heaves and throws grit up across the
 * whole width. A screen shake on its own only moves edge pixels around, so a
 * Ground move needs something Ground-coloured actually on screen.
 */
export function groundHeave(
  scene: Phaser.Scene,
  color: number,
  accentColor: number,
  rank: number,
  duration: number,
): Promise<void> {
  if (skipImpactDraw()) return delay(scene, duration);
  const floor = 96;
  const n = 14 + rank * 4;
  const parts = Array.from({ length: n }, (_, i) => ({
    x: 5 + (i / n) * 152,
    lift: 12 + Math.random() * 22,
    phase: Math.random() * 0.3,
    seed: i,
  }));
  const g = newGraphics(scene, 790);
  return animateFrames(scene, duration, t => {
    g.clear();
    g.setAlpha(t < 0.6 ? 1 : Math.max(0, 1 - (t - 0.6) / 0.4));
    const swell = Math.round(Math.sin(t * Math.PI) * (4 + rank * 3));
    g.fillStyle(color, 1);
    g.fillRect(0, floor - swell, 160, 5 + swell);
    g.fillStyle(accentColor, 1);
    g.fillRect(0, floor - swell, 160, 2);
    for (const p of parts) {
      const local = (t - p.phase) / (1 - p.phase);
      if (local <= 0) continue;
      drawParticle(
        g, 'grit', Math.round(p.x),
        Math.round(floor - 2 - p.lift * Math.sin(Math.min(1, local) * Math.PI)),
        5, color, accentColor, p.seed,
      );
    }
  }).then(() => { g.destroy(); });
}

/** Ghost: fading copies of the sprite trailing behind it. */
export function afterimage(
  scene: Phaser.Scene,
  sprite: Phaser.GameObjects.Sprite,
  color: number,
  count: number,
  duration: number,
): Promise<void> {
  const ghosts: Phaser.GameObjects.Image[] = [];
  for (let i = 0; i < count; i++) {
    const img = scene.add.image(sprite.x, sprite.y, sprite.texture.key, sprite.frame.name);
    img.setDepth(sprite.depth - 1);
    img.setScrollFactor(0);
    img.setTint(color);
    img.setAlpha(0.5 - i * 0.12);
    ghosts.push(img);
  }
  return animateFrames(scene, duration, t => {
    ghosts.forEach((img, i) => {
      const off = (i + 1) * 4 * Math.sin(t * Math.PI);
      img.setPosition(sprite.x - off, sprite.y - off * 0.4);
      img.setAlpha((0.5 - i * 0.12) * (1 - t));
    });
  }).then(() => { ghosts.forEach(g => g.destroy()); });
}

/** Psychic: a brief inverted frame. Falls back to a white flash if unsupported. */
/**
 * A psychic "reality bends" distortion: two counter-rotating arcs of the type
 * colour closing in on a point.
 *
 * This used to be a full-screen DIFFERENCE-blended white rect. Phaser's WebGL
 * renderer only supports a subset of blend modes and silently falls back to
 * NORMAL for DIFFERENCE, so instead of inverting the screen it painted an
 * opaque white rectangle over the whole battle - the frame went blank white.
 * A local, type-coloured distortion cannot fail that way and keeps the move's
 * own colour on screen.
 */
export function warpArcs(
  scene: Phaser.Scene,
  x: number, y: number,
  color: number,
  accentColor: number,
  duration: number,
): Promise<void> {
  if (skipDrawAt(x, y)) return delay(scene, duration);
  const g = newGraphics(scene, 900);
  return animateFrames(scene, duration, t => {
    g.clear();
    g.setAlpha(t < 0.7 ? 1 : Math.max(0, 1 - (t - 0.7) / 0.3));
    for (let i = 0; i < 2; i++) {
      const dir = i === 0 ? 1 : -1;
      const spin = dir * t * Math.PI * 1.6 + (i * Math.PI) / 2;
      const r = 26 - t * 12 + i * 5;
      g.lineStyle(3, i === 0 ? color : accentColor, 1);
      g.beginPath();
      g.arc(x, y, Math.max(3, r), spin, spin + Math.PI * 0.75);
      g.strokePath();
    }
  }).then(() => { g.destroy(); });
}

/** Particles spawning along the attacker -> defender line (beams, drains). */
export function emitterAlong(
  scene: Phaser.Scene,
  fromX: number, fromY: number,
  toX: number, toY: number,
  color: number,
  accentColor: number,
  count: number,
  duration: number,
  shape: ParticleShape = 'dust',
): Promise<void> {
  const parts = Array.from({ length: count }, (_, i) => ({
    at: i / count,
    off: (Math.random() - 0.5) * 8,
    seed: i,
  }));
  const g = newGraphics(scene);
  const nx = -(toY - fromY);
  const ny = toX - fromX;
  const len = Math.max(1, Math.hypot(nx, ny));
  return animateFrames(scene, duration, t => {
    g.clear();
    g.setAlpha(t < 0.7 ? 1 : Math.max(0, 1 - (t - 0.7) / 0.3));
    for (const p of parts) {
      const at = (p.at + t) % 1;
      const px = fromX + (toX - fromX) * at + (nx / len) * p.off;
      const py = fromY + (toY - fromY) * at + (ny / len) * p.off;
      drawParticle(g, shape, Math.round(px), Math.round(py), 4, color, accentColor, p.seed);
    }
  }).then(() => { g.destroy(); });
}

/**
 * A type-coloured beam: a wide coloured halo, a solid body and a thin bright
 * core, held at FULL alpha for most of its life and cut at the end.
 *
 * The first pass drew a 1-4 px line that started fading on frame one, which
 * looked like a pale scratch instead of a beam; this one holds.
 */
export function typeBeam(
  scene: Phaser.Scene,
  fromX: number, fromY: number,
  toX: number, toY: number,
  color: number,
  accentColor: number,
  width: number,
  duration: number,
): Promise<void> {
  const g = newGraphics(scene);
  const w = Math.max(4, width);
  return animateFrames(scene, duration, t => {
    g.clear();
    // Extends over the first 20 %, holds, then cuts away over the last 15 %.
    const grow = Math.min(1, t / 0.2);
    const fade = t > 0.85 ? Math.max(0, 1 - (t - 0.85) / 0.15) : 1;
    const ex = fromX + (toX - fromX) * grow;
    const ey = fromY + (toY - fromY) * grow;
    const pulse = 1 + Math.sin(t * 26) * 0.14;
    g.setAlpha(fade);
    const stroke = (lw: number, c: number, a: number): void => {
      g.lineStyle(Math.max(1, Math.round(lw)), c, a);
      g.beginPath();
      g.moveTo(fromX, fromY);
      g.lineTo(ex, ey);
      g.strokePath();
    };
    stroke((w + 6) * pulse, color, 0.65);         // halo, same hue
    stroke(w * pulse, color, 1);                  // solid body
    stroke(Math.max(1, w / 3), accentColor, 1);   // bright core
  }).then(() => { g.destroy(); });
}

/**
 * The frame that has to read: an opaque type-coloured hit burst over the
 * defender, with four spokes so it looks struck rather than merely lit.
 */
function rawImpactBurst(
  scene: Phaser.Scene,
  x: number, y: number,
  color: number,
  accentColor: number,
  radius: number,
  duration: number,
): Promise<void> {
  const g = rawNewGraphics(scene, 810);
  return animateFrames(scene, duration, t => {
    g.clear();
    const r = Math.round(radius * (0.5 + t * 0.7));
    g.setAlpha(t < 0.55 ? 1 : Math.max(0, 1 - (t - 0.55) / 0.45));
    g.fillStyle(color, 1);
    g.fillCircle(x, y, r);
    g.fillStyle(accentColor, 1);
    g.fillCircle(x, y, Math.max(2, Math.round(r * 0.35)));
    g.fillStyle(color, 1);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      g.fillRect(Math.round(x + dx * (r + 3)) - 3, Math.round(y + dy * (r + 3)) - 3, 6, 6);
    }
  }).then(() => { g.destroy(); });
}

/**
 * Gated (tier 4). At the defender: dropped on a miss, recoloured into the grey
 * puff on an immunity, scaled by the outcome weight otherwise. A burst centred
 * on the ATTACKER (self-aura, SELF-DESTRUCT) is never touched.
 */
export function impactBurst(
  scene: Phaser.Scene,
  x: number, y: number,
  color: number,
  accentColor: number,
  radius: number,
  duration: number,
): Promise<void> {
  if (atDefender(x, y)) {
    // Miss and immunity both drop it: the one grey puff an immunity does get is
    // drawn by `renderSpec`, so a body that bursts twice does not puff twice.
    if (activePlan.skipImpact || activePlan.grey) return delay(scene, duration);
    if (activePlan.weight !== 1) {
      const r = Math.max(3, Math.round(radius * activePlan.weight));
      return rawImpactBurst(scene, x, y, color, accentColor, r, duration);
    }
  }
  return rawImpactBurst(scene, x, y, color, accentColor, radius, duration);
}

/** The immunity puff: a colourless thump, so "no effect" reads without text. */
const GREY_IMPACT = 0x888888;
const GREY_ACCENT = 0xCCCCCC;

// === Type SFX ===

function playTypeSfx(id: SfxId): void {
  switch (id) {
    case 'hit': soundSystem.hit(); break;
    case 'crackle': soundSystem.crackle(); break;
    case 'splash': soundSystem.splash(); break;
    case 'zap': soundSystem.thunderZap(); break;
    case 'sweep': soundSystem.leafSweep(); break;
    case 'ping': soundSystem.glassPing(); break;
    case 'tripleHit': soundSystem.tripleHit(); break;
    case 'bubblePop': soundSystem.bubblePop(); break;
    case 'rumble': soundSystem.rumble(); break;
    case 'thud': soundSystem.thud(); break;
    case 'whoosh': soundSystem.whoosh(); break;
    case 'chitter': soundSystem.chitter(); break;
    case 'wail': soundSystem.wail(); break;
    case 'warble': soundSystem.warble(); break;
    case 'roar': soundSystem.roar(); break;
  }
}

// === Generic renderer (tier 1 motion x tier 2 type vocabulary) ===

const INTENSITY_RANK: Record<AnimationSpec['intensity'], number> = { light: 0, mid: 1, heavy: 2 };

interface SpriteState {
  sprite: Phaser.GameObjects.Sprite;
  x: number; y: number; alpha: number; scaleX: number; scaleY: number;
}

function snapshot(sprite: Phaser.GameObjects.Sprite): SpriteState {
  return { sprite, x: sprite.x, y: sprite.y, alpha: sprite.alpha, scaleX: sprite.scaleX, scaleY: sprite.scaleY };
}

function restore(state: SpriteState): void {
  const { sprite } = state;
  sprite.clearTint();
  sprite.setPosition(state.x, state.y);
  sprite.setAlpha(state.alpha);
  sprite.setScale(state.scaleX, state.scaleY);
}

/**
 * Lunge factor that guarantees a clearly visible step: at least 8 px (light),
 * 12 px (mid) or 16 px (heavy) of travel at whatever range the sprites sit.
 */
function contactFactor(ctx: AnimationContext, rank: number): number {
  const gap = Math.max(
    1,
    Phaser.Math.Distance.Between(
      ctx.attackerSprite.x, ctx.attackerSprite.y,
      ctx.defenderSprite.x, ctx.defenderSprite.y,
    ),
  );
  const minPx = [8, 12, 16][rank] ?? 12;
  return Math.min(0.75, Math.max(0.32 + rank * 0.1, minPx / gap));
}

/** Type-flavoured impact at the defender. `weight` scales it (tier 4 hooks here). */
async function typeImpact(spec: AnimationSpec, ctx: AnimationContext, weight = 1): Promise<void> {
  const { scene, defenderSprite } = ctx;
  const rank = INTENSITY_RANK[spec.intensity];
  // `weight` is the motion's own emphasis (1.6 for special-strike, 1.4 for a
  // detonation); `activePlan.weight` is tier 4's (0.6 for "not very effective").
  const count = Math.max(4, Math.round((8 + rank * 3) * weight * activePlan.weight));
  const dur = Math.round(spec.duration * 0.35);

  const jobs: Promise<void>[] = [
    // Always: a solid slug of the type colour over the defender, so the type
    // reads even in a single still frame.
    impactBurst(
      scene, defenderSprite.x, defenderSprite.y,
      spec.color, spec.accentColor,
      Math.round((10 + rank * 4) * weight), dur,
    ),
    directionalParticles(scene, defenderSprite.x, defenderSprite.y, spec.color, count, {
      spread: 14 + rank * 6,
      duration: dur,
      shape: spec.particle,
      accentColor: spec.accentColor,
      gravity: spec.particle === 'mote' || spec.particle === 'bubble' ? -0.6 : 0.3,
      wobble: spec.particle === 'leaf' || spec.particle === 'dart' ? 3 : 0,
    }),
    spriteFlash(defenderSprite, scene, spec.color, 1 + rank),
  ];

  switch (spec.accent) {
    case 'flicker':
      jobs.push(spriteFlash(defenderSprite, scene, spec.accentColor, 2));
      break;
    case 'splash-ring':
      jobs.push(ring(scene, defenderSprite.x, defenderSprite.y, spec.color, 20, dur, 2));
      break;
    case 'white-flash':
      jobs.push(screenFlash(scene, 0xFFFFFF, 60));
      break;
    case 'vine':
      jobs.push(typeBeam(
        scene, ctx.attackerSprite.x, ctx.attackerSprite.y, defenderSprite.x, defenderSprite.y,
        spec.color, spec.accentColor, 5, dur,
      ));
      break;
    case 'sparkle':
      jobs.push(sparkle(scene, defenderSprite.x, defenderSprite.y, spec.accentColor, 5, dur));
      break;
    case 'triple-impact':
      jobs.push(spriteFlash(defenderSprite, scene, spec.color, 3));
      break;
    case 'drip':
      jobs.push(directionalParticles(scene, defenderSprite.x, defenderSprite.y + 6, spec.accentColor, 4, {
        dirY: 1, spread: 8, duration: dur, shape: 'bubble', gravity: 1.2,
      }));
      break;
    case 'shake':
      jobs.push(groundHeave(scene, spec.color, spec.accentColor, rank, Math.round(dur * 1.3)));
      jobs.push(screenShake(scene, 3 + rank * 2, dur));
      break;
    case 'landing-thud':
      // Rock actually drops rocks; `fallingBlocks` was otherwise unused.
      jobs.push(fallingBlocks(
        scene, defenderSprite.x, defenderSprite.y,
        spec.color, spec.accentColor, 5 + rank * 2, Math.round(dur * 1.2),
      ));
      jobs.push(groundHeave(scene, spec.color, spec.accentColor, rank, Math.round(dur * 1.2)));
      jobs.push(screenShake(scene, 2 + rank, Math.round(dur * 0.5)));
      break;
    case 'rise':
      jobs.push(directionalParticles(scene, defenderSprite.x, defenderSprite.y, spec.accentColor, 4, {
        dirX: ctx.isPlayer ? 1 : -1, spread: 16, duration: dur, shape: 'dash',
      }));
      break;
    case 'double-hit':
      jobs.push(spriteFlash(defenderSprite, scene, spec.color, 2));
      break;
    case 'alpha-flicker':
      jobs.push(tweenPromise(scene, {
        targets: defenderSprite, alpha: 0.2, duration: Math.round(dur / 3), yoyo: true, repeat: 1,
      }));
      break;
    case 'invert':
      jobs.push(warpArcs(scene, defenderSprite.x, defenderSprite.y, spec.color, spec.accentColor, dur));
      jobs.push(ring(scene, defenderSprite.x, defenderSprite.y, spec.color, 20, dur, 3));
      break;
    case 'heavy-shake':
      // A bare camera shake only jitters edge pixels; give it something of the
      // move's own colour to shake.
      jobs.push(ring(scene, defenderSprite.x, defenderSprite.y, spec.color, 26, dur, 2));
      jobs.push(screenShake(scene, 4 + rank * 2, dur));
      break;
    case 'plain':
    default:
      jobs.push(directionalParticles(scene, defenderSprite.x, defenderSprite.y, spec.accentColor, 4, {
        spread: 20 + rank * 6, duration: dur, shape: spec.particle, accentColor: spec.color,
      }));
      break;
  }

  if (rank === 2 && spec.accent !== 'shake' && spec.accent !== 'heavy-shake') {
    jobs.push(screenShake(scene, 4, Math.round(dur * 0.5)));
  }

  await Promise.all(jobs);
}

/** Motes gathering on the attacker (self-aura, charge wind-up, drain return). */
function gather(spec: AnimationSpec, ctx: AnimationContext, duration: number): Promise<void> {
  const { scene, attackerSprite } = ctx;
  const parts = Array.from({ length: 10 }, (_, i) => ({
    ang: (i / 10) * Math.PI * 2,
    r: 22 + (i % 3) * 6,
    seed: i,
  }));
  const g = newGraphics(scene);
  return animateFrames(scene, duration, t => {
    g.clear();
    g.setAlpha(t < 0.85 ? 1 : Math.max(0, (1 - t) / 0.15));
    for (const p of parts) {
      const r = p.r * (1 - t);
      drawParticle(
        g, spec.particle,
        Math.round(attackerSprite.x + Math.cos(p.ang + t * 2) * r),
        Math.round(attackerSprite.y + Math.sin(p.ang + t * 2) * r * 0.7),
        5, spec.color, spec.accentColor, p.seed,
      );
    }
  }).then(() => { g.destroy(); });
}

// === Tier 4: the outcome layer ===

/** Half-width of the footprint a miss / an immunity keeps clear (32 px sprite). */
const CUTOUT_HALF = 20;

/**
 * The shape `renderSpec` inverts into the body's mask: the defender's own
 * footprint. Never rendered - it only ever describes a hole.
 */
function defenderCutout(ctx: AnimationContext): Phaser.GameObjects.Graphics {
  const { scene, defenderSprite } = ctx;
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.setVisible(false);
  g.fillStyle(0xFFFFFF, 1);
  g.fillRect(
    defenderSprite.x - CUTOUT_HALF, defenderSprite.y - CUTOUT_HALF,
    CUTOUT_HALF * 2, CUTOUT_HALF * 2,
  );
  return g;
}

/**
 * The miss streak: a short grey slash sweeping past the defender, drawn where
 * the impact would have been. Grey, because it is the absence of the move.
 */
function whiffStreak(
  scene: Phaser.Scene, x: number, y: number, dir: number, duration: number,
): Promise<void> {
  const g = rawNewGraphics(scene, 810);
  return animateFrames(scene, duration, t => {
    g.clear();
    g.setAlpha(t < 0.6 ? 1 : Math.max(0, 1 - (t - 0.6) / 0.4));
    const cx = Math.round(x - dir * 18 + dir * 36 * t);
    g.lineStyle(3, GREY_IMPACT, 1);
    g.beginPath();
    g.moveTo(cx - dir * 10, y - 9);
    g.lineTo(cx + dir * 10, y + 9);
    g.strokePath();
    g.lineStyle(1, GREY_ACCENT, 1);
    g.beginPath();
    g.moveTo(cx - dir * 10, y - 4);
    g.lineTo(cx + dir * 10, y + 14);
    g.strokePath();
  }).then(() => { g.destroy(); });
}

/**
 * Tier 4's own drawing, run ALONGSIDE the body (tier 1/2 or a tier-3 override)
 * so that it lands at the moment of impact rather than after it. 55 % of the
 * budget is where every motion in the vocabulary connects: the contact lunge
 * takes the first half, a projectile/beam its first 50-60 %, and the overrides
 * are written to the same shape.
 */
async function outcomeOverlay(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  const plan = activePlan;
  if (!plan.dodge && !plan.critical && !plan.grey) return;
  const { scene, attackerSprite, defenderSprite } = ctx;
  const at = Math.round(spec.duration * 0.55);
  const away = Math.sign(defenderSprite.x - attackerSprite.x) || 1;
  const jobs: Promise<void>[] = [];

  if (plan.dodge) {
    jobs.push((async () => {
      // Sized as a share of the budget and landed so that it ENDS at ~62 % of
      // it: the dodge reads as the attack arriving and missing, and by the time
      // the move is three quarters done the defender is home again and the
      // ground where the impact would have been is empty.
      const span = Math.min(140, Math.max(60, Math.round(spec.duration * 0.24)));
      await delay(scene, Math.max(0, Math.round(spec.duration * 0.62) - span));
      const homeX = defenderSprite.x;
      await Promise.all([
        rawTweenPromise(scene, {
          targets: defenderSprite, x: homeX + away * 6,
          duration: Math.round(span / 2), yoyo: true, ease: 'Quad.easeOut',
        }),
        whiffStreak(scene, homeX, defenderSprite.y, away, span),
      ]);
    })());
  }

  if (plan.grey) {
    // The one grey puff an immunity gets. It is drawn HERE rather than left to
    // `impactBurst` so that a body which bursts several times still puffs once,
    // and so that a hand-drawn override - whose impact the cutout has just
    // removed - gets one too.
    jobs.push((async () => {
      const dur = Math.min(260, Math.max(140, Math.round(spec.duration * 0.3)));
      await delay(scene, Math.max(0, at - Math.round(dur * 0.3)));
      await rawImpactBurst(
        scene, defenderSprite.x, defenderSprite.y,
        GREY_IMPACT, GREY_ACCENT, Math.round(16 * IMMUNE_WEIGHT * 2), dur,
      );
    })());
  }

  if (plan.critical) {
    jobs.push((async () => {
      await delay(scene, at);
      const homeX = defenderSprite.x;
      await Promise.all([
        rawScreenFlash(scene, 0xFFFFFF, 120),
        rawScreenShake(scene, 6, 120),
        rawTweenPromise(scene, {
          targets: defenderSprite, x: homeX - away * 4,
          duration: 70, yoyo: true, ease: 'Quad.easeOut',
        }),
      ]);
    })());
  }

  await Promise.all(jobs);
}

/**
 * Super effective: the impact happens a second time, harder, in white. Capped
 * at 200 ms - the budget the brief allows tier 4 to add - so no move's measured
 * duration moves by more than that.
 */
async function superEffectiveRepeat(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  const { scene, defenderSprite } = ctx;
  const w = activePlan.repeat;
  const rank = INTENSITY_RANK[spec.intensity];
  const dur = Math.max(120, Math.min(200, Math.round(spec.duration * 0.22)));
  await Promise.all([
    rawScreenFlash(scene, 0xFFFFFF, Math.round(dur * 0.7)),
    rawScreenShake(scene, 4, 120),
    rawImpactBurst(
      scene, defenderSprite.x, defenderSprite.y, spec.color, 0xFFFFFF,
      Math.round((10 + rank * 4) * w), dur,
    ),
    directionalParticles(scene, defenderSprite.x, defenderSprite.y, spec.color, Math.round((8 + rank * 3) * w), {
      spread: 16 + rank * 6, duration: dur, shape: spec.particle, accentColor: 0xFFFFFF,
    }),
    // setTintFill, not setTint: a multiply tint toward white is a no-op, and
    // the point of the repeat is that the defender blanks out white.
    rawSpriteFlash(defenderSprite, scene, 0xFFFFFF, 1, true),
  ]);
}

/**
 * Renders any AnimationSpec. Every branch restores sprite state in a finally,
 * because applyDamageAnimation tweens the same sprites straight afterwards.
 *
 * Tier 4 lives here and nowhere else: `renderSpec` installs the outcome gate
 * the shared helpers read, runs its own overlay alongside the body, and adds
 * the super-effective repeat afterwards - so a tier-3 override gets outcome
 * feedback without one line of its own.
 */
export async function renderSpec(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  const { scene, attackerSprite, defenderSprite } = ctx;
  const before = [snapshot(attackerSprite), snapshot(defenderSprite)];
  const rank = INTENSITY_RANK[spec.intensity];
  const d = spec.duration;
  const override = spec.override ? SPEC_OVERRIDES[spec.override] : undefined;

  // Tier 4. Saved and restored rather than stacked: BattleScene awaits one
  // animation at a time, and the only nesting that exists (METRONOME calling
  // through to another move) wants the outer outcome to come back afterwards.
  const prevPlan = activePlan;
  const prevDefender = gateDefender;
  const prevAttacker = gateAttacker;
  const plan = activePlan = outcomePlan(ctx.outcome);
  const prevCutout = gateCutout;
  gateDefender = defenderSprite;
  gateAttacker = attackerSprite;
  // A miss connects with nothing and an immunity is shrugged off, so neither
  // may leave marks ON the defender - including from the handful of overrides
  // that draw their detonation by hand rather than through `impactBurst`. One
  // inverted mask over the defender's footprint, hung on every body drawing by
  // `newGraphics`, covers all 34 of them without touching one of them.
  const cutoutG = plan.skipImpact || plan.grey ? defenderCutout(ctx) : null;
  gateCutout = cutoutG ? cutoutG.createGeometryMask() : null;
  if (gateCutout) gateCutout.setInvertAlpha(true);

  // A tier-3 override owns the whole body, its own sfx included. "Not very
  // effective" swaps the type sfx for a dull thud; over an override, which has
  // already made its own noise, the thud simply lands on top.
  if (plan.dullSfx) soundSystem.dullThud();
  else if (!override) playTypeSfx(spec.sfx);

  try {
    const overlay = outcomeOverlay(spec, ctx);
    // Marked handled here; the `await overlay` below is what actually reports it.
    overlay.catch(() => { /* body errors win */ });
    if (override) {
      await override(spec, ctx);
    } else switch (spec.motion) {
      case 'contact': {
        if (spec.accent === 'rise') {
          await tweenPromise(scene, { targets: attackerSprite, y: attackerSprite.y - 4, duration: 60, yoyo: false });
        }
        await lunge(
          scene, attackerSprite, defenderSprite.x, defenderSprite.y,
          Math.round(d * 0.5), contactFactor(ctx, rank),
        );
        await typeImpact(spec, ctx);
        break;
      }

      case 'barrage': {
        const hits = 2 + rank;
        const step = contactFactor(ctx, rank) * 0.7;
        for (let i = 0; i < hits; i++) {
          await lunge(scene, attackerSprite, defenderSprite.x, defenderSprite.y, Math.round(d * 0.3 / hits), step);
          await Promise.all([
            spriteFlash(defenderSprite, scene, spec.color, 1),
            impactBurst(scene, defenderSprite.x, defenderSprite.y, spec.color, spec.accentColor, 9, Math.round(d * 0.22)),
            directionalParticles(scene, defenderSprite.x, defenderSprite.y, spec.color, 6, {
              spread: 16, duration: Math.round(d * 0.25), shape: spec.particle, accentColor: spec.accentColor,
            }),
          ]);
        }
        break;
      }

      case 'projectile': {
        const shots = 1 + rank;
        const travel = Math.round(d * 0.5 / shots);
        for (let i = 0; i < shots; i++) {
          await arcProjectile(
            scene, attackerSprite.x, attackerSprite.y - 2, defenderSprite.x, defenderSprite.y,
            spec.color, 7 + rank, travel, 14 + i * 4, spec.particle, spec.accentColor,
          );
        }
        await typeImpact(spec, ctx);
        break;
      }

      case 'beam': {
        const width = 6 + rank * 2;
        await Promise.all([
          typeBeam(
            scene, attackerSprite.x, attackerSprite.y - 2, defenderSprite.x, defenderSprite.y,
            spec.color, spec.accentColor, width, Math.round(d * 0.6),
          ),
          emitterAlong(
            scene, attackerSprite.x, attackerSprite.y - 2, defenderSprite.x, defenderSprite.y,
            spec.color, spec.accentColor, 5 + rank * 2, Math.round(d * 0.6), spec.particle,
          ),
        ]);
        await typeImpact(spec, ctx);
        break;
      }

      case 'status-cloud': {
        await directionalParticles(scene, attackerSprite.x, attackerSprite.y - 4, spec.color, 12, {
          dirX: (defenderSprite.x - attackerSprite.x) / 90,
          dirY: (defenderSprite.y - attackerSprite.y) / 90,
          spread: 46, duration: Math.round(d * 0.65),
          shape: spec.particle, accentColor: spec.accentColor, wobble: 2,
        });
        await Promise.all([
          impactBurst(scene, defenderSprite.x, defenderSprite.y, spec.color, spec.accentColor, 12, Math.round(d * 0.35)),
          sparkle(scene, defenderSprite.x, defenderSprite.y, spec.accentColor, 5, Math.round(d * 0.35)),
          spriteFlash(defenderSprite, scene, spec.color, 2),
        ]);
        break;
      }

      case 'self-aura': {
        await Promise.all([
          gather(spec, ctx, Math.round(d * 0.7)),
          ring(scene, attackerSprite.x, attackerSprite.y, spec.color, 26, Math.round(d * 0.7), 2),
          sparkle(scene, attackerSprite.x, attackerSprite.y, spec.accentColor, 5, Math.round(d * 0.7)),
        ]);
        await Promise.all([
          impactBurst(scene, attackerSprite.x, attackerSprite.y, spec.color, spec.accentColor, 12, Math.round(d * 0.28)),
          spriteFlash(attackerSprite, scene, spec.color, 2),
        ]);
        break;
      }

      case 'special-strike': {
        // Wind-up with motes gathering (an empty squash showed nothing at all),
        // then one hard cut, then the impact.
        const windUp = Math.round(d * 0.34);
        const cut = Math.round(d * 0.3);
        const g = newGraphics(scene);
        await Promise.all([
          // The motes keep swirling through the cut: an empty squash frame is
          // what made HORN DRILL measure as a blank screen.
          gather(spec, ctx, windUp + cut),
          (async () => {
            await tweenPromise(scene, {
              targets: attackerSprite, scaleX: 1.2, scaleY: 0.85,
              duration: Math.round(windUp / 2), yoyo: true, ease: 'Sine.easeOut',
            });
            await animateFrames(scene, cut, t => {
              g.clear();
              g.setAlpha(t < 0.75 ? 1 : Math.max(0, 1 - (t - 0.75) / 0.25));
              const slash = (lw: number, c: number, a: number): void => {
                g.lineStyle(lw, c, a);
                g.beginPath();
                g.moveTo(defenderSprite.x - 26, defenderSprite.y - 26);
                g.lineTo(defenderSprite.x + 26, defenderSprite.y + 26);
                g.strokePath();
              };
              slash(13, spec.color, 0.6);
              slash(7, spec.color, 1);
              slash(2, spec.accentColor, 1);
            });
          })(),
        ]);
        g.destroy();
        // No full-screen colour wash here: at 0.6 alpha it turns the whole
        // frame into a pale version of the type colour, which reads weaker
        // than the hit itself.
        await Promise.all([
          screenShake(scene, 6, 140),
          typeImpact(spec, ctx, 1.6),
        ]);
        break;
      }

      case 'charge': {
        // 0.38 + 0.26 + the impact, not 0.45 + 0.3: each await costs a frame of
        // timer granularity on top of its budget, and at 0.45/0.3 the heavy
        // charge moves (SKY ATTACK) overran the 900 ms cap.
        await gather(spec, ctx, Math.round(d * 0.38));
        await Promise.all([
          typeBeam(
            scene, attackerSprite.x, attackerSprite.y - 2, defenderSprite.x, defenderSprite.y,
            spec.color, spec.accentColor, 8, Math.round(d * 0.26),
          ),
          lunge(scene, attackerSprite, defenderSprite.x, defenderSprite.y, Math.round(d * 0.26), contactFactor(ctx, rank)),
        ]);
        await typeImpact(spec, ctx, 1.2);
        break;
      }

      case 'bind': {
        await Promise.all([
          ring(scene, defenderSprite.x, defenderSprite.y, spec.color, 26, Math.round(d * 0.6), 3, true),
          directionalParticles(scene, defenderSprite.x, defenderSprite.y, spec.color, 8, {
            spread: 22, duration: Math.round(d * 0.6), shape: spec.particle, accentColor: spec.accentColor,
          }),
        ]);
        await Promise.all([
          impactBurst(scene, defenderSprite.x, defenderSprite.y, spec.color, spec.accentColor, 13, Math.round(d * 0.25)),
          spriteFlash(defenderSprite, scene, spec.color, 2),
          tweenPromise(scene, {
            targets: defenderSprite, scaleX: 0.85, scaleY: 1.1,
            duration: Math.round(d * 0.2), yoyo: true,
          }),
        ]);
        break;
      }

      case 'drain': {
        await arcProjectile(
          scene, attackerSprite.x, attackerSprite.y - 2, defenderSprite.x, defenderSprite.y,
          spec.color, 8, Math.round(d * 0.3), 16, spec.particle, spec.accentColor,
        );
        await typeImpact(spec, ctx, 0.9);
        await Promise.all([
          emitterAlong(
            scene, defenderSprite.x, defenderSprite.y, attackerSprite.x, attackerSprite.y,
            spec.color, spec.accentColor, 8, Math.round(d * 0.35), spec.particle,
          ),
          spriteFlash(attackerSprite, scene, spec.color, 2),
        ]);
        break;
      }

      case 'burst': {
        await gather(spec, ctx, Math.round(d * 0.3));
        await Promise.all([
          screenFlash(scene, 0xFFFFFF, 90),
          screenShake(scene, 8, Math.round(d * 0.5)),
          ring(scene, attackerSprite.x, attackerSprite.y, spec.color, 70, Math.round(d * 0.5), 3),
          impactBurst(scene, attackerSprite.x, attackerSprite.y, spec.color, spec.accentColor, 22, Math.round(d * 0.45)),
          directionalParticles(scene, attackerSprite.x, attackerSprite.y, spec.color, 18, {
            spread: 52, duration: Math.round(d * 0.55), shape: spec.particle, accentColor: spec.accentColor,
          }),
        ]);
        await typeImpact(spec, ctx, 1.4);
        break;
      }
    }
    await overlay;
    if (plan.repeat > 0) await superEffectiveRepeat(spec, ctx);
  } finally {
    activePlan = prevPlan;
    gateDefender = prevDefender;
    gateAttacker = prevAttacker;
    if (gateCutout) gateCutout.destroy();
    gateCutout = prevCutout;
    if (cutoutG) cutoutG.destroy();
    before.forEach(restore);
  }
}

// === Main Entry Point ===

/**
 * Every move in the game, drawn from its resolved spec: tier 1/2 generic body,
 * or the tier-3 override when the resolver named one. There is no per-move
 * registry behind this any more - `resolveAnimation` covers all 165 moves.
 */
export async function playMoveAnimation(moveId: number, ctx: AnimationContext): Promise<void> {
  await renderSpec(resolveAnimation(moveId), ctx);
}
