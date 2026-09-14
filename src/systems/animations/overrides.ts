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
 * The fireball is Normal-coloured with a dark rim and only a white heart: the
 * battle sky is #f8f8f8, so a white blast on its own would be invisible.
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
      const on = beats > 0.2 ? 1 : 0.25;
      const r = Math.round(9 + t * 12);
      halo.setAlpha(on);
      halo.fillStyle(NORMAL_EDGE, 1);
      halo.fillCircle(ax, ay, r + 2);
      halo.fillStyle(NORMAL, 1);
      halo.fillCircle(ax, ay, r);
      halo.fillStyle(NORMAL_PALE, 1);
      halo.fillCircle(ax, ay, Math.max(2, r - 5));
      halo.fillStyle(WHITE, 1);
      halo.fillCircle(ax, ay, Math.max(1, Math.round(r * 0.4)));
    }),
    spriteFlash(attackerSprite, scene, WHITE, strobes),
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
      const r = Math.round(maxR * Math.sqrt(Math.min(1, t / 0.75)));
      blast.setAlpha(t < 0.6 ? 1 : Math.max(0, 1 - (t - 0.6) / 0.4));
      blast.fillStyle(NORMAL_EDGE, 1);
      blast.fillCircle(ax, ay, r + 3);
      blast.fillStyle(NORMAL, 1);
      blast.fillCircle(ax, ay, r);
      blast.fillStyle(NORMAL_PALE, 1);
      blast.fillCircle(ax, ay, Math.round(r * 0.62));
      blast.fillStyle(WHITE, 1);
      blast.fillCircle(ax, ay, Math.round(r * 0.3));
      // Debris rings riding the front.
      for (let i = 0; i < 3; i++) {
        const phase = (t * 1.4 + i / 3) % 1;
        blast.lineStyle(3, NORMAL_EDGE, 1 - phase * 0.4);
        blast.strokeCircle(ax, ay, Math.round(phase * maxR * 1.25));
      }
    }),
    screenFlash(scene, WHITE, Math.round(d * 0.12)),
    screenShake(scene, 8, Math.round(d * 0.26)),
    directionalParticles(scene, ax, ay, NORMAL_EDGE, Math.round(18 * scale), {
      spread: Math.round(56 * scale), duration: Math.round(d * 0.38),
      shape: 'dust', accentColor: NORMAL,
    }),
    spriteFlash(defenderSprite, scene, NORMAL, 3),
    tweenPromise(scene, {
      targets: attackerSprite, alpha: 0.15,
      duration: Math.round(d * 0.26), ease: 'Quad.easeIn',
    }),
  ]);
  blast.destroy();

  // 3. Debris settling (78 -> 100 %).
  await Promise.all([
    directionalParticles(scene, ax, ay - 6, NORMAL, Math.round(10 * scale), {
      dirY: 1, spread: Math.round(34 * scale), duration: Math.round(d * 0.18),
      shape: 'dust', accentColor: NORMAL_EDGE, gravity: 1.6,
    }),
    impactBurst(scene, defenderSprite.x, defenderSprite.y, NORMAL, NORMAL_PALE,
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
