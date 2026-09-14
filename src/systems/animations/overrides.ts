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
  emitterAlong,
  impactBurst,
  registerSpecOverride,
  ring,
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

// ===========================================================================
// Two-turn moves (FLY / DIG / SOLAR BEAM)
// ===========================================================================
//
// The engine does NOT run these over two turns. `BattleScene.doExecuteMove`
// calls `playMoveAnimation` exactly once per move use, inside the "X used
// MOVE!" text callback, and then applies damage immediately;
// `MoveEffect.CHARGE` appears nowhere else in the scene except in the
// SKIP_SECONDARY list. So there is no "release turn" to render on, and
// `spec.twoTurn` is always 'charge' - the resolver never emits 'release'.
// Each override therefore plays gather AND release inside the one promise,
// which is exactly what docs/battle-animations-design.md section 3 asks for.

/** Runs `onFrame(t)`, t going 0 -> 1 over `duration`, on one 16 ms timer. */
function frames(scene: Phaser.Scene, duration: number, onFrame: (t: number) => void): Promise<void> {
  return new Promise(resolve => {
    const start = scene.time.now;
    const ev = scene.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        const t = Math.min(1, (scene.time.now - start) / Math.max(1, duration));
        onFrame(t);
        if (t >= 1) { ev.remove(); resolve(); }
      },
    });
  });
}

const FLYING = 0x8899FF;
const FLYING_PALE = 0xDDE4FF;
const FLYING_EDGE = 0x2B3166;
const GROUND = 0xDDBB55;
const GROUND_DARK = 0x997733;
const GROUND_EDGE = 0x4A3612;
const GRASS = 0x44BB44;
const GRASS_PALE = 0xCCFF66;
const GRASS_EDGE = 0x143D14;
const NORMAL = 0xA8A878;
const NORMAL_PALE = 0xE8E8D0;
const NORMAL_EDGE = 0x40402C;
// A blast is fire, whatever the move's type says (operator, 2026-09-14): a
// white-hot heart, then yellow -> orange -> red out to a dark red rim that
// keeps every ring crisp against the #f8f8f8 sky.
const FIRE_YELLOW = 0xFFCC00;
// 0xFF7722, not 0xFF8800: in a nearest-colour vote against the 15 type colours
// 0xFF8800 is marginally CLOSER to ELECTRIC's 0xFFCC00 than to FIRE's 0xFF4422,
// so the mid band of the fireball read as electric yellow to the e2e (and, at
// that size, to the eye). A notch deeper is unambiguously fire.
const FIRE_ORANGE = 0xFF7722;
const FIRE_RED = 0xFF4422;
const FIRE_EDGE = 0x5A1A00;

/** Sprites are 32 px tall, so the feet of a sprite drawn at y sit at y + 14. */
const FOOT_OFFSET = 14;

/**
 * ID 19 FLY - the attacker leaves the field entirely, then dives back in.
 *
 * The point of the move is the ABSENCE: between the launch and the dive there
 * is no attacker on screen at all, which no generic body can do (the generic
 * charge motion never moves the attacker further than a lunge).
 */
async function renderFly(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  const { scene, attackerSprite, defenderSprite } = ctx;
  const d = spec.duration; // 1000 ms via OVERRIDE_DURATION
  const homeX = attackerSprite.x;
  const homeY = attackerSprite.y;
  const away = ctx.isPlayer ? -1 : 1; // the side the dive comes in from

  soundSystem.whoosh();

  // 1. Crouch, then straight up and out through the top edge (0 -> 20 %).
  await tweenPromise(scene, {
    targets: attackerSprite, y: homeY + 3, scaleY: 0.84,
    duration: Math.round(d * 0.04), ease: 'Sine.easeOut',
  });
  await Promise.all([
    tweenPromise(scene, {
      targets: attackerSprite, y: -26, scaleY: 1,
      duration: Math.round(d * 0.11), ease: 'Quad.easeIn',
    }),
    directionalParticles(scene, homeX, homeY + 8, FLYING, 10, {
      dirY: 1, spread: 20, duration: Math.round(d * 0.1),
      shape: 'dash', accentColor: FLYING_PALE,
    }),
  ]);

  // 2. Absent (15 -> 30 %). Streaks cross the empty sky so the field still
  //    moves while the attacker is nowhere on it. They are the only thing on
  //    screen, so they are drawn fat and dark-edged rather than as hairlines.
  const sky = newG(scene, 830);
  await frames(scene, Math.round(d * 0.15), t => {
    sky.clear();
    sky.setAlpha(t < 0.85 ? 1 : Math.max(0, 1 - (t - 0.85) / 0.15));
    for (let i = 0; i < 4; i++) {
      const y = 8 + i * 11;
      const x = ((t * 1.3 + i * 0.27) % 1) * (GAME_W + 56) - 28;
      sky.fillStyle(FLYING_EDGE, 1);
      sky.fillRect(Math.round(x) - 1, y - 2, 30, 7);
      sky.fillStyle(FLYING, 1);
      sky.fillRect(Math.round(x), y - 1, 28, 5);
      sky.fillStyle(FLYING_PALE, 1);
      sky.fillRect(Math.round(x) + 20, y - 1, 8, 5);
    }
  });
  sky.destroy();

  // 3. The dive (40 -> 54 %): back in from off the top, onto the defender.
  soundSystem.whoosh();
  attackerSprite.setPosition(defenderSprite.x + away * 16, -26);
  const trail = newG(scene, 806);
  await Promise.all([
    tweenPromise(scene, {
      targets: attackerSprite, x: defenderSprite.x, y: defenderSprite.y - 4,
      duration: Math.round(d * 0.12), ease: 'Quad.easeIn',
    }),
    frames(scene, Math.round(d * 0.12), () => {
      trail.clear();
      for (let i = 1; i <= 4; i++) {
        const x = Math.round(attackerSprite.x - away * i * 3);
        const y = Math.round(attackerSprite.y - i * 9);
        trail.fillStyle(FLYING_EDGE, 0.9 - i * 0.15);
        trail.fillRect(x - 6, y - 2, 13, 5);
        trail.fillStyle(FLYING, 1 - i * 0.18);
        trail.fillRect(x - 5, y - 1, 11, 3);
      }
    }),
  ]);
  trail.destroy();

  // 4. The hit, then feathers drifting down over the defender for the rest of
  //    the budget - the move has to still read at the tail of the animation.
  soundSystem.hit();
  await Promise.all([
    impactBurst(scene, defenderSprite.x, defenderSprite.y, FLYING, FLYING_PALE, 17, Math.round(d * 0.26)),
    directionalParticles(scene, defenderSprite.x, defenderSprite.y, FLYING, 14, {
      spread: 30, duration: Math.round(d * 0.26), shape: 'dash', accentColor: FLYING_PALE,
    }),
    spriteFlash(defenderSprite, scene, FLYING, 3),
    screenShake(scene, 5, Math.round(d * 0.16)),
    // Feathers keep drifting over the defender for the rest of the budget, so
    // the hit is still legible at the tail of the animation instead of the
    // field snapping back to idle the moment the burst ends.
    (async () => {
      const feathers = newG(scene, 812);
      const n = 7;
      try {
        await frames(scene, Math.round(d * 0.38), t => {
          feathers.clear();
          for (let i = 0; i < n; i++) {
            const ph = (t + i / n) % 1;
            const x = Math.round(defenderSprite.x + Math.sin((i * 2.1) + t * 4) * 13);
            const y = Math.round(defenderSprite.y - 14 + ph * 26);
            const tilt = (i % 2) ? 1 : -1;
            feathers.fillStyle(FLYING_EDGE, 1);
            feathers.fillRect(x - 4, y - 1, 9, 4);
            feathers.fillStyle(FLYING, 1);
            feathers.fillRect(x - 3, y, 7, 2);
            feathers.fillStyle(FLYING_PALE, 1);
            feathers.fillRect(x + tilt, y, 2, 2);
          }
        });
      } finally {
        feathers.destroy();
      }
    })(),
    // The attacker bounces off and flies home while the feathers fall.
    (async () => {
      await delay(scene, Math.round(d * 0.08));
      await tweenPromise(scene, {
        targets: attackerSprite, x: homeX, y: homeY,
        duration: Math.round(d * 0.14), ease: 'Sine.easeOut',
      });
    })(),
  ]);
}

/**
 * ID 91 DIG - the attacker sinks out of sight and comes up under the defender.
 *
 * The sprite is masked to the ground line while it is below it, so it really
 * is gone rather than merely faded; a mound crawls across the field in the
 * gap, which is the only thing on screen while the attacker is underground.
 */
async function renderDig(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  const { scene, attackerSprite, defenderSprite } = ctx;
  const d = spec.duration; // 1000 ms via OVERRIDE_DURATION
  const homeX = attackerSprite.x;
  const homeY = attackerSprite.y;
  const fromGround = Math.round(homeY) + FOOT_OFFSET;
  const toGround = Math.round(defenderSprite.y) + FOOT_OFFSET;

  // Geometry mask: everything above the ground line is drawn, the rest is not.
  const shape = scene.make.graphics({ x: 0, y: 0 }, false);
  const maskTo = (groundY: number): void => {
    shape.clear();
    shape.fillStyle(0xFFFFFF, 1);
    shape.fillRect(0, 0, GAME_W, groundY);
  };
  maskTo(fromGround);
  const mask = shape.createGeometryMask();
  attackerSprite.setMask(mask);

  soundSystem.rumble();
  try {
    // 1. Sink (0 -> 20 %), throwing grit up out of the hole.
    const hole = newG(scene, 795);
    await Promise.all([
      tweenPromise(scene, {
        targets: attackerSprite, y: homeY + 38,
        duration: Math.round(d * 0.16), ease: 'Quad.easeIn',
      }),
      directionalParticles(scene, homeX, fromGround, GROUND, 12, {
        dirY: -1, spread: 20, duration: Math.round(d * 0.18),
        shape: 'grit', accentColor: GROUND_DARK, gravity: 1.4,
      }),
      frames(scene, Math.round(d * 0.16), t => {
        hole.clear();
        const w = Math.round(6 + t * 9);
        hole.fillStyle(GROUND_EDGE, 1);
        hole.fillEllipse(homeX, fromGround + 1, w * 2, 7);
        hole.fillStyle(GROUND_DARK, 1);
        hole.fillEllipse(homeX, fromGround, w * 2 - 4, 5);
      }),
    ]);

    // 2. Underground (20 -> 52 %): a mound travels along the ground line.
    await frames(scene, Math.round(d * 0.26), t => {
      hole.clear();
      const x = Math.round(homeX + (defenderSprite.x - homeX) * t);
      const y = Math.round(fromGround + (toGround - fromGround) * t);
      const lift = 4 + Math.sin(t * Math.PI * 5) * 2;
      hole.fillStyle(GROUND_EDGE, 1);
      hole.fillEllipse(x, y, 22, 10 + lift);
      hole.fillStyle(GROUND, 1);
      hole.fillEllipse(x, y - 1, 17, 7 + lift);
      hole.fillStyle(GROUND_DARK, 1);
      hole.fillEllipse(x - 5, y - 1, 6, 4);
    });
    hole.destroy();

    // 3. Erupt under the defender (52 -> 70 %).
    soundSystem.thud();
    maskTo(toGround);
    attackerSprite.setPosition(defenderSprite.x, toGround + 30);
    await Promise.all([
      tweenPromise(scene, {
        targets: attackerSprite, y: defenderSprite.y - 2,
        duration: Math.round(d * 0.15), ease: 'Back.easeOut',
      }),
      directionalParticles(scene, defenderSprite.x, toGround, GROUND, 16, {
        dirY: -1, spread: 30, duration: Math.round(d * 0.2),
        shape: 'grit', accentColor: GROUND_DARK, gravity: 1.1,
      }),
    ]);
    attackerSprite.clearMask(false);

    // 4. The hit (70 -> 100 %), with the ground still settling.
    await Promise.all([
      impactBurst(scene, defenderSprite.x, defenderSprite.y, GROUND, GROUND_DARK, 18, Math.round(d * 0.2)),
      spriteFlash(defenderSprite, scene, GROUND, 3),
      screenShake(scene, 6, Math.round(d * 0.14)),
      directionalParticles(scene, defenderSprite.x, defenderSprite.y, GROUND, 12, {
        spread: 26, duration: Math.round(d * 0.22), shape: 'grit', accentColor: GROUND_DARK, gravity: 1.2,
      }),
      (async () => {
        await delay(scene, Math.round(d * 0.08));
        await tweenPromise(scene, {
          targets: attackerSprite, x: homeX, y: homeY,
          duration: Math.round(d * 0.12), ease: 'Sine.easeOut',
        });
      })(),
    ]);
  } finally {
    attackerSprite.clearMask(false);
    mask.destroy();
    shape.destroy();
  }
}

/**
 * ID 76 SOLAR BEAM - light gathers into a white-hot core, then fires as a
 * thick Grass beam with a wide white core.
 *
 * Distinct from every generic body: no other move builds a core on the
 * attacker for nearly half its budget, and the beam is twice the width of the
 * generic one with a core wide enough to read as "solar" rather than "green".
 */
async function renderSolarBeam(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  const { scene, attackerSprite, defenderSprite } = ctx;
  const d = spec.duration; // 1100 ms via OVERRIDE_DURATION
  const ax = Math.round(attackerSprite.x);
  const ay = Math.round(attackerSprite.y) - 2;
  const dx = Math.round(defenderSprite.x);
  const dy = Math.round(defenderSprite.y);

  soundSystem.beamCharge();

  // 1. Gather (0 -> 42 %): motes spiral in and a core builds on the attacker.
  const g = newG(scene, 820);
  const motes = Array.from({ length: 12 }, (_, i) => ({
    ang: (i / 12) * Math.PI * 2,
    r: 26 + (i % 4) * 7,
    seed: i,
  }));
  await frames(scene, Math.round(d * 0.42), t => {
    g.clear();
    for (const m of motes) {
      const r = m.r * (1 - t * 0.95);
      const x = Math.round(ax + Math.cos(m.ang + t * 3) * r);
      const y = Math.round(ay + Math.sin(m.ang + t * 3) * r * 0.7);
      g.fillStyle(GRASS_EDGE, 1);
      g.fillRect(x - 3, y - 3, 7, 7);
      g.fillStyle(GRASS_PALE, 1);
      g.fillRect(x - 2, y - 2, 5, 5);
      g.fillStyle(WHITE, 1);
      g.fillRect(x - 1, y - 1, 2, 2);
    }
    const core = Math.round(3 + t * t * 11);
    g.fillStyle(GRASS_EDGE, 1);
    g.fillCircle(ax, ay, core + 3);
    g.fillStyle(GRASS, 1);
    g.fillCircle(ax, ay, core + 1);
    g.fillStyle(GRASS_PALE, 1);
    g.fillCircle(ax, ay, Math.max(2, core - 2));
    g.fillStyle(WHITE, 1);
    g.fillCircle(ax, ay, Math.max(1, Math.round(core * 0.45)));
  });
  g.destroy();

  // 2. Fire (42 -> 78 %): a thick beam, wide white core, dark rim so it reads
  //    against the #f8f8f8 sky.
  soundSystem.leafSweep();
  const bm = newG(scene, 815);
  const fire = Math.round(d * 0.36);
  await Promise.all([
    frames(scene, fire, t => {
      bm.clear();
      const grow = Math.min(1, t / 0.18);
      const fade = t > 0.86 ? Math.max(0, 1 - (t - 0.86) / 0.14) : 1;
      const ex = ax + (dx - ax) * grow;
      const ey = ay + (dy - ay) * grow;
      const pulse = 1 + Math.sin(t * 30) * 0.1;
      bm.setAlpha(fade);
      const stroke = (lw: number, c: number, a: number): void => {
        bm.lineStyle(Math.max(1, Math.round(lw)), c, a);
        bm.beginPath();
        bm.moveTo(ax, ay);
        bm.lineTo(ex, ey);
        bm.strokePath();
      };
      stroke(20 * pulse, GRASS_EDGE, 1);   // dark rim
      stroke(16 * pulse, GRASS, 1);        // body
      stroke(9 * pulse, GRASS_PALE, 1);    // hot inner sheath
      stroke(5 * pulse, WHITE, 1);         // wide white core
      bm.fillStyle(GRASS_PALE, 1);
      bm.fillCircle(ax, ay, 9);
      bm.fillStyle(WHITE, 1);
      bm.fillCircle(ax, ay, 5);
    }),
    emitterAlong(scene, ax, ay, dx, dy, GRASS, GRASS_PALE, 9, fire, 'leaf'),
    (async () => {
      await delay(scene, Math.round(fire * 0.45));
      await Promise.all([
        impactBurst(scene, dx, dy, GRASS, GRASS_PALE, 20, Math.round(d * 0.3)),
        spriteFlash(defenderSprite, scene, GRASS, 3),
        screenShake(scene, 5, Math.round(d * 0.16)),
        directionalParticles(scene, dx, dy, GRASS, 16, {
          spread: 32, duration: Math.round(d * 0.32), shape: 'leaf',
          accentColor: GRASS_PALE, wobble: 3,
        }),
      ]);
    })(),
  ]);
  bm.destroy();
}

// ===========================================================================
// Self-KO set-pieces (SELF-DESTRUCT / EXPLOSION)
// ===========================================================================

/**
 * The shared detonation. EXPLOSION is the same set-piece at `scale` 1.4 with
 * one extra strobe flash, so the two are the same idea at two sizes rather
 * than two unrelated animations - and at the 50 % frame EXPLOSION is visibly
 * the bigger of the two.
 *
 * The fireball is fiery rather than Normal-coloured - white heart, yellow,
 * orange, red, dark red rim - because the battle sky is #f8f8f8 and a white
 * blast on its own would be invisible, and because a blast that is not red
 * and orange does not read as an explosion.
 */
async function detonate(
  spec: AnimationSpec,
  ctx: AnimationContext,
  scale: number,
  strobes: number,
): Promise<void> {
  const { scene, attackerSprite, defenderSprite } = ctx;
  const d = spec.duration;
  const ax = Math.round(attackerSprite.x);
  const ay = Math.round(attackerSprite.y);

  // 1. Strobe (0 -> 38 %): white flashes on the attacker, accelerating.
  const halo = newG(scene, 805);
  const strobe = Math.round(d * 0.32);
  await Promise.all([
    frames(scene, strobe, t => {
      halo.clear();
      // Period shrinks as t grows, so the flashes visibly speed up.
      const beats = Math.sin(t * t * strobes * 7);
      // The dim beat is 0.55, not 0.25: at 0.25 the off-beat washes out to a
      // pale smudge on the #f8f8f8 sky, and half the sampled frames land on it.
      const on = beats > 0.2 ? 1 : 0.55;
      const r = Math.round(9 + t * 12);
      halo.setAlpha(on);
      halo.fillStyle(FIRE_EDGE, 1);
      halo.fillCircle(ax, ay, r + 2);
      halo.fillStyle(FIRE_ORANGE, 1);
      halo.fillCircle(ax, ay, r);
      halo.fillStyle(FIRE_YELLOW, 1);
      halo.fillCircle(ax, ay, Math.max(2, r - 5));
      halo.fillStyle(WHITE, 1);
      halo.fillCircle(ax, ay, Math.max(1, Math.round(r * 0.4)));
    }),
    spriteFlash(attackerSprite, scene, FIRE_YELLOW, strobes),
  ]);
  halo.destroy();

  // 2. Detonation (38 -> 78 %): a near-full-field fireball, debris rings.
  soundSystem.boom();
  const maxR = Math.round(70 * scale);
  const blast = newG(scene, 860);
  const blastMs = Math.round(d * 0.38);
  await Promise.all([
    frames(scene, blastMs, t => {
      blast.clear();
      // sqrt growth: the front is fastest at the start, like a real shock.
      // The fireball COLLAPSES at the end instead of fading: fading it over a
      // #f8f8f8 sky turns red and orange into pale tan (and the e2e's nearest
      // colour vote flips from FIRE to GROUND/FIGHTING), so every pixel it
      // draws stays fully saturated right up to the frame it vanishes on.
      const collapse = t < 0.82 ? 1 : Math.max(0, 1 - (t - 0.82) / 0.18);
      const r = Math.round(maxR * Math.sqrt(Math.min(1, t / 0.75)) * collapse);
      blast.fillStyle(FIRE_EDGE, 1);
      blast.fillCircle(ax, ay, r + 3);
      blast.fillStyle(FIRE_RED, 1);
      blast.fillCircle(ax, ay, r);
      blast.fillStyle(FIRE_ORANGE, 1);
      blast.fillCircle(ax, ay, Math.round(r * 0.74));
      blast.fillStyle(FIRE_YELLOW, 1);
      blast.fillCircle(ax, ay, Math.round(r * 0.48));
      blast.fillStyle(WHITE, 1);
      blast.fillCircle(ax, ay, Math.round(r * 0.24));
      // Debris rings riding the front, alternating rim and red so they stay
      // legible both over the fireball and over the bare sky outside it.
      for (let i = 0; i < 3; i++) {
        const phase = (t * 1.4 + i / 3) % 1;
        blast.lineStyle(3, i % 2 ? FIRE_RED : FIRE_EDGE, 1 - phase * 0.4);
        blast.strokeCircle(ax, ay, Math.round(phase * maxR * 1.25));
      }
    }),
    screenFlash(scene, WHITE, Math.round(d * 0.12)),
    screenShake(scene, 8, Math.round(d * 0.26)),
    directionalParticles(scene, ax, ay, FIRE_RED, Math.round(18 * scale), {
      spread: Math.round(56 * scale), duration: Math.round(d * 0.38),
      shape: 'dust', accentColor: FIRE_ORANGE,
    }),
    spriteFlash(defenderSprite, scene, FIRE_ORANGE, 3),
    tweenPromise(scene, {
      targets: attackerSprite, alpha: 0.15,
      duration: Math.round(d * 0.26), ease: 'Quad.easeIn',
    }),
  ]);
  blast.destroy();

  // 3. Debris settling (78 -> 100 %).
  await Promise.all([
    directionalParticles(scene, ax, ay - 6, FIRE_ORANGE, Math.round(10 * scale), {
      dirY: 1, spread: Math.round(34 * scale), duration: Math.round(d * 0.18),
      shape: 'dust', accentColor: FIRE_EDGE, gravity: 1.6,
    }),
    impactBurst(scene, defenderSprite.x, defenderSprite.y, FIRE_RED, FIRE_YELLOW,
      Math.round(14 * scale), Math.round(d * 0.18)),
  ]);
}

/** ID 120 SELF-DESTRUCT. */
async function renderSelfDestruct(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  await detonate(spec, ctx, 1, 3);
}

/** ID 153 EXPLOSION - the same set-piece, 1.4x and one flash longer. */
async function renderExplosion(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  await detonate(spec, ctx, 1.4, 4);
}

// ===========================================================================
// HYPER BEAM
// ===========================================================================

/**
 * ID 63 HYPER BEAM - a charge, a held beam that WIDENS as it is fired, and a
 * recoil that knocks the attacker back.
 *
 * HYPER BEAM is the only Normal move that resolves to the generic `beam`
 * motion, so the generic Normal beam body is otherwise unused - this override
 * replaces it outright. It is deliberately unlike SOLAR BEAM: no gathering
 * halo of motes, a beam that grows instead of one that holds a constant width,
 * and the attacker is thrown backwards at the end.
 */
async function renderHyperBeam(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  const { scene, attackerSprite, defenderSprite } = ctx;
  const d = spec.duration; // 1000 ms via OVERRIDE_DURATION
  const ax = Math.round(attackerSprite.x);
  const ay = Math.round(attackerSprite.y) - 2;
  const dx = Math.round(defenderSprite.x);
  const dy = Math.round(defenderSprite.y);
  const homeX = attackerSprite.x;
  const homeY = attackerSprite.y;

  soundSystem.beamCharge();

  // 1. Charge (0 -> 28 %): a glow swells on the attacker's mouth.
  const glow = newG(scene, 820);
  await frames(scene, Math.round(d * 0.24), t => {
    glow.clear();
    const r = Math.round(2 + t * t * 12);
    glow.fillStyle(NORMAL_EDGE, 1);
    glow.fillCircle(ax, ay, r + 3);
    glow.fillStyle(NORMAL, 1);
    glow.fillCircle(ax, ay, r + 1);
    glow.fillStyle(NORMAL_PALE, 1);
    glow.fillCircle(ax, ay, Math.max(2, r - 1));
    glow.fillStyle(WHITE, 1);
    glow.fillCircle(ax, ay, Math.max(1, Math.round(r * 0.5)));
  });
  glow.destroy();

  // 2. The beam (28 -> 82 %): width 7 -> 22, core 2 -> 9, held the whole time.
  soundSystem.roar();
  const bm = newG(scene, 815);
  const fireMs = Math.round(d * 0.46);
  await Promise.all([
    frames(scene, fireMs, t => {
      bm.clear();
      const grow = Math.min(1, t / 0.12);
      const fade = t > 0.9 ? Math.max(0, 1 - (t - 0.9) / 0.1) : 1;
      const w = 7 + t * 15;                       // the widening
      const jitter = Math.round(Math.sin(t * 40) * 1.5);
      const ex = ax + (dx - ax) * grow;
      const ey = ay + (dy - ay) * grow;
      bm.setAlpha(fade);
      const stroke = (lw: number, c: number): void => {
        bm.lineStyle(Math.max(1, Math.round(lw)), c, 1);
        bm.beginPath();
        bm.moveTo(ax, ay + jitter);
        bm.lineTo(ex, ey);
        bm.strokePath();
      };
      stroke(w + 5, NORMAL_EDGE);
      stroke(w, NORMAL);
      stroke(Math.max(2, w * 0.4), WHITE);
    }),
    emitterAlong(scene, ax, ay, dx, dy, NORMAL, NORMAL_EDGE, 10, fireMs, 'dust'),
    (async () => {
      // The target is pinned under the beam while it is held.
      await delay(scene, Math.round(fireMs * 0.25));
      await Promise.all([
        impactBurst(scene, dx, dy, NORMAL, NORMAL_PALE, 20, Math.round(d * 0.3)),
        spriteFlash(defenderSprite, scene, NORMAL, 4),
        screenShake(scene, 6, Math.round(d * 0.24)),
        directionalParticles(scene, dx, dy, NORMAL, 16, {
          spread: 32, duration: Math.round(d * 0.3), shape: 'dust', accentColor: NORMAL_EDGE,
        }),
      ]);
    })(),
  ]);
  bm.destroy();

  // 3. Recoil (82 -> 100 %): the attacker is knocked back and has to settle -
  //    the animation half of "must recharge!".
  soundSystem.thud();
  const back = ctx.isPlayer ? -7 : 7;
  await tweenPromise(scene, {
    targets: attackerSprite, x: homeX + back, y: homeY + 3,
    duration: Math.round(d * 0.06), ease: 'Quad.easeOut',
  });
  await tweenPromise(scene, {
    targets: attackerSprite, x: homeX, y: homeY,
    duration: Math.round(d * 0.08), ease: 'Sine.easeInOut',
  });
}

registerSpecOverride('fly', renderFly);
registerSpecOverride('dig', renderDig);
registerSpecOverride('solarBeam', renderSolarBeam);
registerSpecOverride('selfDestruct', renderSelfDestruct);
registerSpecOverride('explosion', renderExplosion);
registerSpecOverride('hyperBeam', renderHyperBeam);

// ===========================================================================
// Signature attacks (THUNDERBOLT / SURF / EARTHQUAKE / HYDRO PUMP /
// FIRE BLAST / BLIZZARD / PSYCHIC / NIGHT SHADE)
// ===========================================================================
//
// Each of these eight has a generic sibling that renders through the same
// tier-1/2 motion (THUNDER SHOCK, WATER GUN, BONE CLUB, FLAMETHROWER, ICE
// BEAM, CONFUSION, LICK), so "is it distinct?" is a measurable question, not a
// taste one - `tools/anim-e2e.mjs` diffs every one of them against both its
// sibling and the same spec with the override key stripped.
//
// Palette rule, learned the hard way on the fireballs above: the e2e's TYPED
// check votes each changed pixel for its NEAREST of the 15 type colours, so a
// set-piece has to stay in its own corner of colour space. Two traps in this
// batch:
//   - dark blue goes GHOST long before it goes WATER (0x1155AA already votes
//     GHOST), so the "dark blue edge" on the wave and the jet is 0x1166CC and
//     no deeper.
//   - dark brown goes FIGHTING (GROUND_DARK 0x997733 already does), so
//     EARTHQUAKE's dust has to be bulk 0xDDBB55 with the browns as outline.

const WATER = 0x3399FF;
/** Spray/foam. Pale enough to read as water on the #f8f8f8 sky. */
const WATER_PALE = 0xBBE4FF;
/** The deepest blue that still votes WATER rather than GHOST. */
const WATER_DEEP = 0x1166CC;
const ICE = 0x66CCFF;
const ICE_PALE = 0xDDF4FF;
/** The blizzard veil. At alpha 0.45 over the sky it composites to a pixel that
 *  still votes ICE, which is what keeps a full-field wash from flipping the
 *  TYPED vote to NORMAL. */
const ICE_VEIL = 0x88DDFF;
const PSY = 0xFF5599;
/** 0xFFAACC, not 0xFFCCE0: the lighter pink is a coin-flip against NORMAL. */
const PSY_PALE = 0xFFAACC;
const PSY_EDGE = 0x7A1F4A;
const GHOST_C = 0x6666BB;
const GHOST_PALE = 0x8877CC;
/** Night Shade's veil: dark indigo, which composites to a GHOST-voting pixel. */
const NIGHT = 0x33228A;

/**
 * ID 85 THUNDERBOLT - one heavy bolt, then a cage of small bolts.
 *
 * Sits between its two siblings on purpose. THUNDER (87) never involves the
 * attacker and falls out of the sky; THUNDER SHOCK (84) is the generic thin
 * electric beam. THUNDERBOLT is a single thick attacker->defender arc with a
 * wide halo, and then - the part neither sibling has - a ring of short bolts
 * standing around the defender, reseeded every few frames so it crackles,
 * while the sprite strobes.
 *
 * Timing note for the e2e: the runner asserts that at the ~40 % frame
 * THUNDERBOLT lights ZERO bright pixels in the strip above the defender (that
 * strip is THUNDER's signature). So nothing yellow or white may be drawn above
 * `defY - 12` before the bolt has faded: the cage bars stand BELOW the
 * defender's centre line and the sprite strobe and the white flash are both
 * held until half-way through the budget.
 */
async function renderThunderbolt(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  const { scene, attackerSprite, defenderSprite } = ctx;
  const d = spec.duration; // 1100 ms via OVERRIDE_DURATION
  const ax = Math.round(attackerSprite.x);
  const ay = Math.round(attackerSprite.y) - 2;
  const dx = Math.round(defenderSprite.x);
  const dy = Math.round(defenderSprite.y);

  soundSystem.thunderZap();

  // 1. Charge (0 -> 10 %): the attacker gathers a knot of sparks.
  const chg = newG(scene, 820);
  await frames(scene, Math.round(d * 0.10), t => {
    chg.clear();
    const r = Math.round(2 + t * 7);
    chg.fillStyle(EDGE, 1);
    chg.fillCircle(ax, ay, r + 2);
    chg.fillStyle(YELLOW, 1);
    chg.fillCircle(ax, ay, r);
    chg.fillStyle(WHITE, 1);
    chg.fillCircle(ax, ay, Math.max(1, r - 4));
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + t * 9;
      const px = Math.round(ax + Math.cos(a) * (r + 6));
      const py = Math.round(ay + Math.sin(a) * (r + 6));
      strokePath(chg, spine(ax, ay, px, py, 3, 3), 2, YELLOW, 1);
    }
  });
  chg.destroy();

  // 2. The bolt (10 -> 46 %): one thick jagged arc, held on screen. `spine`
  //    jitters x only, so the path's y stays exactly on the attacker->defender
  //    line - which is what keeps the halo clear of the sky strip above the
  //    defender. It is still lit when the cage starts, and only fades once the
  //    ring has closed.
  soundSystem.thunderZap();
  const bolt = newG(scene, 880);
  const path = spine(ax, ay, dx, dy, 9, 6);
  const forks = [
    fork(path[3], -1, 12),
    fork(path[5], 1, 12),
    fork(path[7], -1, 9),
  ];
  const paint = (): void => {
    bolt.clear();
    strokePath(bolt, path, 16, YELLOW, 0.3);   // the wide halo
    strokePath(bolt, path, 11, YELLOW, 0.5);
    strokePath(bolt, path, 8, EDGE, 0.95);
    for (const f of forks) strokePath(bolt, f, 5, EDGE, 0.9);
    strokePath(bolt, path, 5, YELLOW, 1);
    for (const f of forks) strokePath(bolt, f, 3, YELLOW, 1);
    strokePath(bolt, path, 2, WHITE, 1);
  };
  paint();
  await delay(scene, Math.round(d * 0.36));

  // 3. The cage (46 -> 86 %): fourteen short bolts standing on an ellipse that
  //    RINGS the defender - above it as well as below - reseeded every ~56 ms
  //    so the ring crackles rather than sits there, with the sprite strobing
  //    yellow/white underneath. Nothing is drawn above the defender until now,
  //    which is what keeps THUNDERBOLT out of the sky strip THUNDER owns.
  soundSystem.crackle();
  const cage = newG(scene, 878);
  const cageMs = Math.round(d * 0.40);
  const BARS = 14;
  await Promise.all([
    frames(scene, cageMs, t => {
      // Reseeding on a coarse clock: at 16 ms the ring reads as static noise.
      const beat = Math.floor(t * cageMs / 56);
      const grow = Math.min(1, t / 0.08);
      const fade = t > 0.86 ? Math.max(0, 1 - (t - 0.86) / 0.14) : 1;
      cage.clear();
      cage.setAlpha(fade);
      for (let i = 0; i < BARS; i++) {
        const a = (i / BARS) * Math.PI * 2 + beat * 0.3;
        const bx = Math.round(dx + Math.cos(a) * 23 * grow);
        const by = Math.round(dy + Math.sin(a) * 19 * grow);
        const half = Math.round(8 + Math.sin(beat + i) * 2);
        const bar = spine(bx, by - half, bx + (i % 2 ? 3 : -3), by + half, 4, 4);
        strokePath(cage, bar, 7, EDGE, 0.9);
        strokePath(cage, bar, 4, YELLOW, 1);
        strokePath(cage, bar, 2, WHITE, 1);
      }
      // The strobe, driven off the same beat so every sampled frame catches it.
      // Both tints are electric-yellow: a pure-white tint is a no-op (tinting
      // multiplies), so it would blink the strobe off at every other sample.
      defenderSprite.setTint(beat % 2 ? YELLOW : 0xFFEE66);
    }),
    // The bolt only dies once the ring has closed around the target.
    (async () => {
      await delay(scene, Math.round(d * 0.06));
      await tweenPromise(scene, { targets: bolt, alpha: 0, duration: Math.round(d * 0.08) });
      bolt.destroy();
    })(),
    (async () => {
      await delay(scene, Math.round(d * 0.02));
      await Promise.all([
        screenFlash(scene, WHITE, Math.round(d * 0.09)),
        screenShake(scene, 5, Math.round(d * 0.16)),
        directionalParticles(scene, dx, dy + 6, YELLOW, 12, {
          dirY: 1, spread: 26, duration: Math.round(d * 0.24),
          shape: 'bolt', accentColor: WHITE,
        }),
      ]);
    })(),
  ]);
  cage.destroy();
  defenderSprite.clearTint();

  // 4. Residual charge (86 -> 100 %).
  await afterglow(scene, dx, dy, Math.round(d * 0.12));
}

/**
 * ID 57 SURF - one wave, the whole field.
 *
 * The generic water body (and HYDRO PUMP, 56) is a thing that travels from the
 * attacker to the defender and stops. SURF is the opposite shape of event: a
 * wall of water rises on the attacker's side, crosses the entire screen, and
 * for a beat the field IS water - the defender is underneath it, not hit by
 * it. The e2e measures exactly that: at the 50 % frame changed pixels must
 * span >= 70 % of the 160 px width, which no projectile can do.
 */
async function renderSurf(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  const { scene, defenderSprite } = ctx;
  const d = spec.duration; // 1150 ms via OVERRIDE_DURATION
  const dir = ctx.isPlayer ? 1 : -1;          // the side the wave comes from
  const originX = ctx.isPlayer ? -24 : GAME_W + 24;
  const BOT = 104;                            // just above the battle text box

  soundSystem.waveCrash();

  const sea = newG(scene, 865);
  /** Paints the water mass between `back` and `front` with a crest height of
   *  `h` at the front, tapering only slightly behind it - the body has to stay
   *  tall enough all the way back to pass OVER the defender's sprite (its top
   *  sits at y 12 on the enemy side), not lap at its feet. */
  const paint = (front: number, back: number, h: number, phase: number): void => {
    sea.clear();
    const x0 = Math.max(0, Math.round(Math.min(front, back)));
    const x1 = Math.min(GAME_W - 1, Math.round(Math.max(front, back)));
    for (let x = x0; x <= x1; x++) {
      // Distance behind the breaking front, 0 at the front.
      const behind = Math.abs(front - x);
      const swell = h * Math.max(0.5, 1 - behind / 400);
      const top = Math.round(BOT - swell + Math.sin(x * 0.22 + phase) * 3);
      if (top >= BOT) continue;
      sea.fillStyle(WATER_DEEP, 1);
      sea.fillRect(x, top, 1, BOT - top);
      sea.fillStyle(WATER, 1);
      sea.fillRect(x, top + 4, 1, Math.max(0, BOT - top - 8));
      sea.fillStyle(WHITE, 1);
      sea.fillRect(x, top, 1, 3);              // the crest
      if (behind < 5) {                        // the breaking face, dark
        sea.fillStyle(WATER_DEEP, 1);
        sea.fillRect(x, top, 1, BOT - top);
        sea.fillStyle(WATER_PALE, 1);
        sea.fillRect(x, top, 1, 4);
      }
    }
  };

  // 1. Rise (0 -> 30 %): the wall builds on the attacker's side, going nowhere.
  await frames(scene, Math.round(d * 0.30), t => {
    paint(originX + dir * (10 + t * 50), originX - dir * 40, 30 + t * 72, t * 14);
  });

  // 2. Sweep (30 -> 48 %): the front crosses the field and runs off the far
  //    edge; the body behind it never retreats, so by the end of the sweep the
  //    whole width is under water.
  soundSystem.splash();
  await Promise.all([
    frames(scene, Math.round(d * 0.18), t => {
      paint(originX + dir * (60 + t * 180), originX - dir * 40, 102 + t * 22, t * 22);
    }),
    screenShake(scene, 4, Math.round(d * 0.18)),
  ]);

  // 3. Submerged (48 -> 66 %): the field is water. The defender is under it,
  //    tumbling, which is the beat the generic body has nowhere to put. The
  //    flash and the tumble are kept SHORTER than the painted phase - a
  //    spriteFlash(n) runs n*60 + (n-1)*60 ms and would otherwise hold the
  //    water at full height well into the drain.
  const homeY = defenderSprite.y;
  await Promise.all([
    frames(scene, Math.round(d * 0.18), t => {
      paint(originX + dir * 240, originX - dir * 40, 124 - t * 10, t * 26);
    }),
    spriteFlash(defenderSprite, scene, WATER, 2),
    tweenPromise(scene, {
      targets: defenderSprite, y: homeY + 4, duration: Math.round(d * 0.045),
      yoyo: true, repeat: 1, ease: 'Sine.easeInOut',
    }),
  ]);

  // 4. Drain + spray (66 -> 92 %): the water falls away and leaves droplets.
  await Promise.all([
    frames(scene, Math.round(d * 0.26), t => {
      paint(originX + dir * 240, originX - dir * 40, Math.max(0, 114 - t * 120), t * 30);
    }),
    directionalParticles(scene, GAME_W / 2, BOT - 40, WATER_PALE, 20, {
      dirY: -1, spread: 60, duration: Math.round(d * 0.26),
      shape: 'droplet', accentColor: WATER, gravity: 1.5,
    }),
  ]);
  sea.destroy();
  await delay(scene, Math.round(d * 0.08));
}

/**
 * ID 89 EARTHQUAKE - nothing travels.
 *
 * The whole point is that there is no projectile, no beam and no attacker
 * motion: the ground itself fails, under BOTH Pokemon at once. The generic
 * ground body is a single dust puff at the defender, so the e2e checks the one
 * thing only a field-wide quake produces - changed pixels under the attacker's
 * feet AND under the defender's feet in the same frame.
 */
async function renderEarthquake(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  const { scene, attackerSprite, defenderSprite } = ctx;
  const d = spec.duration; // 1100 ms via OVERRIDE_DURATION
  const feet = [attackerSprite, defenderSprite].map(s => ({
    x: Math.round(s.x), y: Math.round(s.y) + FOOT_OFFSET,
  }));

  soundSystem.rumble();

  const g = newG(scene, 862);
  /** Cracks along both ground lines plus dust and rock chunks rising from
   *  them. `open` 0 -> 1 widens the cracks; `lift` 0 -> 1 raises the dust. */
  const paintGround = (open: number, lift: number, phase: number): void => {
    g.clear();
    for (const f of feet) {
      const x0 = Math.max(0, f.x - 46);
      const x1 = Math.min(GAME_W - 1, f.x + 46);
      // The dust body: bulk GROUND, because that is the colour the TYPED check
      // is looking for, with the browns used only as outline and speckle.
      const h = Math.round(4 + lift * 22);
      for (let x = x0; x <= x1; x++) {
        const edgeFade = 1 - Math.abs(x - f.x) / 50;
        const top = f.y - Math.round(h * edgeFade * (0.65 + 0.35 * Math.sin(x * 0.4 + phase)));
        if (top >= f.y) continue;
        g.fillStyle(GROUND_EDGE, 1);
        g.fillRect(x, top, 1, f.y - top + 4);
        g.fillStyle(GROUND, 1);
        g.fillRect(x, top + 1, 1, f.y - top + 2);
        if ((x + Math.round(phase)) % 7 === 0) {
          g.fillStyle(GROUND_DARK, 1);
          g.fillRect(x, top + 2, 1, 3);
        }
      }
      // The crack: a jagged black-brown split running through the feet line.
      const crack: Pt[] = [];
      for (let x = x0; x <= x1; x += 6) {
        crack.push({ x, y: f.y + 2 + Math.round(Math.sin(x * 0.7 + phase) * 3) });
      }
      strokePath(g, crack, Math.max(1, Math.round(1 + open * 5)), GROUND_EDGE, 1);
      strokePath(g, crack, Math.max(1, Math.round(open * 2)), 0x1A1208, 1);
    }
  };

  // 1. Tremor (0 -> 22 %): cracks open, the shake builds.
  await Promise.all([
    frames(scene, Math.round(d * 0.22), t => paintGround(t * 0.5, t * 0.35, t * 20)),
    screenShake(scene, 7, Math.round(d * 0.22)),
  ]);

  // 2. The quake (22 -> 74 %): the biggest shake in the game, dust and rock
  //    chunks off both ground lines, and the defender thrown up and down.
  soundSystem.thud();
  const homeY = defenderSprite.y;
  await Promise.all([
    frames(scene, Math.round(d * 0.52), t => {
      paintGround(0.5 + t * 0.5, 0.35 + Math.sin(t * Math.PI) * 0.65, 4 + t * 40);
    }),
    screenShake(scene, 14, Math.round(d * 0.52)),
    ...feet.map(f => directionalParticles(scene, f.x, f.y, GROUND, 16, {
      dirY: -1, spread: 40, duration: Math.round(d * 0.5),
      shape: 'grit', accentColor: GROUND_DARK, gravity: 1.4,
    })),
    ...feet.map(f => directionalParticles(scene, f.x, f.y - 2, GROUND_DARK, 8, {
      dirY: -1, spread: 30, duration: Math.round(d * 0.44),
      shape: 'block', accentColor: GROUND_EDGE, gravity: 1.8,
    })),
    // Repeated jolts, not one hop: the ground keeps letting go under it.
    tweenPromise(scene, {
      targets: defenderSprite, y: homeY - 5, duration: Math.round(d * 0.065),
      yoyo: true, repeat: 3, ease: 'Quad.easeOut',
    }),
    spriteFlash(defenderSprite, scene, GROUND, 3),
  ]);

  // 3. Settling (74 -> 100 %): the dust falls back into the cracks.
  await Promise.all([
    frames(scene, Math.round(d * 0.24), t => paintGround(1 - t * 0.7, Math.max(0, 0.5 - t * 0.5), 44 + t * 10)),
    ...feet.map(f => directionalParticles(scene, f.x, f.y - 14, GROUND, 8, {
      dirY: 1, spread: 26, duration: Math.round(d * 0.2),
      shape: 'grit', accentColor: GROUND_EDGE, gravity: 2,
    })),
  ]);
  g.destroy();
}

/**
 * ID 56 HYDRO PUMP - pressure, not volume.
 *
 * The counterpart to SURF: SURF is the whole field going under, HYDRO PUMP is
 * one jet aimed at one target. The tells are the width ramp (the beam GROWS
 * from a needle to a column while it is held, which no generic beam does) and
 * the defender being physically shoved back on contact and staying shoved
 * until the jet stops.
 */
async function renderHydroPump(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  const { scene, attackerSprite, defenderSprite } = ctx;
  const d = spec.duration; // 1000 ms via OVERRIDE_DURATION
  const ax = Math.round(attackerSprite.x);
  const ay = Math.round(attackerSprite.y) - 2;
  const dx = Math.round(defenderSprite.x);
  const dy = Math.round(defenderSprite.y);
  const homeX = defenderSprite.x;
  const push = ctx.isPlayer ? 6 : -6;         // away from the attacker

  soundSystem.bubblePop();

  // 1. Pressurise (0 -> 18 %).
  const chg = newG(scene, 820);
  await frames(scene, Math.round(d * 0.18), t => {
    chg.clear();
    const r = Math.round(2 + t * 8);
    chg.fillStyle(WATER_DEEP, 1);
    chg.fillCircle(ax, ay, r + 2);
    chg.fillStyle(WATER, 1);
    chg.fillCircle(ax, ay, r);
    chg.fillStyle(WATER_PALE, 1);
    chg.fillCircle(ax, ay, Math.max(1, r - 4));
  });
  chg.destroy();

  // 2. The jet (18 -> 64 %): width 5 -> 24, white core 1 -> 9, held.
  soundSystem.splash();
  const jet = newG(scene, 858);
  const jetMs = Math.round(d * 0.46);
  await Promise.all([
    frames(scene, jetMs, t => {
      jet.clear();
      const reach = Math.min(1, t / 0.14);
      const w = 5 + t * 19;
      const stop = t > 0.88 ? Math.max(0, 1 - (t - 0.88) / 0.12) : 1;
      const wob = Math.round(Math.sin(t * 34) * 2);
      const ex = ax + (dx - ax) * reach;
      const ey = ay + (dy - ay) * reach;
      jet.setAlpha(stop);
      const stroke = (lw: number, c: number): void => {
        jet.lineStyle(Math.max(1, Math.round(lw)), c, 1);
        jet.beginPath();
        jet.moveTo(ax, ay + wob);
        jet.lineTo(ex, ey);
        jet.strokePath();
      };
      stroke(w + 6, WATER_DEEP);
      stroke(w, WATER);
      stroke(Math.max(1, w * 0.38), WHITE);
    }),
    emitterAlong(scene, ax, ay, dx, dy, WATER_PALE, WATER_DEEP, 12, jetMs, 'droplet'),
    (async () => {
      // Contact: shoved back, and held there for as long as the jet lasts.
      await delay(scene, Math.round(jetMs * 0.2));
      await tweenPromise(scene, {
        targets: defenderSprite, x: homeX + push,
        duration: Math.round(d * 0.06), ease: 'Quad.easeOut',
      });
      await Promise.all([
        spriteFlash(defenderSprite, scene, WATER, 2),
        screenShake(scene, 5, Math.round(d * 0.2)),
      ]);
      await tweenPromise(scene, {
        targets: defenderSprite, x: homeX,
        duration: Math.round(d * 0.1), ease: 'Sine.easeInOut',
      });
    })(),
  ]);
  jet.destroy();

  // 3. Splash (64 -> 90 %): a big ring plus droplets thrown off the target.
  await Promise.all([
    ring(scene, dx, dy, WATER_DEEP, 34, Math.round(d * 0.26), 3),
    ring(scene, dx, dy, WATER_PALE, 26, Math.round(d * 0.26), 2),
    impactBurst(scene, dx, dy, WATER, WHITE, 16, Math.round(d * 0.22)),
    directionalParticles(scene, dx, dy, WATER_PALE, 18, {
      spread: 40, duration: Math.round(d * 0.28),
      shape: 'droplet', accentColor: WATER_DEEP, gravity: 1.4,
    }),
  ]);
}

/**
 * ID 126 FIRE BLAST - the five-pointed star.
 *
 * FLAMETHROWER (53) is the generic fire beam; FIRE BLAST is a SHAPE. The
 * kanji-shaped blast (one head, two arms, two legs around a core) travels to
 * the defender growing the whole way, then bursts into flames that climb off
 * the sprite. Like the other fireballs in this file the burst COLLAPSES rather
 * than fading, because a fading red on a #f8f8f8 sky turns tan and the nearest
 * colour vote flips out of FIRE.
 */
async function renderFireBlast(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  const { scene, attackerSprite, defenderSprite } = ctx;
  const d = spec.duration; // 1100 ms via OVERRIDE_DURATION
  const ax = Math.round(attackerSprite.x);
  const ay = Math.round(attackerSprite.y) - 2;
  const dx = Math.round(defenderSprite.x);
  const dy = Math.round(defenderSprite.y);

  /** The five lobes plus the core, in unit coordinates. */
  const LOBES: { x: number; y: number; r: number }[] = [
    { x: 0, y: -13, r: 11 },
    { x: -15, y: -2, r: 9 },
    { x: 15, y: -2, r: 9 },
    { x: -11, y: 14, r: 9 },
    { x: 11, y: 14, r: 9 },
    { x: 0, y: 0, r: 10 },
  ];
  const drawStar = (g: Phaser.GameObjects.Graphics, cx: number, cy: number, s: number): void => {
    const band = (c: number, k: number): void => {
      g.fillStyle(c, 1);
      for (const l of LOBES) {
        g.fillCircle(Math.round(cx + l.x * s), Math.round(cy + l.y * s), Math.max(1, Math.round(l.r * s * k)));
      }
    };
    band(FIRE_EDGE, 1.1);
    band(FIRE_RED, 1);
    band(FIRE_ORANGE, 0.7);
    band(FIRE_YELLOW, 0.44);
    band(WHITE, 0.2);
  };

  soundSystem.roar();

  // 1. Ignition (0 -> 12 %).
  const star = newG(scene, 866);
  await frames(scene, Math.round(d * 0.12), t => {
    star.clear();
    drawStar(star, ax, ay, 0.12 + t * 0.2);
  });

  // 2. Travel (12 -> 56 %): the star crosses the field, growing as it goes.
  await Promise.all([
    frames(scene, Math.round(d * 0.44), t => {
      star.clear();
      const e = t * t * (3 - 2 * t);            // smoothstep: slow, then fast
      drawStar(star, Math.round(ax + (dx - ax) * e), Math.round(ay + (dy - ay) * e), 0.32 + t * 1.0);
    }),
    directionalParticles(scene, ax, ay, FIRE_ORANGE, 10, {
      dirX: dx > ax ? 1 : -1, spread: 20, duration: Math.round(d * 0.4),
      shape: 'mote', accentColor: FIRE_YELLOW,
    }),
  ]);

  // 3. The burst (56 -> 84 %): the star opens out over the sprite and the
  //    flames climb off it.
  soundSystem.boom();
  const fire = newG(scene, 868);
  await Promise.all([
    frames(scene, Math.round(d * 0.28), t => {
      star.clear();
      const collapse = t < 0.7 ? 1 : Math.max(0, 1 - (t - 0.7) / 0.3);
      drawStar(star, dx, dy, (1.3 + t * 0.9) * collapse);
      // Tongues of flame licking up off the defender.
      fire.clear();
      fire.setAlpha(1);
      for (let i = 0; i < 7; i++) {
        const fx = Math.round(dx - 18 + i * 6);
        const lick = Math.round((10 + Math.sin(i * 2.1 + t * 9) * 7) * (1 - Math.abs(t - 0.5) * 1.1));
        if (lick <= 0) continue;
        fire.fillStyle(FIRE_EDGE, 1);
        fire.fillRect(fx - 3, dy - 12 - lick, 6, lick + 6);
        fire.fillStyle(FIRE_RED, 1);
        fire.fillRect(fx - 2, dy - 11 - lick, 4, lick + 5);
        fire.fillStyle(FIRE_YELLOW, 1);
        fire.fillRect(fx - 1, dy - 9 - lick, 2, lick + 3);
      }
    }),
    screenFlash(scene, FIRE_ORANGE, Math.round(d * 0.1)),
    screenShake(scene, 7, Math.round(d * 0.2)),
    spriteFlash(defenderSprite, scene, FIRE_ORANGE, 3),
    directionalParticles(scene, dx, dy, FIRE_RED, 16, {
      spread: 42, duration: Math.round(d * 0.28),
      shape: 'mote', accentColor: FIRE_YELLOW,
    }),
  ]);
  star.destroy();
  fire.destroy();

  // 4. Embers (84 -> 100 %).
  await directionalParticles(scene, dx, dy, FIRE_ORANGE, 10, {
    dirY: -1, spread: 24, duration: Math.round(d * 0.10),
    shape: 'mote', accentColor: FIRE_EDGE, gravity: -0.6,
  });
}

/**
 * ID 59 BLIZZARD - the storm, not the beam.
 *
 * ICE BEAM (58) is one line from the attacker to the defender. BLIZZARD has no
 * line at all: a pale veil drops over the whole field, diagonal streaks sweep
 * across everything including both sprites, the defender is caught in a
 * crystal and then the crystal shatters. Like SURF it is checked on width -
 * at 50 % the storm has to have touched >= 70 % of the screen's columns.
 */
async function renderBlizzard(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  const { scene, defenderSprite } = ctx;
  const d = spec.duration; // 1150 ms via OVERRIDE_DURATION
  const dx = Math.round(defenderSprite.x);
  const dy = Math.round(defenderSprite.y);

  soundSystem.iceWind();

  const veil = newG(scene, 866);
  veil.fillStyle(ICE_VEIL, 1);
  veil.fillRect(0, 0, GAME_W, 144);
  veil.setAlpha(0);

  // 22 streaks with fixed seeds so the storm reads as one wind, not confetti.
  const streaks = Array.from({ length: 22 }, (_, i) => ({
    y: -20 + (i * 173) % 160,
    off: (i * 97) % 200,
    len: 14 + (i % 4) * 6,
    pale: i % 3 === 0,
  }));
  const storm = newG(scene, 872);

  const stormMs = Math.round(d * 0.74);
  const stormJob = frames(scene, stormMs, t => {
    storm.clear();
    const fade = t > 0.86 ? Math.max(0, 1 - (t - 0.86) / 0.14) : 1;
    storm.setAlpha(fade);
    for (const s of streaks) {
      // Every streak runs on the same diagonal, wrapping across the field.
      const p = (s.off + t * 520) % 260;
      const x = 200 - p;
      const y = s.y + p * 0.42;
      if (y > 120) continue;
      const c = s.pale ? ICE : WHITE;
      storm.lineStyle(3, 0x2E7FB8, 1);
      storm.beginPath();
      storm.moveTo(x, y);
      storm.lineTo(x - s.len, y + s.len * 0.62);
      storm.strokePath();
      storm.lineStyle(2, c, 1);
      storm.beginPath();
      storm.moveTo(x, y);
      storm.lineTo(x - s.len, y + s.len * 0.62);
      storm.strokePath();
    }
  });

  await Promise.all([
    stormJob,
    (async () => {
      await tweenPromise(scene, { targets: veil, alpha: 0.45, duration: Math.round(d * 0.16) });
      await delay(scene, Math.round(d * 0.52));
      await tweenPromise(scene, { targets: veil, alpha: 0, duration: Math.round(d * 0.14) });
    })(),
    (async () => {
      // 2. Frozen (55 -> 78 %): a crystal closes over the defender.
      await delay(scene, Math.round(d * 0.55));
      soundSystem.glassPing();
      const ice = newG(scene, 876);
      await Promise.all([
        frames(scene, Math.round(d * 0.23), t => {
          ice.clear();
          const grow = Math.min(1, t / 0.4);
          const r = Math.round(20 * grow);
          const pts: Pt[] = [
            { x: dx, y: dy - r - 4 }, { x: dx + r, y: dy - 6 },
            { x: dx + r - 3, y: dy + r }, { x: dx - r + 3, y: dy + r },
            { x: dx - r, y: dy - 6 }, { x: dx, y: dy - r - 4 },
          ];
          strokePath(ice, pts, 5, 0x2E7FB8, 1);
          strokePath(ice, pts, 3, ICE, 1);
          ice.fillStyle(ICE_PALE, t > 0.55 ? Math.max(0, 1 - (t - 0.55) / 0.45) : 0.55);
          ice.fillPoints(pts.slice(0, 5), true);
        }),
        spriteFlash(defenderSprite, scene, WHITE, 3),
        screenShake(scene, 5, Math.round(d * 0.14)),
      ]);
      ice.destroy();
      // 3. Shatter.
      await directionalParticles(scene, dx, dy, ICE, 20, {
        spread: 44, duration: Math.round(d * 0.2),
        shape: 'shard', accentColor: ICE_PALE,
      });
    })(),
  ]);
  storm.destroy();
  veil.destroy();
}

/**
 * ID 94 PSYCHIC - the target is crushed where it stands.
 *
 * CONFUSION (93) renders the generic psychic body. PSYCHIC sends nothing
 * across the field at all: rings collapse INWARD onto the defender, the sprite
 * is squeezed and stretched (scaleX, which `renderSpec`'s restore puts back),
 * and the screen goes magenta for a beat at the moment of the crush.
 */
async function renderPsychic(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  const { scene, defenderSprite } = ctx;
  const d = spec.duration; // 1000 ms via OVERRIDE_DURATION
  const dx = Math.round(defenderSprite.x);
  const dy = Math.round(defenderSprite.y);

  soundSystem.warble();

  // 1. The collapse (0 -> 56 %): four rings falling in, and an aura tightening
  //    around the sprite underneath them.
  const g = newG(scene, 864);
  const crush = Math.round(d * 0.56);
  await Promise.all([
    frames(scene, crush, t => {
      g.clear();
      for (let i = 0; i < 4; i++) {
        const phase = (t * 1.25 + i / 4) % 1;
        const r = Math.round((1 - phase) * 48);
        if (r < 3) continue;
        g.lineStyle(7, PSY_EDGE, 1);
        g.strokeCircle(dx, dy, r);
        g.lineStyle(4, PSY, 1);
        g.strokeCircle(dx, dy, r);
        g.lineStyle(1, PSY_PALE, 1);
        g.strokeCircle(dx, dy, r);
      }
      // The aura: a solid magenta field held around the target the whole time,
      // so the frame is unmistakably psychic even between rings.
      const ar = Math.round(20 - t * 4);
      g.fillStyle(PSY_EDGE, 1);
      g.fillEllipse(dx, dy, ar * 2 + 5, ar * 2 + 5);
      g.fillStyle(PSY, 1);
      g.fillEllipse(dx, dy, ar * 2, ar * 2);
      g.fillStyle(PSY_PALE, 1);
      g.fillEllipse(dx, dy, ar, ar);
    }),
    // The distortion: squeezed, stretched, squeezed again.
    tweenPromise(scene, {
      targets: defenderSprite, scaleX: 1.4, scaleY: 0.72,
      duration: Math.round(d * 0.14), yoyo: true, repeat: 1, ease: 'Sine.easeInOut',
    }),
    spriteFlash(defenderSprite, scene, PSY, 4),
  ]);
  g.destroy();

  // 2. The crush (56 -> 76 %): the screen goes magenta, the sprite snaps.
  soundSystem.glassPing();
  await Promise.all([
    screenFlash(scene, PSY, Math.round(d * 0.2)),
    screenShake(scene, 6, Math.round(d * 0.16)),
    tweenPromise(scene, {
      targets: defenderSprite, scaleX: 0.62, scaleY: 1.32,
      duration: Math.round(d * 0.1), yoyo: true, ease: 'Quad.easeOut',
    }),
  ]);

  // 3. Release (76 -> 100 %).
  await Promise.all([
    impactBurst(scene, dx, dy, PSY, PSY_PALE, 18, Math.round(d * 0.22)),
    directionalParticles(scene, dx, dy, PSY, 14, {
      spread: 36, duration: Math.round(d * 0.24),
      shape: 'ring', accentColor: PSY_PALE,
    }),
  ]);
}

/**
 * ID 101 NIGHT SHADE - the attacker's shadow does the hitting.
 *
 * LICK (122) and the rest of the generic ghost body are wisps at the defender.
 * NIGHT SHADE is a lighting change: the field goes dark, a translucent copy of
 * the ATTACKER peels off it, rises, drifts across and settles over the
 * defender, the defender flickers in and out, and only then does the dark
 * lift. The e2e checks the lighting change directly - the field's mean
 * luminance at ~30 % has to be well below the idle field's.
 */
async function renderNightShade(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  const { scene, attackerSprite, defenderSprite } = ctx;
  const d = spec.duration; // 1100 ms via OVERRIDE_DURATION
  const ax = attackerSprite.x;
  const ay = attackerSprite.y;
  const dx = Math.round(defenderSprite.x);
  const dy = Math.round(defenderSprite.y);

  soundSystem.wail();

  const veil = newG(scene, 860);
  veil.fillStyle(NIGHT, 1);
  veil.fillRect(0, 0, GAME_W, 144);
  veil.setAlpha(0);

  // The shade: a tinted copy of the attacker's own sprite, which is the one
  // thing no generic body can draw - it has no access to the attacker's frame.
  const shade = scene.add.image(ax, ay, attackerSprite.texture.key, attackerSprite.frame.name);
  shade.setDepth(874);
  shade.setScrollFactor(0);
  shade.setTint(GHOST_C);
  shade.setAlpha(0);

  await Promise.all([
    // 1. The field goes dark (0 -> 20 %), stays dark, lifts at the end.
    (async () => {
      await tweenPromise(scene, { targets: veil, alpha: 0.62, duration: Math.round(d * 0.2) });
      await delay(scene, Math.round(d * 0.62));
      await tweenPromise(scene, { targets: veil, alpha: 0, duration: Math.round(d * 0.18) });
    })(),
    // 2. The shade rises off the attacker and drifts onto the defender.
    (async () => {
      await delay(scene, Math.round(d * 0.14));
      soundSystem.whoosh();
      await tweenPromise(scene, {
        targets: shade, alpha: 0.7, y: ay - 16, scaleX: 1.15, scaleY: 1.15,
        duration: Math.round(d * 0.16), ease: 'Sine.easeOut',
      });
      await tweenPromise(scene, {
        targets: shade, x: dx, y: dy, scaleX: 1.5, scaleY: 1.5,
        duration: Math.round(d * 0.28), ease: 'Sine.easeInOut',
      });
      await Promise.all([
        tweenPromise(scene, {
          targets: shade, alpha: 0, scaleX: 1.9, scaleY: 1.9,
          duration: Math.round(d * 0.2), ease: 'Quad.easeIn',
        }),
        // 3. The defender flickers out of existence and back.
        tweenPromise(scene, {
          targets: defenderSprite, alpha: 0.2,
          duration: Math.round(d * 0.05), yoyo: true, repeat: 3, ease: 'Linear',
        }),
        directionalParticles(scene, dx, dy, GHOST_PALE, 14, {
          spread: 34, duration: Math.round(d * 0.24),
          shape: 'wisp', accentColor: GHOST_C,
        }),
      ]);
    })(),
  ]);
  shade.destroy();
  veil.destroy();
}

registerSpecOverride('thunderbolt', renderThunderbolt);
registerSpecOverride('surf', renderSurf);
registerSpecOverride('earthquake', renderEarthquake);
registerSpecOverride('hydroPump', renderHydroPump);
registerSpecOverride('fireBlast', renderFireBlast);
registerSpecOverride('blizzard', renderBlizzard);
registerSpecOverride('psychic', renderPsychic);
registerSpecOverride('nightShade', renderNightShade);
