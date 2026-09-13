/**
 * Tier-3 per-move override animations.
 *
 * `moveAnimationSpec.MOVE_OVERRIDES` names an override key per iconic move;
 * this file owns the hand-written function behind each key and registers it
 * with `registerSpecOverride`, which `renderSpec` consults BEFORE the generic
 * tier-1/2 body (see docs/battle-animations-design.md, tier 3). Adding the next
 * override is one function plus one `registerSpecOverride` line.
 *
 * Registration (rather than MoveAnimations importing this file) keeps the
 * dependency one-way: overrides -> MoveAnimations, exactly like the batch files.
 * `scenes/BattleScene.ts` imports `systems/animations`, which imports this.
 */

import Phaser from 'phaser';

import { AnimationSpec } from '../../logic/moveAnimationSpec';
import { soundSystem } from '../SoundSystem';
import {
  AnimationContext,
  delay,
  directionalParticles,
  impactBurst,
  registerSpecOverride,
  screenFlash,
  screenShake,
  spriteFlash,
  tweenPromise,
} from '../MoveAnimations';

const YELLOW = 0xFFCC00;
const WHITE = 0xFFFFFF;
/** Dark amber outline. The battle sky is #f8f8f8, so a bolt needs a dark edge
 *  or it simply is not there - a white core on a white sky is invisible. */
const EDGE = 0x3A2A00;
/** Storm veil: a deep blue-grey, not black, so the sprites stay readable. */
const STORM = 0x1A2038;

const GAME_W = 160;

interface Pt { x: number; y: number }

function newG(scene: Phaser.Scene, depth: number): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  g.setDepth(depth);
  g.setScrollFactor(0);
  return g;
}

function strokePath(
  g: Phaser.GameObjects.Graphics,
  pts: Pt[],
  width: number,
  color: number,
  alpha = 1,
): void {
  g.lineStyle(width, color, alpha);
  g.beginPath();
  g.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
  g.strokePath();
}

/** A jagged top-to-bottom spine from (x0, y0) to (x1, y1). */
function spine(x0: number, y0: number, x1: number, y1: number, segs: number, jitter: number): Pt[] {
  const pts: Pt[] = [{ x: Math.round(x0), y: Math.round(y0) }];
  for (let i = 1; i < segs; i++) {
    const t = i / segs;
    pts.push({
      x: Math.round(x0 + (x1 - x0) * t + (Math.random() - 0.5) * jitter * 2),
      y: Math.round(y0 + (y1 - y0) * t),
    });
  }
  pts.push({ x: Math.round(x1), y: Math.round(y1) });
  return pts;
}

/** A short branch peeling off `from`, going down and out. */
function fork(from: Pt, dir: number, len: number): Pt[] {
  return [
    from,
    { x: Math.round(from.x + dir * len * 0.7), y: Math.round(from.y + len * 0.45) },
    { x: Math.round(from.x + dir * len * 1.2), y: Math.round(from.y + len * 1.05) },
  ];
}

/**
 * One sky-to-ground bolt: a forked polyline drawn three times into a single
 * Graphics - dark edge, yellow body, white-hot core - held at full alpha for
 * `hold` ms so it is actually seen, then faded over `fade` ms.
 */
function skyBolt(
  scene: Phaser.Scene,
  xTop: number,
  xBottom: number,
  yBottom: number,
  hold: number,
  fade: number,
): Promise<void> {
  const g = newG(scene, 880);
  const path = spine(xTop, -2, xBottom, yBottom, 7, 7);
  const forks = [
    fork(path[2], Math.random() < 0.5 ? -1 : 1, 11),
    fork(path[4], Math.random() < 0.5 ? -1 : 1, 9),
  ];

  // Outer glow, then the dark edge, then the body, then the core. Painting the
  // edge under the body is what makes the bolt read against the pale sky.
  strokePath(g, path, 11, YELLOW, 0.28);
  strokePath(g, path, 8, EDGE, 0.95);
  for (const f of forks) strokePath(g, f, 5, EDGE, 0.9);
  strokePath(g, path, 5, YELLOW, 1);
  for (const f of forks) strokePath(g, f, 3, YELLOW, 1);
  strokePath(g, path, 2, WHITE, 1);
  for (const f of forks) strokePath(g, f, 1, WHITE, 1);

  return delay(scene, hold)
    .then(() => tweenPromise(scene, { targets: g, alpha: 0, duration: fade }))
    .then(() => { g.destroy(); });
}

/** The sky going dark before the strike, then lifting. */
function stormVeil(scene: Phaser.Scene, peak: number, inMs: number, holdMs: number, outMs: number): Promise<void> {
  const g = newG(scene, 870);
  g.fillStyle(STORM, 1);
  g.fillRect(0, 0, GAME_W, 144);
  g.setAlpha(0);
  return tweenPromise(scene, { targets: g, alpha: peak, duration: inMs })
    .then(() => delay(scene, holdMs))
    .then(() => tweenPromise(scene, { targets: g, alpha: 0, duration: outMs }))
    .then(() => { g.destroy(); });
}

/** Residual charge over the struck sprite after the bolts are gone. */
function afterglow(scene: Phaser.Scene, x: number, y: number, duration: number): Promise<void> {
  const g = newG(scene, 875);
  const arcs = [0, 1, 2].map(i => ({ ang: (i / 3) * Math.PI * 2, r: 13 + i * 3 }));
  let t = 0;
  const step = 32;
  return new Promise<void>(resolve => {
    const ev = scene.time.addEvent({
      delay: step,
      loop: true,
      callback: () => {
        t += step / duration;
        if (t >= 1) { ev.remove(); g.destroy(); resolve(); return; }
        g.clear();
        g.setAlpha(1 - t);
        for (const a of arcs) {
          const px = Math.round(x + Math.cos(a.ang + t * 7) * a.r);
          const py = Math.round(y + Math.sin(a.ang + t * 7) * a.r * 0.7);
          strokePath(g, spine(px, py - 5, px, py + 5, 3, 3), 3, EDGE, 0.8);
          strokePath(g, spine(px, py - 5, px, py + 5, 3, 3), 1, YELLOW, 1);
        }
      },
    });
  });
}

/**
 * ID 87 THUNDER - sky-to-ground lightning.
 *
 * Deliberately NOT the attacker-to-defender arc that THUNDERBOLT (85) and
 * THUNDER SHOCK (84) render: the sky darkens, three forked bolts fall from the
 * top edge onto the defender at staggered x offsets, the third lands with a
 * white flash and a shake, and the charge crackles over the target afterwards.
 * The attacker is not involved at all, which is the whole point.
 */
async function renderThunder(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  const { scene, defenderSprite } = ctx;
  const d = spec.duration; // 1000 ms via OVERRIDE_DURATION

  // Bolts always fall from the top edge, for either side's Pokemon. Offsets are
  // clamped so a strike on the player's Pokemon (x = 36) never wanders across
  // the enemy's side of the field, and vice versa.
  const cx = Phaser.Math.Clamp(Math.round(defenderSprite.x), 24, GAME_W - 24);
  const groundY = Math.round(defenderSprite.y) + 4;
  const bolts = [
    { dx: -14, t: Math.round(d * 0.14) },
    { dx: 12, t: Math.round(d * 0.29) },
    { dx: 0, t: Math.round(d * 0.44) },
  ];
  const hold = Math.round(d * 0.17);  // ~170 ms at full alpha before any fade
  const fade = Math.round(d * 0.20);

  soundSystem.thunderZap();

  const jobs: Promise<void>[] = [
    // Sky darkens first: a fast, punchy beat that lifts as the first bolt
    // lands, so the middle of the animation is the bolts and nothing else.
    stormVeil(scene, 0.58, Math.round(d * 0.07), Math.round(d * 0.06), Math.round(d * 0.09)),
  ];

  for (const b of bolts) {
    jobs.push(delay(scene, b.t).then(() => skyBolt(
      scene,
      Phaser.Math.Clamp(cx + b.dx * 1.6, 8, GAME_W - 8),
      cx + b.dx,
      groundY,
      hold,
      fade,
    )));
  }

  // Impact rides the third bolt.
  jobs.push(delay(scene, bolts[2].t + 30).then(async () => {
    soundSystem.thunderZap();
    await Promise.all([
      screenFlash(scene, WHITE, Math.round(d * 0.09)),
      screenShake(scene, 6, Math.round(d * 0.18)),
      spriteFlash(defenderSprite, scene, YELLOW, 3),
      impactBurst(scene, defenderSprite.x, defenderSprite.y, YELLOW, WHITE, 16, Math.round(d * 0.28)),
      directionalParticles(scene, defenderSprite.x, defenderSprite.y, YELLOW, 14, {
        spread: 30, duration: Math.round(d * 0.34), shape: 'bolt', accentColor: WHITE,
      }),
    ]);
  }));

  jobs.push(delay(scene, Math.round(d * 0.62))
    .then(() => afterglow(scene, defenderSprite.x, defenderSprite.y, Math.round(d * 0.34))));

  await Promise.all(jobs);
}

registerSpecOverride('thunder', renderThunder);
