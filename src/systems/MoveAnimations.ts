import Phaser from 'phaser';

import { soundSystem } from './SoundSystem';
import {
  AnimationSpec,
  ParticleShape,
  SfxId,
  TYPE_VOCAB,
  resolveAnimation,
} from '../logic/moveAnimationSpec';

// === Types ===

export interface AnimationContext {
  scene: Phaser.Scene;
  attackerSprite: Phaser.GameObjects.Sprite;
  defenderSprite: Phaser.GameObjects.Sprite;
  isPlayer: boolean; // true = player attacking (bottom-left → top-right)
}

export type MoveAnimationFn = (ctx: AnimationContext) => Promise<void>;

// === Registry ===

const MOVE_ANIMATIONS: Record<number, MoveAnimationFn> = {};

export function registerAnimation(moveId: number, fn: MoveAnimationFn): void {
  MOVE_ANIMATIONS[moveId] = fn;
}

// === Type Color Map ===

/**
 * Derived from TYPE_VOCAB (src/logic/moveAnimationSpec.ts), which is the single
 * source of colour truth. Kept as a named export because the batch animation
 * files still import it.
 */
export const TYPE_COLORS: Record<string, number> = Object.fromEntries(
  Object.entries(TYPE_VOCAB).map(([type, vocab]) => [type, vocab.color]),
) as Record<string, number>;

// === Helper Utilities ===

export function delay(scene: Phaser.Scene, ms: number): Promise<void> {
  return new Promise(resolve => {
    scene.time.delayedCall(ms, resolve);
  });
}

export function tweenPromise(scene: Phaser.Scene, config: Phaser.Types.Tweens.TweenBuilderConfig): Promise<void> {
  return new Promise(resolve => {
    scene.tweens.add({
      ...config,
      onComplete: () => resolve(),
    });
  });
}

export function screenFlash(scene: Phaser.Scene, color: number, duration: number): Promise<void> {
  const overlay = scene.add.graphics();
  overlay.setDepth(900);
  overlay.setScrollFactor(0);
  overlay.fillStyle(color, 0.6);
  overlay.fillRect(0, 0, 160, 144);
  overlay.setAlpha(1);

  return tweenPromise(scene, {
    targets: overlay,
    alpha: 0,
    duration,
    onComplete: () => { overlay.destroy(); },
  }).then(() => { overlay.destroy(); });
}

export function screenShake(scene: Phaser.Scene, intensity: number, duration: number): Promise<void> {
  scene.cameras.main.shake(duration, intensity / 160);
  return delay(scene, duration);
}

export function spriteFlash(sprite: Phaser.GameObjects.Sprite, scene: Phaser.Scene, color: number, count: number): Promise<void> {
  return new Promise(resolve => {
    let flashes = 0;
    const doFlash = () => {
      sprite.setTint(color);
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

export function projectile(
  scene: Phaser.Scene,
  fromSprite: Phaser.GameObjects.Sprite,
  toSprite: Phaser.GameObjects.Sprite,
  color: number,
  size: number,
  speed: number,
): Promise<void> {
  const g = scene.add.graphics();
  g.setDepth(800);
  g.setScrollFactor(0);
  g.fillStyle(color, 1);
  g.fillCircle(0, 0, size);
  g.setPosition(fromSprite.x, fromSprite.y);

  const dist = Phaser.Math.Distance.Between(fromSprite.x, fromSprite.y, toSprite.x, toSprite.y);
  const duration = (dist / speed) * 1000;

  return tweenPromise(scene, {
    targets: g,
    x: toSprite.x,
    y: toSprite.y,
    duration,
  }).then(() => { g.destroy(); });
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

export function beam(
  scene: Phaser.Scene,
  fromSprite: Phaser.GameObjects.Sprite,
  toSprite: Phaser.GameObjects.Sprite,
  color: number,
  width: number,
  duration: number,
): Promise<void> {
  const g = scene.add.graphics();
  g.setDepth(800);
  g.setScrollFactor(0);
  g.lineStyle(width, color, 1);
  g.beginPath();
  g.moveTo(fromSprite.x, fromSprite.y);
  g.lineTo(toSprite.x, toSprite.y);
  g.strokePath();
  g.setAlpha(1);

  return tweenPromise(scene, {
    targets: g,
    alpha: 0,
    duration,
  }).then(() => { g.destroy(); });
}

export function particles(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: number,
  count: number,
  spread: number,
  duration: number,
): Promise<void> {
  const graphics: Phaser.GameObjects.Graphics[] = [];
  for (let i = 0; i < count; i++) {
    const g = scene.add.graphics();
    g.setDepth(800);
    g.setScrollFactor(0);
    g.fillStyle(color, 1);
    const s = 1 + Math.random() * 2;
    g.fillRect(-s / 2, -s / 2, s, s);
    g.setPosition(x, y);
    graphics.push(g);
  }

  const promises = graphics.map(g => {
    const tx = x + (Math.random() - 0.5) * spread * 2;
    const ty = y + (Math.random() - 0.5) * spread * 2;
    return tweenPromise(scene, {
      targets: g,
      x: tx,
      y: ty,
      alpha: 0,
      duration: duration + Math.random() * 100,
    }).then(() => { g.destroy(); });
  });

  return Promise.all(promises).then(() => {});
}

export function sparkle(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: number,
  count: number,
  duration: number,
): Promise<void> {
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

export function lightning(
  scene: Phaser.Scene,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  color: number,
  duration: number,
): Promise<void> {
  const g = scene.add.graphics();
  g.setDepth(800);
  g.setScrollFactor(0);

  // Build zigzag path
  const segments = 6;
  const dx = (endX - startX) / segments;
  const dy = (endY - startY) / segments;

  g.lineStyle(2, color, 1);
  g.beginPath();
  g.moveTo(startX, startY);

  for (let i = 1; i < segments; i++) {
    const jitter = (Math.random() - 0.5) * 12;
    g.lineTo(startX + dx * i + jitter, startY + dy * i + jitter * 0.5);
  }
  g.lineTo(endX, endY);
  g.strokePath();

  return tweenPromise(scene, {
    targets: g,
    alpha: 0,
    duration,
    delay: duration * 0.3,
  }).then(() => { g.destroy(); });
}

// === Thunder Shock Animation (ID 84) ===

registerAnimation(84, async (ctx: AnimationContext) => {
  const { scene, attackerSprite, defenderSprite } = ctx;

  // 1. Lightning bolt from attacker to defender
  await lightning(
    scene,
    attackerSprite.x, attackerSprite.y - 4,
    defenderSprite.x, defenderSprite.y,
    0xFFCC00, 300,
  );

  // 2-4. Sparks, screen flash and the defender's tint-flash all land together.
  // Run sequentially these four stages total >900 ms, which busts the cap the
  // resolver enforces for every move; they read better overlapped anyway.
  await Promise.all([
    particles(scene, defenderSprite.x, defenderSprite.y, 0xFFCC00, 6, 12, 200),
    screenFlash(scene, 0xFFCC00, 50),
    spriteFlash(defenderSprite, scene, 0xFFCC00, 2),
  ]);
});

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

function newGraphics(scene: Phaser.Scene, depth = 800): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  g.setDepth(depth);
  g.setScrollFactor(0);
  return g;
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
 * The plain `beam()` above starts fading on frame one and is 1-4 px wide, which
 * is why the generic renderer's first pass looked like a pale scratch instead
 * of a beam. Nothing in the legacy batches uses this one.
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
export function impactBurst(
  scene: Phaser.Scene,
  x: number, y: number,
  color: number,
  accentColor: number,
  radius: number,
  duration: number,
): Promise<void> {
  const g = newGraphics(scene, 810);
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
  const count = Math.max(6, Math.round((8 + rank * 3) * weight));
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

/**
 * Renders any AnimationSpec. Every branch restores sprite state in a finally,
 * because applyDamageAnimation tweens the same sprites straight afterwards.
 */
export async function renderSpec(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  const { scene, attackerSprite, defenderSprite } = ctx;
  const before = [snapshot(attackerSprite), snapshot(defenderSprite)];
  const rank = INTENSITY_RANK[spec.intensity];
  const d = spec.duration;

  playTypeSfx(spec.sfx);

  try {
    switch (spec.motion) {
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
        await gather(spec, ctx, Math.round(d * 0.45));
        await Promise.all([
          typeBeam(
            scene, attackerSprite.x, attackerSprite.y - 2, defenderSprite.x, defenderSprite.y,
            spec.color, spec.accentColor, 8, Math.round(d * 0.3),
          ),
          lunge(scene, attackerSprite, defenderSprite.x, defenderSprite.y, Math.round(d * 0.3), contactFactor(ctx, rank)),
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
  } finally {
    before.forEach(restore);
  }
}

// === Main Entry Point ===

export async function playMoveAnimation(moveId: number, ctx: AnimationContext): Promise<void> {
  const animFn = MOVE_ANIMATIONS[moveId];
  if (animFn) {
    await animFn(ctx);
    return;
  }
  await renderSpec(resolveAnimation(moveId), ctx);
}
