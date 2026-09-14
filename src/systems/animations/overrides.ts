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
  afterimage,
  delay,
  directionalParticles,
  clearImpactTint,
  emitterAlong,
  impactBurst,
  impactTint,
  newAmbientGraphics,
  newBodyGraphics,
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
  // Delegated to the shared factory so tier 4 can reach it: on a miss or an
  // immunity it hangs a cutout over the defender, which is what stops the
  // set-pieces that draw their detonation by hand (FIRE BLAST, THUNDER) from
  // marking a target they did not connect with.
  return newBodyGraphics(scene, depth);
}

/**
 * The same, for a drawing that covers the WHOLE FIELD rather than the target -
 * a storm veil, a wall of water, streaks across the sky. Weather is not an
 * impact mark, so tier 4's miss / immune cutout must never punch a hole in it:
 * the defender dodging an attack does not make the sky brighten around it.
 */
function ambientG(scene: Phaser.Scene, depth: number): Phaser.GameObjects.Graphics {
  return newAmbientGraphics(scene, depth);
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
 *
 * `newG`, NOT `ambientG`: the bolt spans the field but it is AIMED - its foot
 * is the defender's own x/y. It is the attack arriving, so on a miss tier 4
 * cuts the defender's silhouette out of it and the bolt reads as falling past
 * the Pokemon instead of into it. Only the sky DARKENING (`stormVeil`) is
 * weather.
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
  const g = ambientG(scene, 870);
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
  const sky = ambientG(scene, 830);
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
      impactTint(defenderSprite, beat % 2 ? YELLOW : 0xFFEE66);
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
  clearImpactTint(defenderSprite);

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

  const sea = ambientG(scene, 865);
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

  const veil = ambientG(scene, 866);
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
  const storm = ambientG(scene, 872);

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

  const veil = ambientG(scene, 860);
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

// ===========================================================================
// Foe-targeted status / grapple / speed / stat-drop set-pieces
// (SING / SLEEP POWDER / TOXIC / LEECH SEED / THUNDER WAVE / WRAP / BIND /
//  QUICK ATTACK / SWIFT / GROWL / TAIL WHIP)
// ===========================================================================
//
// Every one of these eleven used to render as the same handful of generic
// bodies: seven of them share `status-cloud`, two share `bind`, two share
// `contact`. So "SING does not look like GROWL" is exactly as measurable as
// the signature attacks were, and `tools/anim-e2e.mjs` measures it the same
// way - each move against its own stripped spec AND against the sibling named
// in the brief, best of the 25/50/75 % frames, over the same-render noise.
//
// Two constraints shape the whole batch:
//   - the sky is #f8f8f8, so a status effect that is a pale haze is simply not
//     there. Everything here is drawn with a dark edge under an alpha-1 core,
//     and big: the distinctness floor is 2000 px, 12 % of the field.
//   - the TYPED vote is a nearest-of-15-type-colours vote, which punishes the
//     obvious palette choice surprisingly often (see each constant below).

/** SING's "pink-ish Normal". Pink enough to be a song rather than a status
 *  cloud, but a nearest-colour vote still lands on NORMAL (4608) comfortably
 *  ahead of PSYCHIC (8635) and ROCK (5201). */
const SONG = 0xD8A8A8;
const SONG_PALE = 0xF4DCDC;
const SONG_EDGE = 0x5A3030;
/** Powder green. GRASS_PALE (0xCCFF66) votes BUG rather than GRASS, and teal -
 *  the brief's other suggestion - votes WATER/ICE, so the cloud is deep green
 *  under bright green instead of green/teal. */
const POWDER = 0x44BB44;
const POWDER_BRIGHT = 0x66DD66;
/** POISON with an edge dark enough to hold against the sky that still votes
 *  POISON (0x4A1A44 would vote FIGHTING) and a pale that still votes POISON
 *  (0xDD88CC would vote PSYCHIC). */
const POISON_C = 0xAA5599;
const POISON_PALE = 0xC877BB;
const POISON_EDGE = 0x6A2266;
const VINE_DARK = 0x2E8B2E;
const SEED_C = 0x996633;
/** WRAP / BIND / GROWL / TAIL WHIP tan. 0xC8A878 already votes ROCK; this is
 *  the warmest tan that still votes NORMAL. */
const TAN = 0xB8A878;
/** SWIFT's stars are yellow, which votes ELECTRIC on a Normal move - the one
 *  off-type palette in this batch, declared in the runner's EXPECTED_TYPE. */
const STAR_PALE = 0xFFDD44;

/** A circular arc as a polyline, ready for `strokePath`. */
function arcPts(cx: number, cy: number, r: number, a0: number, a1: number, segs = 16): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= segs; i++) {
    const a = a0 + (a1 - a0) * (i / segs);
    pts.push({ x: Math.round(cx + Math.cos(a) * r), y: Math.round(cy + Math.sin(a) * r) });
  }
  return pts;
}

/** One filled five-pointed star: dark edge, body, pale core. */
function fillStar(
  g: Phaser.GameObjects.Graphics,
  cx: number, cy: number, r: number, spin: number,
): void {
  const poly = (rad: number): Pt[] => {
    const pts: Pt[] = [];
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + spin + (i * Math.PI) / 5;
      const rr = i % 2 === 0 ? rad : rad * 0.44;
      pts.push({ x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr });
    }
    return pts;
  };
  g.fillStyle(EDGE, 1);
  g.fillPoints(poly(r + 2), true);
  g.fillStyle(YELLOW, 1);
  g.fillPoints(poly(r), true);
  g.fillStyle(STAR_PALE, 1);
  g.fillPoints(poly(Math.max(2, r * 0.5)), true);
}

/** One musical note: filled head, stem, flag. ~7 px of head with the edge. */
function drawNote(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
  g.fillStyle(SONG_EDGE, 1);
  g.fillEllipse(x, y, 11, 9);
  g.fillRect(x + 2, y - 14, 5, 15);
  g.fillRect(x + 5, y - 14, 7, 6);
  g.fillStyle(SONG, 1);
  g.fillEllipse(x, y, 8, 6);
  g.fillRect(x + 3, y - 13, 3, 13);
  g.fillStyle(SONG_PALE, 1);
  g.fillRect(x + 6, y - 13, 5, 4);
}

/** One "Z" mote, `s` px on a side. */
function drawZ(g: Phaser.GameObjects.Graphics, x: number, y: number, s: number): void {
  const pts: Pt[] = [
    { x, y }, { x: x + s, y }, { x, y: y + s }, { x: x + s, y: y + s },
  ];
  strokePath(g, pts, 4, SONG_EDGE, 1);
  strokePath(g, pts, 2, SONG, 1);
}

/**
 * ID 47 SING - the notes travel, and the target nods off.
 *
 * GROWL (45) is a burst of arcs that stays at the attacker's mouth; the
 * generic status-cloud is a puff at the defender. SING is neither: a wavy
 * three-line stave is drawn across the whole field, note heads ride along it,
 * and only when they arrive does the defender start to sway and leak "Z"s.
 * The stave is what gives the move its pixel mass - a handful of 7 px note
 * heads on a #f8f8f8 sky is not an animation.
 */
async function renderSing(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  const { scene, attackerSprite, defenderSprite } = ctx;
  const d = spec.duration; // 900 ms via OVERRIDE_DURATION
  const ax = attackerSprite.x;
  const ay = attackerSprite.y - 8;
  const dx = Math.round(defenderSprite.x);
  const dy = Math.round(defenderSprite.y);
  const rot0 = defenderSprite.rotation;

  soundSystem.melody();

  const g = newG(scene, 866);
  const along = (s: number): Pt => ({
    x: Math.round(ax + (dx - ax) * s),
    y: Math.round(ay + (dy - ay) * s - Math.sin(s * Math.PI * 2.6) * 13),
  });

  const sweep = Math.round(d * 0.6);
  await Promise.all([
    frames(scene, sweep, t => {
      g.clear();
      const head = Math.min(1, t * 1.2);
      for (const off of [-6, 0, 6]) {
        const pts: Pt[] = [];
        for (let i = 0; i <= 26; i++) {
          const p = along((i / 26) * head);
          pts.push({ x: p.x, y: p.y + off });
        }
        strokePath(g, pts, 5, SONG_EDGE, 0.95);
        strokePath(g, pts, 3, SONG, 1);
      }
      for (let i = 0; i < 7; i++) {
        const s = head - i * 0.105;
        if (s < 0.02) continue;
        const p = along(s);
        drawNote(g, p.x, p.y - 3);
      }
    }),
    // The sway has to FIT inside the sweep: a yoyo+repeat tween costs
    // duration x 2 x (repeat + 1), and anything that overruns here is added
    // straight onto the move's wall clock (which the runner measures).
    (async () => {
      await delay(scene, Math.round(d * 0.30));
      await tweenPromise(scene, {
        targets: defenderSprite, rotation: 0.17,
        duration: Math.round(d * 0.05), yoyo: true, repeat: 2, ease: 'Sine.easeInOut',
      });
    })(),
  ]);

  // The target is asleep on its feet: the song fades, the Z's rise.
  const z = newG(scene, 868);
  const rise = Math.round(d * 0.36);
  await Promise.all([
    tweenPromise(scene, { targets: g, alpha: 0, duration: rise }),
    frames(scene, rise, t => {
      z.clear();
      for (let i = 0; i < 5; i++) {
        const ph = (t * 1.15 + i * 0.21) % 1;
        drawZ(
          z,
          Math.round(dx + 9 + i * 2 + Math.sin(ph * 7) * 5),
          Math.round(dy - 4 - ph * 22),
          5 + i,
        );
      }
    }),
    tweenPromise(scene, {
      targets: defenderSprite, rotation: -0.15,
      duration: Math.round(d * 0.08), yoyo: true, repeat: 1, ease: 'Sine.easeInOut',
    }),
  ]);
  // renderSpec restores position/alpha/scale/tint but NOT rotation, so a
  // sway that is not undone here would be permanent.
  defenderSprite.setRotation(rot0);
  g.destroy();
  z.destroy();
}

/**
 * ID 79 SLEEP POWDER - the cloud goes OVER the target, then falls on it.
 *
 * STUN SPORE (78) and POISON POWDER (77) still render the generic
 * status-cloud, a puff that appears where the defender already is. The whole
 * difference here is the trajectory: the clump forms at the attacker, drifts
 * across and parks ABOVE the defender, and only then rains down and settles,
 * with the defender drooping under it.
 */
async function renderSleepPowder(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  const { scene, attackerSprite, defenderSprite } = ctx;
  const d = spec.duration; // 950 ms via OVERRIDE_DURATION
  const ax = attackerSprite.x;
  const ay = attackerSprite.y - 6;
  const dx = Math.round(defenderSprite.x);
  const dy = Math.round(defenderSprite.y);
  const homeY = defenderSprite.y;
  const overY = dy - 26; // the cloud parks here before it falls

  soundSystem.powder();

  // Dozens of dots, seeded once: a clump that reshuffled every frame would
  // boil instead of drift.
  const dots = Array.from({ length: 96 }, () => ({
    ox: (Math.random() - 0.5) * 74,
    oy: (Math.random() - 0.5) * 30,
    r: Math.random() < 0.45 ? 3 : 2,
    bright: Math.random() < 0.5,
    fall: 0.35 + Math.random() * 0.65,
    drift: (Math.random() - 0.5) * 26,
  }));

  const g = newG(scene, 866);
  const paintClump = (cx: number, cy: number, scale: number): void => {
    g.fillStyle(GRASS_EDGE, 0.95);
    g.fillEllipse(cx, cy, 74 * scale, 32 * scale);
    g.fillStyle(POWDER, 1);
    g.fillEllipse(cx, cy, 68 * scale, 26 * scale);
    g.fillStyle(POWDER_BRIGHT, 1);
    g.fillEllipse(cx - 6 * scale, cy - 3 * scale, 34 * scale, 12 * scale);
    for (const p of dots) {
      g.fillStyle(p.bright ? POWDER_BRIGHT : GRASS_EDGE, 1);
      g.fillCircle(Math.round(cx + p.ox * scale), Math.round(cy + p.oy * scale), p.r);
    }
  };

  // 1. Drift (0 -> 46 %): the clump crosses the field and stops above the target.
  const drift = Math.round(d * 0.46);
  await frames(scene, drift, t => {
    g.clear();
    const e = t * t * (3 - 2 * t);
    paintClump(Math.round(ax + (dx - ax) * e), Math.round(ay + (overY - ay) * e), 0.55 + e * 0.45);
  });

  // 2. Rain (46 -> 100 %): the clump thins out as its dots fall onto the
  //    defender and settle at its feet.
  soundSystem.leafSweep();
  const rain = Math.round(d * 0.54);
  await Promise.all([
    frames(scene, rain, t => {
      g.clear();
      // The cloud thins as it empties, but it must not evaporate: the APART
      // check is taken at 75 %, when most of the powder is in mid-air.
      g.fillStyle(GRASS_EDGE, 0.95 * (1 - t * 0.5));
      g.fillEllipse(dx, overY, 78 * (1 - t * 0.25), 34 * (1 - t * 0.35));
      g.fillStyle(POWDER, 1 - t * 0.4);
      g.fillEllipse(dx, overY, 70 * (1 - t * 0.25), 26 * (1 - t * 0.35));
      for (const p of dots) {
        const ph = Math.min(1, t / p.fall);
        const x = Math.round(dx + p.ox + p.drift * ph);
        const y = Math.round(overY + p.oy + ph * (dy + FOOT_OFFSET - overY));
        g.fillStyle(p.bright ? POWDER_BRIGHT : POWDER, 1);
        g.fillCircle(x, y, p.r + 1);
        g.fillStyle(GRASS_EDGE, 1);
        g.fillCircle(x, y, p.r - 1 > 0 ? p.r - 1 : 1);
      }
      // The settled layer at the target's feet.
      g.fillStyle(GRASS_EDGE, 0.9);
      g.fillEllipse(dx, dy + FOOT_OFFSET + 2, 76 * t, 13 * t);
      g.fillStyle(POWDER, 1);
      g.fillEllipse(dx, dy + FOOT_OFFSET + 2, 68 * t, 9 * t);
    }),
    (async () => {
      await delay(scene, Math.round(rain * 0.3));
      impactTint(defenderSprite, POWDER);
      await tweenPromise(scene, {
        targets: defenderSprite, y: homeY + 2,
        duration: Math.round(rain * 0.4), ease: 'Sine.easeInOut',
      });
    })(),
  ]);
  g.destroy();
}

/**
 * ID 92 TOXIC - a lob, a SPLAT, and a stain that is still there at the end.
 *
 * POISON GAS (139) and SLUDGE (124) both render the generic body: a cloud, or
 * a blob that arrives and vanishes. TOXIC is the only move in the game that
 * leaves a mark - the blob spreads ACROSS the sprite as an irregular splat
 * with a dark-purple rim, sheds drips off the bottom of it, and holds a purple
 * tint right through to the last frame.
 */
async function renderToxic(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  const { scene, attackerSprite, defenderSprite } = ctx;
  const d = spec.duration; // 1000 ms via OVERRIDE_DURATION
  const ax = attackerSprite.x;
  const ay = attackerSprite.y - 6;
  const dx = Math.round(defenderSprite.x);
  const dy = Math.round(defenderSprite.y);

  soundSystem.spatter();

  const g = newG(scene, 872);

  // 1. The lob (0 -> 34 %): a fat blob on a high arc, growing as it comes.
  const lob = Math.round(d * 0.34);
  await frames(scene, lob, t => {
    g.clear();
    const x = Math.round(ax + (dx - ax) * t);
    const y = Math.round(ay + (dy - ay) * t - Math.sin(t * Math.PI) * 34);
    const r = Math.round(6 + t * 5);
    g.fillStyle(POISON_EDGE, 1);
    g.fillCircle(x, y, r + 2);
    g.fillStyle(POISON_C, 1);
    g.fillCircle(x, y, r);
    g.fillStyle(POISON_PALE, 1);
    g.fillCircle(x - 2, y - 2, Math.max(2, r - 4));
  });

  // 2. The splat (34 -> 62 %): the blob opens out over the sprite. Eight lobes
  //    of different sizes, seeded once, so the edge is ragged rather than a
  //    circle - a circle reads as a bubble, not as something thrown.
  const lobes = Array.from({ length: 9 }, (_, i) => ({
    a: (i / 9) * Math.PI * 2 + Math.random() * 0.4,
    d: 0.55 + Math.random() * 0.5,
    r: 0.35 + Math.random() * 0.4,
  }));
  const paintSplat = (k: number): void => {
    const R = 26 * k;
    g.fillStyle(POISON_EDGE, 1);
    g.fillEllipse(dx, dy, R * 2.1, R * 1.7);
    for (const l of lobes) {
      g.fillCircle(Math.round(dx + Math.cos(l.a) * R * l.d), Math.round(dy + Math.sin(l.a) * R * l.d * 0.8), R * l.r + 2);
    }
    g.fillStyle(POISON_C, 1);
    g.fillEllipse(dx, dy, R * 1.9, R * 1.5);
    for (const l of lobes) {
      g.fillCircle(Math.round(dx + Math.cos(l.a) * R * l.d), Math.round(dy + Math.sin(l.a) * R * l.d * 0.8), R * l.r);
    }
    g.fillStyle(POISON_PALE, 1);
    g.fillEllipse(dx - 4, dy - 4, R * 0.8, R * 0.6);
  };

  const splat = Math.round(d * 0.28);
  impactTint(defenderSprite, POISON_C);
  await Promise.all([
    frames(scene, splat, t => { g.clear(); paintSplat(0.35 + t * 0.65); }),
    screenShake(scene, 3, Math.round(splat * 0.4)),
  ]);

  // 3. The drips (62 -> 100 %): the splat thins to a stain and runs off the
  //    bottom of the sprite. The tint is NOT cleared - renderSpec's finally
  //    does that, so the poison is on the target until the animation ends.
  const drips = Array.from({ length: 7 }, (_, i) => ({
    x: dx - 18 + i * 6 + (Math.random() - 0.5) * 4,
    delay: Math.random() * 0.45,
    len: 14 + Math.random() * 16,
    w: 2 + Math.round(Math.random() * 2),
  }));
  const run = Math.round(d * 0.38);
  await frames(scene, run, t => {
    g.clear();
    paintSplat(1);
    for (const p of drips) {
      const ph = (t - p.delay) / (1 - p.delay);
      if (ph <= 0) continue;
      const y0 = dy + 8;
      const y1 = y0 + ph * p.len;
      g.fillStyle(POISON_EDGE, 1);
      g.fillRect(Math.round(p.x) - 1, y0, p.w + 2, y1 - y0);
      g.fillCircle(Math.round(p.x) + p.w / 2, y1, p.w / 2 + 2);
      g.fillStyle(POISON_C, 1);
      g.fillRect(Math.round(p.x), y0, p.w, y1 - y0);
      g.fillCircle(Math.round(p.x) + p.w / 2, y1, p.w / 2 + 1);
    }
  });
  g.destroy();
}

/**
 * ID 73 LEECH SEED - seeds, then vines, then the drain.
 *
 * ABSORB (71) is the generic drain body: motes travelling back to the
 * attacker, and nothing else. LEECH SEED's point is the plant in between -
 * three seeds land, four vines grow out of them and coil around the target,
 * and only then does the green flow back along the ground.
 */
async function renderLeechSeed(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  const { scene, attackerSprite, defenderSprite } = ctx;
  const d = spec.duration; // 1050 ms via OVERRIDE_DURATION
  const ax = Math.round(attackerSprite.x);
  const ay = Math.round(attackerSprite.y);
  const dx = Math.round(defenderSprite.x);
  const dy = Math.round(defenderSprite.y);

  soundSystem.leafSweep();

  const g = newG(scene, 868);

  // 1. The seeds (0 -> 26 %): three of them on staggered arcs.
  const seeds = [{ o: -8, h: 30 }, { o: 0, h: 40 }, { o: 8, h: 34 }];
  const throwMs = Math.round(d * 0.26);
  await frames(scene, throwMs, t => {
    g.clear();
    seeds.forEach((s, i) => {
      const ph = Math.min(1, Math.max(0, (t - i * 0.12) / 0.7));
      if (ph <= 0) return;
      const x = Math.round(ax + (dx + s.o - ax) * ph);
      const y = Math.round(ay + (dy + 6 - ay) * ph - Math.sin(ph * Math.PI) * s.h);
      g.fillStyle(GRASS_EDGE, 1);
      g.fillEllipse(x, y, 11, 9);
      g.fillStyle(SEED_C, 1);
      g.fillEllipse(x, y, 8, 6);
      g.fillStyle(VINE_DARK, 1);
      g.fillRect(x - 1, y - 6, 2, 4);
    });
  });

  // 2. The vines (26 -> 66 %): four coils wound around the sprite, drawn as
  //    thick curves that grow from the seeds up and around it, with leaves.
  const vines = [
    { phase: 0, turns: 1.6, rx: 20, ry: 8 },
    { phase: 1.4, turns: 1.9, rx: 17, ry: 7 },
    { phase: 2.9, turns: 1.5, rx: 22, ry: 9 },
    { phase: 4.3, turns: 2.1, rx: 15, ry: 6 },
  ];
  const grow = Math.round(d * 0.4);
  await Promise.all([
    frames(scene, grow, t => {
      g.clear();
      for (const v of vines) {
        const pts: Pt[] = [];
        const n = 22;
        for (let i = 0; i <= n; i++) {
          const s = (i / n) * t;
          const a = v.phase + s * v.turns * Math.PI * 2;
          pts.push({
            x: Math.round(dx + Math.cos(a) * v.rx),
            y: Math.round(dy + 16 - s * 34 + Math.sin(a) * v.ry),
          });
        }
        strokePath(g, pts, 7, GRASS_EDGE, 1);
        strokePath(g, pts, 4, GRASS, 1);
        // A leaf every few segments, on the outside of the coil.
        for (let i = 4; i < pts.length; i += 7) {
          const p = pts[i];
          g.fillStyle(GRASS_EDGE, 1);
          g.fillEllipse(p.x, p.y, 13, 8);
          g.fillStyle(VINE_DARK, 1);
          g.fillEllipse(p.x, p.y, 10, 5);
        }
      }
    }),
    (async () => {
      await delay(scene, Math.round(grow * 0.4));
      impactTint(defenderSprite, GRASS);
      await tweenPromise(scene, {
        targets: defenderSprite, scaleX: 0.86, scaleY: 1.08,
        duration: Math.round(grow * 0.3), yoyo: true, ease: 'Sine.easeInOut',
      });
    })(),
  ]);

  // 3. The drain (66 -> 100 %): motes stream back along the vines' own line to
  //    the attacker while the coils fade.
  const motes = Array.from({ length: 26 }, () => ({
    off: Math.random(),
    sway: (Math.random() - 0.5) * 18,
    r: 2 + Math.round(Math.random() * 2),
  }));
  const back = Math.round(d * 0.34);
  const drainG = newG(scene, 870);
  await Promise.all([
    tweenPromise(scene, { targets: g, alpha: 0.35, duration: back }),
    frames(scene, back, t => {
      drainG.clear();
      for (const m of motes) {
        const ph = (t * 1.35 + m.off) % 1;
        const x = Math.round(dx + (ax - dx) * ph);
        const y = Math.round(dy + (ay - dy) * ph + Math.sin(ph * Math.PI) * m.sway);
        drainG.fillStyle(GRASS_EDGE, 1);
        drainG.fillCircle(x, y, m.r + 2);
        drainG.fillStyle(GRASS, 1);
        drainG.fillCircle(x, y, m.r);
      }
    }),
    (async () => {
      await delay(scene, Math.round(back * 0.5));
      await tweenPromise(scene, {
        targets: attackerSprite, scaleX: 1.12, scaleY: 1.12,
        duration: Math.round(back * 0.22), yoyo: true, ease: 'Sine.easeOut',
      });
    })(),
  ]);
  g.destroy();
  drainG.destroy();
}

/**
 * ID 86 THUNDER WAVE - a wave, not a bolt.
 *
 * The other three Electric moves all put something bright in the sky or a jag
 * between the sprites: THUNDER (87) falls from above, THUNDERBOLT (85) arcs
 * across and cages the target, THUNDER SHOCK (84) is the generic beam. THUNDER
 * WAVE has no bolt at all - flattened rings roll out of the attacker along the
 * ground plane, wash over the defender, and leave it crackling.
 *
 * The rings are ELLIPSES with ry = 0.5 rx and rx capped at 118 for a reason
 * the e2e checks directly: the runner asserts THUNDER WAVE lights ZERO bright
 * pixels in the sky band (y <= defY - 13, x within 30 px of the defender),
 * which is the exact inverse of THUNDER's signature. A circular ring of the
 * radius needed to reach the defender would clip that band; a flattened one
 * passes through the defender's own body instead, which is where the wave
 * should be anyway. For the same reason the static crackle is clamped to
 * y >= defY - 8.
 */
async function renderThunderWave(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  const { scene, attackerSprite, defenderSprite } = ctx;
  const d = spec.duration; // 900 ms via OVERRIDE_DURATION
  const ax = Math.round(attackerSprite.x);
  const ay = Math.round(attackerSprite.y);
  const dx = Math.round(defenderSprite.x);
  const dy = Math.round(defenderSprite.y);
  const homeX = defenderSprite.x;

  soundSystem.staticBuzz();

  const g = newG(scene, 864);
  const RX_MAX = 118;

  // 1. The rings (0 -> 58 %): four fronts, each expanding and fading.
  const ripple = Math.round(d * 0.58);
  await frames(scene, ripple, t => {
    g.clear();
    for (let i = 0; i < 4; i++) {
      const ph = (t * 1.5 + i * 0.25) % 1;
      const rx = ph * RX_MAX;
      if (rx < 6) continue;
      const ry = rx * 0.5;
      g.lineStyle(9, EDGE, 0.85 * (1 - ph * 0.5));
      g.strokeEllipse(ax, ay, rx * 2, ry * 2);
      g.lineStyle(5, YELLOW, 1 - ph * 0.4);
      g.strokeEllipse(ax, ay, rx * 2, ry * 2);
      g.lineStyle(2, WHITE, 1 - ph * 0.5);
      g.strokeEllipse(ax, ay, rx * 2, ry * 2);
    }
  });

  // 2. The crackle (58 -> 100 %): short sparks reseeded around the target,
  //    never above defY - 4, while the sprite jitters in place: everything
  //    this move draws has to stay OUT of the sky strip the runner watches.
  const zap = Math.round(d * 0.42);
  const spark = newG(scene, 866);
  await Promise.all([
    frames(scene, zap, () => {
      spark.clear();
      for (let i = 0; i < 9; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = 12 + Math.random() * 14;
        const x0 = Math.round(dx + Math.cos(a) * r);
        const y0 = Math.max(dy - 4, Math.round(dy + Math.sin(a) * r * 0.8));
        const pts = spine(x0, y0, x0 + (Math.random() - 0.5) * 16, y0 + 6 + Math.random() * 10, 4, 5);
        strokePath(spark, pts, 5, EDGE, 1);
        strokePath(spark, pts, 3, YELLOW, 1);
      }
      // A held ring of current sitting on the target, so the crackle is not
      // just sparse sparks on a pale sky. It is centred LOW and kept flat on
      // purpose: the sky band the runner measures starts at defY - 13, and a
      // ring tall enough to reach it would light the one strip a ground wave
      // must never touch (that is THUNDER's signature, not this move's).
      spark.lineStyle(7, EDGE, 0.9);
      spark.strokeEllipse(dx, dy + 12, 62, 30);
      spark.lineStyle(4, YELLOW, 1);
      spark.strokeEllipse(dx, dy + 12, 62, 30);
    }),
    (async () => {
      impactTint(defenderSprite, YELLOW);
      await tweenPromise(scene, {
        targets: defenderSprite, x: homeX + 3,
        duration: 40, yoyo: true, repeat: Math.floor(zap / 90), ease: 'Linear',
      });
    })(),
  ]);
  g.destroy();
  spark.destroy();
}

/**
 * ID 35 WRAP - one long coil, laid on in loops, then pulled tight.
 *
 * BIND (20) below is the same generic `bind` motion on `main`, so the two have
 * to be told apart by shape alone: WRAP is a single sinuous rope spiralling
 * DOWN the target across three loops which then shrink, squeezing it
 * horizontally. BIND is two straight bands closing in from the sides.
 */
async function renderWrap(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  const { scene, defenderSprite } = ctx;
  const d = spec.duration; // 1000 ms via OVERRIDE_DURATION
  const dx = Math.round(defenderSprite.x);
  const dy = Math.round(defenderSprite.y);

  soundSystem.constrict();

  const g = newG(scene, 870);
  const coil = (grown: number, squeeze: number): void => {
    const pts: Pt[] = [];
    const n = 60;
    for (let i = 0; i <= n; i++) {
      const s = (i / n) * grown;
      const a = -Math.PI / 2 + s * 3 * Math.PI * 2;
      const rx = (27 - s * 3) * squeeze;
      pts.push({
        x: Math.round(dx + Math.cos(a) * rx),
        y: Math.round(dy - 22 + s * 44 + Math.sin(a) * 6),
      });
    }
    strokePath(g, pts, 13, NORMAL_EDGE, 1);
    strokePath(g, pts, 9, TAN, 1);
    strokePath(g, pts, 3, NORMAL_PALE, 1);
  };

  // 1. Winding (0 -> 55 %): the rope arrives from the side and loops on.
  const wind = Math.round(d * 0.55);
  await frames(scene, wind, t => {
    g.clear();
    coil(Math.max(0.02, t), 1);
  });

  // 2. Tightening (55 -> 100 %): the loops shrink and the target is squeezed.
  soundSystem.thud();
  const tight = Math.round(d * 0.45);
  await Promise.all([
    frames(scene, tight, t => {
      g.clear();
      coil(1, 1 - 0.3 * Math.sin(t * Math.PI * 2) ** 2 - t * 0.12);
    }),
    tweenPromise(scene, {
      targets: defenderSprite, scaleX: 0.68, scaleY: 1.12,
      duration: Math.round(tight * 0.28), yoyo: true, repeat: 1, ease: 'Sine.easeInOut',
    }),
  ]);
  g.destroy();
}

/**
 * ID 20 BIND - two slabs close from the sides and pulse.
 *
 * Deliberately the opposite shape to WRAP: no curve anywhere, and the squeeze
 * is vertical instead of horizontal. The bands run off both edges of the
 * field, which is also what gives the move its pixel mass.
 */
async function renderBind(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  const { scene, defenderSprite } = ctx;
  const d = spec.duration; // 900 ms via OVERRIDE_DURATION
  const dx = Math.round(defenderSprite.x);
  const dy = Math.round(defenderSprite.y);

  soundSystem.constrict();

  const g = newG(scene, 870);
  const BAND_H = 19;
  const bands = (gap: number): void => {
    const y = dy - Math.round(BAND_H / 2);
    const lx = Math.round(dx - gap);
    const rx = Math.round(dx + gap);
    g.fillStyle(NORMAL_EDGE, 1);
    g.fillRect(-2, y - 2, lx + 2, BAND_H + 4);
    g.fillRect(rx, y - 2, GAME_W - rx + 2, BAND_H + 4);
    g.fillStyle(TAN, 1);
    g.fillRect(-2, y + 1, lx - 1, BAND_H - 2);
    g.fillRect(rx + 3, y + 1, GAME_W - rx, BAND_H - 2);
    g.fillStyle(NORMAL_PALE, 1);
    g.fillRect(-2, y + 3, lx - 4, 3);
    g.fillRect(rx + 6, y + 3, GAME_W - rx, 3);
    // The jaws: a blunt cap on the inner end of each band.
    g.fillStyle(NORMAL_EDGE, 1);
    g.fillRect(lx - 4, y - 5, 6, BAND_H + 10);
    g.fillRect(rx - 2, y - 5, 6, BAND_H + 10);
  };

  // 1. Closing (0 -> 45 %).
  const close = Math.round(d * 0.45);
  await frames(scene, close, t => {
    g.clear();
    bands(Math.round(46 - t * 30));
  });

  // 2. Pulsing (45 -> 100 %): three squeezes, the target flattened each time.
  soundSystem.thud();
  const pulse = Math.round(d * 0.55);
  await Promise.all([
    frames(scene, pulse, t => {
      g.clear();
      bands(16 - Math.round(Math.abs(Math.sin(t * Math.PI * 3)) * 8));
    }),
    tweenPromise(scene, {
      targets: defenderSprite, scaleY: 0.68, scaleX: 1.14,
      duration: Math.round(pulse / 6), yoyo: true, repeat: 2, ease: 'Sine.easeInOut',
    }),
  ]);
  g.destroy();
}

/**
 * ID 98 QUICK ATTACK - the hit lands before you see it.
 *
 * The fastest thing in the battle: 300 ms of budget against TACKLE's 240 ms of
 * generic contact, and the attacker spends most of it not drawn at all. What
 * you get instead is a row of afterimages already strung across the field and
 * a set of speed streaks, and the impact is over almost as soon as it starts.
 *
 * The afterimages are tinted NORMAL rather than white: a white ghost on the
 * #f8f8f8 sky is invisible, both to the eye and to the e2e's changed-pixel
 * count, which is the same trap the bolts hit in PR 4a.
 */
async function renderQuickAttack(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  const { scene, attackerSprite, defenderSprite } = ctx;
  const d = spec.duration; // 300 ms via OVERRIDE_DURATION - the hard ceiling
  const ax = attackerSprite.x;
  const ay = attackerSprite.y;
  const dx = Math.round(defenderSprite.x);
  const dy = Math.round(defenderSprite.y);
  const homeX = defenderSprite.x;

  soundSystem.dash();

  const ghosts = Array.from({ length: 5 }, (_, i) => {
    const img = scene.add.image(ax, ay, attackerSprite.texture.key, attackerSprite.frame.name);
    img.setDepth(868);
    img.setScrollFactor(0);
    img.setTint(i % 2 === 0 ? NORMAL : NORMAL_PALE);
    img.setAlpha(0);
    return img;
  });
  attackerSprite.setAlpha(0);

  const g = newG(scene, 866);
  const streak = Math.round(d * 0.55);
  await frames(scene, streak, t => {
    g.clear();
    ghosts.forEach((img, i) => {
      const s = Math.min(1, Math.max(0, t * 1.3 - i * 0.13));
      img.setPosition(ax + (dx - ax) * s, ay + (dy - ay) * s);
      img.setAlpha(s > 0 ? 0.85 - i * 0.13 : 0);
    });
    // Speed lines along the path, dark-edged so they exist on a pale sky.
    for (let i = 0; i < 4; i++) {
      const off = -14 + i * 9;
      const x0 = ax + (dx - ax) * Math.max(0, t - 0.35);
      const y0 = ay + (dy - ay) * Math.max(0, t - 0.35) + off;
      const x1 = ax + (dx - ax) * Math.min(1, t + 0.1);
      const y1 = ay + (dy - ay) * Math.min(1, t + 0.1) + off;
      strokePath(g, [{ x: x0, y: y0 }, { x: x1, y: y1 }], 6, NORMAL_EDGE, 0.9);
      strokePath(g, [{ x: x0, y: y0 }, { x: x1, y: y1 }], 3, NORMAL_PALE, 1);
    }
  });

  // The impact is already happening by the time the streaks resolve.
  impactTint(defenderSprite, NORMAL_PALE);
  await Promise.all([
    impactBurst(scene, dx, dy, NORMAL, NORMAL_PALE, 20, Math.round(d * 0.3)),
    tweenPromise(scene, {
      targets: defenderSprite, x: homeX + 6,
      duration: Math.round(d * 0.13), yoyo: true, ease: 'Quad.easeOut',
    }),
  ]);
  ghosts.forEach(img => img.destroy());
  g.destroy();
}

/**
 * ID 129 SWIFT - stars, in bursts, that never miss.
 *
 * A generic Normal projectile is one dust ball on a straight line. SWIFT is
 * two overlapping sprays of five-pointed stars in two sizes, each one homing
 * along its own curved path onto the target and bursting there. The stars are
 * yellow, which is the one off-type palette in this batch (see EXPECTED_TYPE
 * in tools/anim-e2e.mjs): a khaki star is not a star.
 */
async function renderSwift(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  const { scene, attackerSprite, defenderSprite } = ctx;
  const d = spec.duration; // 900 ms via OVERRIDE_DURATION
  const ax = attackerSprite.x;
  const ay = attackerSprite.y - 4;
  const dx = Math.round(defenderSprite.x);
  const dy = Math.round(defenderSprite.y);

  soundSystem.starShimmer();

  const stars = Array.from({ length: 18 }, (_, i) => ({
    burst: i < 9 ? 0 : 1,
    lead: (i % 9) * 0.045,
    bow: (i % 2 === 0 ? 1 : -1) * (14 + (i % 4) * 9),
    r: i % 3 === 0 ? 13 : 9,
    spin: Math.random() * Math.PI,
    tx: dx + (Math.random() - 0.5) * 22,
    ty: dy + (Math.random() - 0.5) * 22,
  }));

  const g = newG(scene, 870);
  const fly = Math.round(d * 0.72);
  await Promise.all([
    frames(scene, fly, t => {
      g.clear();
      for (const s of stars) {
        const ph = (t - s.burst * 0.3 - s.lead) / 0.55;
        if (ph <= 0 || ph > 1.2) continue;
        const p = Math.min(1, ph);
        const x = ax + (s.tx - ax) * p;
        const y = ay + (s.ty - ay) * p - Math.sin(p * Math.PI) * s.bow;
        // A short trail behind each star so the spray reads as motion.
        const pb = Math.max(0, p - 0.12);
        strokePath(g, [
          { x: ax + (s.tx - ax) * pb, y: ay + (s.ty - ay) * pb - Math.sin(pb * Math.PI) * s.bow },
          { x, y },
        ], 4, EDGE, 0.8);
        fillStar(g, Math.round(x), Math.round(y), s.r, s.spin + p * 4);
      }
    }),
    (async () => {
      await delay(scene, Math.round(d * 0.42));
      await spriteFlash(defenderSprite, scene, YELLOW, 2);
    })(),
  ]);

  // The scatter: the stars that landed break up over the target.
  await Promise.all([
    impactBurst(scene, dx, dy, YELLOW, STAR_PALE, 22, Math.round(d * 0.28)),
    directionalParticles(scene, dx, dy, YELLOW, 14, {
      spread: 34, duration: Math.round(d * 0.28), shape: 'shard', accentColor: STAR_PALE,
    }),
  ]);
  g.destroy();
}

/**
 * ID 45 GROWL - sound, twice, out of the attacker's mouth.
 *
 * SING (47) travels; TAIL WHIP (39) happens at the attacker's tail. GROWL is
 * four nested arcs centred on the attacker's mouth, fanned towards the
 * defender, fired twice - so its pixels sit in a wedge between the two sprites
 * and nowhere else, and the defender only reacts by flinching backwards.
 */
async function renderGrowl(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  const { scene, attackerSprite, defenderSprite } = ctx;
  const d = spec.duration; // 800 ms via OVERRIDE_DURATION
  const dx = defenderSprite.x;
  const dy = defenderSprite.y;
  const dir = Math.sign(dx - attackerSprite.x) || 1;
  const mx = Math.round(attackerSprite.x + dir * 9);
  const my = Math.round(attackerSprite.y - 4);
  const aim = Math.atan2(dy - my, dx - mx);
  const homeX = defenderSprite.x;

  soundSystem.roar();

  const g = newG(scene, 868);
  const burst = (t: number): void => {
    for (let i = 0; i < 4; i++) {
      const ph = t * 1.25 - i * 0.12;
      if (ph <= 0 || ph > 1) continue;
      // The arcs must be spaced by RADIUS, not only by phase: at 4 px apart
      // the four of them land on top of each other late in the burst and the
      // whole wedge shrinks to one thick line.
      const r = 10 + ph * 56 + i * 13;
      const half = 0.9 - ph * 0.2;
      const pts = arcPts(mx, my, r, aim - half, aim + half, 20);
      strokePath(g, pts, 11, NORMAL_EDGE, 1 - ph * 0.3);
      strokePath(g, pts, 6, TAN, 1 - ph * 0.25);
      strokePath(g, pts, 2, NORMAL_PALE, 1 - ph * 0.3);
    }
  };

  const one = Math.round(d * 0.42);
  await Promise.all([
    frames(scene, one, t => { g.clear(); burst(t); }),
    (async () => {
      await delay(scene, Math.round(one * 0.6));
      await tweenPromise(scene, {
        targets: defenderSprite, x: homeX + Math.sign(dir) * 3,
        duration: Math.round(one * 0.2), yoyo: true, ease: 'Quad.easeOut',
      });
    })(),
  ]);

  soundSystem.roar();
  const two = Math.round(d * 0.46);
  impactTint(defenderSprite, TAN);
  await Promise.all([
    frames(scene, two, t => { g.clear(); burst(t); }),
    (async () => {
      await delay(scene, Math.round(two * 0.45));
      await tweenPromise(scene, {
        targets: defenderSprite, x: homeX + Math.sign(dir) * 3,
        duration: Math.round(two * 0.18), yoyo: true, ease: 'Quad.easeOut',
      });
    })(),
  ]);
  g.destroy();
}

/**
 * ID 39 TAIL WHIP - the attacker does the moving.
 *
 * The mirror image of GROWL: nothing travels, and the big shape is a swept fan
 * BEHIND the attacker rather than a fan of arcs in front of it. The attacker
 * rocks through a rotation tween twice (which the generic body never does to
 * the attacker at all), and the defender's only reaction is to tint and sink.
 */
async function renderTailWhip(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  const { scene, attackerSprite, defenderSprite } = ctx;
  const d = spec.duration; // 800 ms via OVERRIDE_DURATION
  const ax = Math.round(attackerSprite.x);
  const ay = Math.round(attackerSprite.y);
  const dir = Math.sign(defenderSprite.x - ax) || 1;
  const rot0 = attackerSprite.rotation;
  const homeY = defenderSprite.y;

  soundSystem.whoosh();

  const g = newG(scene, 864);
  // The swipe: a fan of arcs sweeping through 150 degrees behind the attacker,
  // trailing five fading copies of itself.
  const swipe = (t: number, from: number, to: number): void => {
    const a = from + (to - from) * t;
    for (let i = 0; i < 6; i++) {
      const ta = a - (to - from) * i * 0.09;
      const alpha = 1 - i * 0.15;
      for (const r of [18, 27, 36, 45, 54]) {
        const pts = arcPts(ax, ay + 4, r, ta - 0.34, ta + 0.34, 10);
        strokePath(g, pts, 9, NORMAL_EDGE, alpha);
        strokePath(g, pts, 6, TAN, alpha);
      }
    }
  };

  const one = Math.round(d * 0.4);
  await Promise.all([
    frames(scene, one, t => { g.clear(); swipe(t, -dir * 0.2, -dir * 2.6); }),
    tweenPromise(scene, {
      targets: attackerSprite, rotation: -dir * 0.22,
      duration: Math.round(one * 0.45), yoyo: true, ease: 'Sine.easeInOut',
    }),
  ]);

  soundSystem.whoosh();
  const two = Math.round(d * 0.38);
  await Promise.all([
    frames(scene, two, t => { g.clear(); swipe(t, -dir * 2.6, -dir * 0.2); }),
    tweenPromise(scene, {
      targets: attackerSprite, rotation: dir * 0.22,
      duration: Math.round(two * 0.45), yoyo: true, ease: 'Sine.easeInOut',
    }),
  ]);
  attackerSprite.setRotation(rot0);

  // The defence drop: the target sinks and dulls.
  const sink = Math.round(d * 0.22);
  impactTint(defenderSprite, NORMAL);
  await Promise.all([
    frames(scene, sink, t => {
      g.clear();
      g.fillStyle(NORMAL_EDGE, 0.85 * (1 - t));
      g.fillEllipse(defenderSprite.x, defenderSprite.y + FOOT_OFFSET, 46, 12);
      g.fillStyle(TAN, 1 - t);
      g.fillEllipse(defenderSprite.x, defenderSprite.y + FOOT_OFFSET, 40, 8);
    }),
    tweenPromise(scene, {
      targets: defenderSprite, y: homeY + 2,
      duration: Math.round(sink * 0.5), yoyo: true, ease: 'Sine.easeInOut',
    }),
  ]);
  g.destroy();
}

registerSpecOverride('sing', renderSing);
registerSpecOverride('sleepPowder', renderSleepPowder);
registerSpecOverride('toxic', renderToxic);
registerSpecOverride('leechSeed', renderLeechSeed);
registerSpecOverride('thunderWave', renderThunderWave);
registerSpecOverride('wrap', renderWrap);
registerSpecOverride('bind', renderBind);
registerSpecOverride('quickAttack', renderQuickAttack);
registerSpecOverride('swift', renderSwift);
registerSpecOverride('growl', renderGrowl);
registerSpecOverride('tailWhip', renderTailWhip);

// ===========================================================================
// Self-target set-pieces
// (TRANSFORM / SUBSTITUTE / REST / DOUBLE TEAM / MINIMIZE / LIGHT SCREEN /
//  SWORDS DANCE / SPLASH)
// ===========================================================================
//
// All eight of these used to render as ONE generic body: `self-aura`, a ring
// and a sparkle at the attacker. So "does MINIMIZE look like DOUBLE TEAM?" was
// not a rhetorical question either - they were the same 320 ms of animation
// with a different palette. tools/anim-e2e.mjs measures each of them against
// that stripped body AND against the sibling the brief names, exactly as the
// two earlier batches are measured.
//
// Three constraints shape this batch specifically:
//   - Nothing here touches the defender. No screenFlash, no screenShake, no
//     effect drawn past the middle of the field: the runner's SELF-DEF check
//     asserts the defender's 41x41 bbox is UNCHANGED at 50 %, which is the
//     cheapest possible proof that a self-target move targets the self.
//   - The attacker has to end exactly where it started - position, scale,
//     alpha and tint. `renderSpec` restores position/alpha/scale/tint in a
//     `finally`, but MINIMIZE and TRANSFORM both leave scale and texture in a
//     deliberate state, so every function here puts the sprite back by hand
//     and the runner re-reads x/y/alpha/scaleX/scaleY afterwards.
//   - Dark edges, again. Four of the eight want a pale palette (white, pale
//     yellow, pale green, white-blue) and every one of those is invisible on
//     the #f8f8f8 sky, both to the eye and to the changed-pixel count.

/** TRANSFORM's morph light. The brief asks for white/blue, and white is not
 *  merely a bad vote here - it is not VISIBLE on a #f8f8f8 sky. So the wrap is
 *  the pale blue next to it, over a navy edge, which votes ICE: the first of
 *  this batch's four declared off-type palettes (EXPECTED_TYPE 144 in
 *  tools/anim-e2e.mjs). A khaki Normal glow would be the generic self-aura. */
const MORPH = 0x66CCFF;
const MORPH_PALE = 0xAADDFF;
const MORPH_EDGE = 0x123A5A;
/** The dark edge for the four Normal-typed moves here. 0x40402C (NORMAL_EDGE)
 *  is darker and prettier but votes GRASS; 0x707060 is the darkest outline
 *  that still votes NORMAL, which matters when the outline is a third of the
 *  ink a move puts on the screen. */
const NORMAL_DARK = 0x707060;
/** SUBSTITUTE's doll: the Gen-1 figure is green over brown, so the body is the
 *  batch tan (0xB8A878, the warmest tan that still votes NORMAL) and the base
 *  is a deep green. The smoke is tan too, and it is the bulk of the move. */
const DOLL_GREEN = 0x3A7A3A;
/** REST's heal shimmer. Green is the Gen-1 heal colour and the brief's own
 *  choice; on a Psychic move that is an off-type vote (EXPECTED_TYPE 156), but
 *  a pink haze hanging over the attacker is precisely the generic self-aura
 *  this override exists to replace. */
const HEAL = 0x44BB44;
const HEAL_DEEP = 0x2E8B2E;
/** Multiply tint: the sleeping sprite dims without going black. */
const REST_DARK = 0x707060;
/** LIGHT SCREEN's pane is the brief's pale yellow. Held at alpha 0.85 over the
 *  sky it votes ELECTRIC; at 0.75 the blend slides to GROUND, which is why the
 *  alpha is a named constant and not a taste decision (EXPECTED_TYPE 113). */
const PANE = 0xFFCC00;
const PANE_ALPHA = 0.85;
const PANE_GLINT = 0xFFEE99;
/** SWORDS DANCE: steel bright enough to read on a pale sky (a white blade is
 *  not there), a brown hilt, and a red aura kept to thin rings - a solid red
 *  wash would swing the vote to FIRE on a Normal move. */
const STEEL = 0xD8D8C0;
const HILT = 0x8A5A2A;
const AURA_RED = 0xCC3322;
/** SPLASH's droplets. The joke is a Water-flavoured move that accomplishes
 *  nothing, so the droplets are water blue and 150 is declared WATER in
 *  EXPECTED_TYPE; khaki droplets would be dust. */
const DROP = 0x3399FF;
const DROP_PALE = 0x99CCFF;
const DROP_EDGE = 0x11447A;

/** A filled, dark-edged blob: edge, body, pale core. Used for smoke, puffs and
 *  the TRANSFORM collapse - anything that has to be a shape, not a haze. */
function blob(
  g: Phaser.GameObjects.Graphics,
  x: number, y: number, rx: number, ry: number,
  edge: number, body: number, core: number,
  alpha = 1,
): void {
  g.fillStyle(edge, alpha);
  g.fillEllipse(x, y, rx * 2 + 4, ry * 2 + 4);
  g.fillStyle(body, alpha);
  g.fillEllipse(x, y, rx * 2, ry * 2);
  g.fillStyle(core, alpha);
  g.fillEllipse(x, y - ry * 0.25, rx, ry);
}

/**
 * ID 144 TRANSFORM - the attacker stops being itself.
 *
 * Four beats in a fixed order: a blue wrap closing in, a collapse to a bright
 * blob, the blob stretching into the DEFENDER's silhouette, and the silhouette
 * fading off a sprite that is now wearing the defender's texture.
 *
 * On the end state, which the brief asks about: nothing in the engine swaps
 * the texture. `BattleEngine.MoveEffect.TRANSFORM` is a message and a comment
 * ("Simplified: message only (not full stat copy)"), and the only
 * `setTexture` calls in `BattleScene` are send-out and switch-in. So there is
 * no swap to fight and none to wait for - the animation performs it, on its
 * last beat, and it persists exactly as long as the Pokemon stays out. The
 * attacker's own frame index is kept so a back sprite stays a back sprite.
 * `renderSpec`'s restore touches position/alpha/scale/tint and not texture, so
 * it leaves the swap alone.
 */
async function renderTransform(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  const { scene, attackerSprite, defenderSprite } = ctx;
  const d = spec.duration; // 1100 ms via OVERRIDE_DURATION
  const ax = attackerSprite.x;
  const ay = attackerSprite.y;
  const sx0 = attackerSprite.scaleX;
  const sy0 = attackerSprite.scaleY;
  const a0 = attackerSprite.alpha;
  const defKey = defenderSprite.texture.key;
  const atkFrame = attackerSprite.frame.name;

  soundSystem.morph();

  const g = newG(scene, 870);
  const cage = newG(scene, 866);

  // The morph cage: two heavy dark-edged rings that are on screen for the
  // WHOLE move. Without them the middle of the animation is a small bright
  // blob on a white sky - bold to the eye for a frame, and almost nothing to
  // a changed-pixel count. `k` breathes them in and out with the beats.
  const drawCage = (k: number, alpha: number): void => {
    cage.clear();
    if (alpha <= 0.02) return;
    for (const [rx, ry] of [[44, 34], [30, 23]] as const) {
      cage.lineStyle(6, MORPH_EDGE, 0.85 * alpha);
      cage.strokeEllipse(ax, ay, rx * 2 * k, ry * 2 * k);
      cage.lineStyle(3, MORPH, alpha);
      cage.strokeEllipse(ax, ay, rx * 2 * k, ry * 2 * k);
    }
  };

  // 1. The wrap: four rings closing in, and the sprite drowning in blue.
  const wrap = Math.round(d * 0.26);
  attackerSprite.setTint(MORPH_PALE);
  await frames(scene, wrap, t => {
    g.clear();
    for (let i = 0; i < 4; i++) {
      const phase = (t + i / 4) % 1;
      const r = 40 * (1 - phase) + 5;
      g.lineStyle(6, MORPH_EDGE, 0.9);
      g.strokeEllipse(ax, ay, r * 2, r * 1.6);
      g.lineStyle(3, MORPH, 1);
      g.strokeEllipse(ax, ay, r * 2, r * 1.6);
    }
    drawCage(0.7 + 0.3 * t, t);
  });

  // 2. The collapse: the sprite folds into a blob of light.
  const fold = Math.round(d * 0.2);
  await Promise.all([
    tweenPromise(scene, {
      targets: attackerSprite,
      scaleX: sx0 * 0.25, scaleY: sy0 * 0.25, alpha: 0,
      duration: fold, ease: 'Quad.easeIn',
    }),
    frames(scene, fold, t => {
      g.clear();
      const r = 6 + 11 * t;
      blob(g, ax, ay, r, r * 0.8, MORPH_EDGE, MORPH, MORPH_PALE);
      drawCage(1 - 0.35 * t, 1);
    }),
  ]);
  attackerSprite.setAlpha(0);

  // 3. The stretch: the blob becomes the defender's outline, flat white-blue.
  const silhouette = scene.add.image(ax, ay, defKey, atkFrame);
  silhouette.setDepth(872);
  silhouette.setScrollFactor(0);
  silhouette.setTintFill(MORPH_PALE);
  silhouette.setScale(sx0 * 1.7, sy0 * 0.16);
  const stretch = Math.round(d * 0.26);
  await Promise.all([
    tweenPromise(scene, {
      targets: silhouette,
      scaleX: sx0, scaleY: sy0,
      duration: stretch, ease: 'Back.easeOut',
    }),
    frames(scene, stretch, t => {
      g.clear();
      const r = 17 * (1 - t);
      if (r > 1) blob(g, ax, ay, r, r * 0.8, MORPH_EDGE, MORPH, MORPH_PALE, 1 - t * 0.6);
      // A dark outline under the silhouette so it exists against the sky.
      g.lineStyle(4, MORPH_EDGE, 0.85 * (1 - t * 0.4));
      g.strokeEllipse(ax, ay, 34 * sx0, 38 * sy0);
      drawCage(0.65 + 0.45 * t, 1);
    }),
  ]);
  g.clear();

  // 4. The settle: the real texture is underneath; the flat silhouette lifts.
  attackerSprite.setTexture(defKey, atkFrame);
  attackerSprite.clearTint();
  attackerSprite.setScale(sx0, sy0);
  attackerSprite.setPosition(ax, ay);
  attackerSprite.setAlpha(a0);
  const settle = Math.round(d * 0.28);
  await Promise.all([
    tweenPromise(scene, {
      targets: silhouette, alpha: 0,
      duration: settle, ease: 'Sine.easeOut',
    }),
    // The cage blows outward and goes with it, so the last third of the move
    // is still a picture and not just a cross-fade.
    frames(scene, settle, t => drawCage(1.1 + t * 0.5, 1 - t)),
  ]);
  silhouette.destroy();
  cage.destroy();
  g.destroy();
}

/** SUBSTITUTE's doll, drawn at the Graphics' own origin so it can be scaled in
 *  as a unit: a 12x12 dark-edged figure with a green base and two dot eyes. */
function drawDoll(g: Phaser.GameObjects.Graphics): void {
  g.fillStyle(NORMAL_DARK, 1);
  g.fillRect(-7, -9, 14, 18);      // silhouette, edge included
  g.fillRect(-9, -3, 18, 6);       // arms
  g.fillStyle(TAN, 1);
  g.fillRect(-5, -7, 10, 14);
  g.fillRect(-8, -2, 16, 4);
  g.fillStyle(DOLL_GREEN, 1);
  g.fillRect(-5, 1, 10, 6);        // the green lower half
  g.fillStyle(NORMAL_DARK, 1);
  g.fillRect(-3, -5, 2, 2);        // eyes
  g.fillRect(1, -5, 2, 2);
  g.fillRect(-5, 7, 3, 3);         // feet
  g.fillRect(2, 7, 3, 3);
}

/**
 * ID 164 SUBSTITUTE - you give up some health and get a decoy.
 *
 * REST, its sibling in the brief, is the attacker going quiet in place; this
 * is the attacker getting OUT OF THE WAY. It flashes, slides back, and a bank
 * of smoke rolls forward and clears onto a doll that is still standing there
 * when the animation ends.
 *
 * The engine has no substitute sprite and this does not add one: the doll is
 * Graphics, destroyed with the rest of the animation, and no scene state
 * changes.
 */
async function renderSubstitute(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  const { scene, attackerSprite } = ctx;
  const d = spec.duration; // 1000 ms via OVERRIDE_DURATION
  const ax = attackerSprite.x;
  const ay = attackerSprite.y;
  const a0 = attackerSprite.alpha;
  // "In front of" the attacker is toward the middle of the field either way.
  const dir = ctx.isPlayer ? 1 : -1;

  soundSystem.poof();

  // 1. The flash. setTintFill, not setTint: a multiply tint toward white is
  // almost a no-op, and the point is that the sprite blanks out.
  const flash = Math.round(d * 0.16);
  await frames(scene, flash, t => {
    if (Math.floor(t * 6) % 2 === 0) attackerSprite.setTintFill(NORMAL_PALE);
    else attackerSprite.clearTint();
  });
  attackerSprite.clearTint();

  // 2. The slide back, away from where the doll will stand.
  await tweenPromise(scene, {
    targets: attackerSprite,
    x: ax - dir * 13, y: ay + 2,
    duration: Math.round(d * 0.18), ease: 'Quad.easeOut',
  });

  // 3. The smoke: a bank of dark-edged puffs that swells and then clears.
  const g = newG(scene, 866);
  const dollX = ax + dir * 12;
  const dollY = ay + 4;
  const puffs = Array.from({ length: 14 }, (_, i) => ({
    x: dollX + (Math.random() - 0.5) * 34,
    y: dollY + (Math.random() - 0.5) * 28,
    r: 7 + Math.random() * 6,
    p: i / 14,
  }));
  // A smoke ring on the ground that keeps expanding long after the bank has
  // lifted: the doll is small on purpose (the brief asks for 12x12), so the
  // ring is what keeps the back half of the animation on screen.
  const ring = newG(scene, 865);
  const drawRing = (k: number, alpha: number): void => {
    ring.clear();
    if (alpha <= 0.02) return;
    ring.lineStyle(6, NORMAL_DARK, 0.85 * alpha);
    ring.strokeEllipse(dollX, dollY + 10, 30 + k * 34, 11 + k * 14);
    ring.lineStyle(3, TAN, alpha);
    ring.strokeEllipse(dollX, dollY + 10, 30 + k * 34, 11 + k * 14);
  };
  const smoke = Math.round(d * 0.3);
  await frames(scene, smoke, t => {
    g.clear();
    for (const p of puffs) {
      const s = Math.min(1, Math.max(0, t * 1.7 - p.p * 0.5));
      const fade = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
      if (s <= 0 || fade <= 0) continue;
      blob(g, p.x, p.y - 8 * s, p.r * (0.4 + s), p.r * (0.35 + s * 0.8),
        NORMAL_DARK, TAN, NORMAL_PALE, fade);
    }
    drawRing(t * 0.5, Math.min(1, t * 3));
  });

  // 4. The doll, revealed by the clearing smoke, and it stays.
  const doll = newG(scene, 869);
  drawDoll(doll);
  doll.setPosition(dollX, dollY);
  doll.setScale(0.2, 0.2);
  doll.setAlpha(0);
  await Promise.all([
    tweenPromise(scene, {
      targets: doll, scaleX: 1, scaleY: 1, alpha: 1,
      duration: Math.round(d * 0.14), ease: 'Back.easeOut',
    }),
    frames(scene, Math.round(d * 0.14), t => {
      g.clear();
      for (const p of puffs) {
        blob(g, p.x, p.y - 10 - 6 * t, p.r * 1.35, p.r * 1.15,
          NORMAL_DARK, TAN, NORMAL_PALE, 1 - t * 0.8);
      }
      drawRing(0.5 + t * 0.3, 1);
    }),
  ]);
  g.destroy();

  // 5. The attacker settles back behind its decoy; the doll is still there.
  const back = Math.round(d * 0.22);
  await Promise.all([
    tweenPromise(scene, {
      targets: attackerSprite, x: ax, y: ay,
      duration: back, ease: 'Sine.easeInOut',
    }),
    frames(scene, back, t => drawRing(0.8 + t * 0.5, 1 - t * 0.7)),
  ]);
  ring.destroy();
  doll.destroy();
  attackerSprite.setPosition(ax, ay);
  attackerSprite.setAlpha(a0);
  attackerSprite.clearTint();
}

/** One big "Z", `s` px on a side, dark-edged over a green core so it reads on
 *  the sky and carries the same hue as the shimmer under it. */
function drawBigZ(g: Phaser.GameObjects.Graphics, x: number, y: number, s: number, alpha: number): void {
  const pts: Pt[] = [
    { x, y }, { x: x + s, y }, { x, y: y + s }, { x: x + s, y: y + s },
  ];
  strokePath(g, pts, Math.max(5, s * 0.4), HEAL_DEEP, alpha);
  strokePath(g, pts, Math.max(2, s * 0.2), HEAL, alpha);
}

/**
 * ID 156 REST - the attacker goes to sleep on purpose.
 *
 * SLEEP POWDER, the move the brief says this must not resemble, is a cloud
 * that travels to the OTHER sprite and rains on it. REST never leaves home:
 * the sprite dims and sinks two pixels, a green heal shimmer breathes over it,
 * and three sizes of "Z" drift up and away. It is also the slowest thing in
 * the batch, which is the point - 1000 ms of calm next to SUBSTITUTE's bang.
 */
async function renderRest(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  const { scene, attackerSprite } = ctx;
  const d = spec.duration; // 1000 ms via OVERRIDE_DURATION
  const ax = attackerSprite.x;
  const ay = attackerSprite.y;
  const a0 = attackerSprite.alpha;

  soundSystem.snore();

  // Dim and sink. A multiply tint darkens without blacking the sprite out.
  attackerSprite.setTint(REST_DARK);
  await tweenPromise(scene, {
    targets: attackerSprite, y: ay + 2,
    duration: Math.round(d * 0.14), ease: 'Sine.easeOut',
  });

  const g = newG(scene, 868);
  const zg = newG(scene, 869);
  // Three Z's, three sizes, three speeds: they leave in the order they are
  // drawn and never line up, which is what makes it read as breathing.
  const zs = [
    { s: 8, delay: 0.0, dx: 7 },
    { s: 12, delay: 0.3, dx: 12 },
    { s: 16, delay: 0.6, dx: 18 },
  ];
  const motes = Array.from({ length: 10 }, () => ({
    a: Math.random() * Math.PI * 2,
    r: 10 + Math.random() * 12,
    p: Math.random(),
  }));

  const body = Math.round(d * 0.72);
  await frames(scene, body, t => {
    g.clear();
    zg.clear();
    // The heal shimmer: a breathing green halo plus motes rising through it.
    const pulse = 0.5 + 0.5 * Math.sin(t * Math.PI * 4);
    g.lineStyle(5, HEAL_DEEP, 0.75);
    g.strokeEllipse(ax, ay + 2, 40 + pulse * 8, 46 + pulse * 6);
    g.lineStyle(3, HEAL, 0.95);
    g.strokeEllipse(ax, ay + 2, 40 + pulse * 8, 46 + pulse * 6);
    g.lineStyle(3, HEAL, 0.6 + 0.4 * pulse);
    g.strokeEllipse(ax, ay + 2, 24 + pulse * 6, 30 + pulse * 4);
    for (const m of motes) {
      const s = (t * 1.2 + m.p) % 1;
      const mx = ax + Math.cos(m.a) * m.r;
      const my = ay + 16 - 34 * s;
      g.fillStyle(HEAL_DEEP, 1 - s * 0.5);
      g.fillCircle(mx, my, 3.5);
      g.fillStyle(HEAL, 1 - s * 0.5);
      g.fillCircle(mx, my, 2);
    }
    // And the Z's, rising up and to the side of the sprite's head.
    for (const z of zs) {
      const s = (t * 1.15 - z.delay + 1) % 1;
      if (s < 0.02) continue;
      drawBigZ(zg, ax + 8 + z.dx * s, ay - 12 - 26 * s, z.s, 1 - s * 0.55);
    }
  });

  // Wake up: the tint lifts, the sprite comes back up to where it started.
  await Promise.all([
    tweenPromise(scene, {
      targets: attackerSprite, y: ay,
      duration: Math.round(d * 0.14), ease: 'Sine.easeInOut',
    }),
    frames(scene, Math.round(d * 0.14), t => {
      g.clear();
      zg.clear();
      g.lineStyle(4, HEAL_DEEP, 1 - t);
      g.strokeEllipse(ax, ay + 2, 40 + t * 20, 46 + t * 18);
      g.lineStyle(2, HEAL, 1 - t);
      g.strokeEllipse(ax, ay + 2, 40 + t * 20, 46 + t * 18);
    }),
  ]);
  g.destroy();
  zg.destroy();
  attackerSprite.clearTint();
  attackerSprite.setPosition(ax, ay);
  attackerSprite.setAlpha(a0);
}

/**
 * ID 104 DOUBLE TEAM - one of you becomes several.
 *
 * MINIMIZE, its sibling, makes the attacker SMALLER in one place; DOUBLE TEAM
 * keeps it the same size and puts it in four places at once. `afterimage`
 * supplies the opening smear, but its ghosts trail the live sprite rather than
 * holding a position, so the fan itself is hand-rolled: four copies at
 * +-13 and +-26 px, alpha 0.6, shimmering, each one flashing a dark outline -
 * without which a pale copy on a #f8f8f8 sky is not on the screen at all.
 */
async function renderDoubleTeam(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  const { scene, attackerSprite } = ctx;
  const d = spec.duration; // 900 ms via OVERRIDE_DURATION
  const ax = attackerSprite.x;
  const ay = attackerSprite.y;
  const a0 = attackerSprite.alpha;

  soundSystem.blur();

  const smear = afterimage(scene, attackerSprite, TAN, 3, Math.round(d * 0.3));

  const OFFS = [-26, -13, 13, 26];
  const copies = OFFS.map(() => {
    const img = scene.add.image(ax, ay, attackerSprite.texture.key, attackerSprite.frame.name);
    img.setDepth(attackerSprite.depth - 1);
    img.setScrollFactor(0);
    img.setScale(attackerSprite.scaleX, attackerSprite.scaleY);
    img.setTint(TAN);
    img.setAlpha(0);
    return img;
  });
  const g = newG(scene, 869);
  const half = Math.round(16 * attackerSprite.scaleY);
  const wide = Math.round(13 * attackerSprite.scaleX);

  const drawCopies = (spread: number, t: number): void => {
    g.clear();
    copies.forEach((img, i) => {
      const x = ax + OFFS[i] * spread;
      img.setPosition(x, ay + Math.sin(t * Math.PI * 3 + i) * 2);
      img.setAlpha(0.6 * spread * (0.8 + 0.2 * Math.sin(t * Math.PI * 6 + i * 1.7)));
      // The outline flash. A TAN copy at alpha 0.6 on a #f8f8f8 sky is barely
      // a copy at all; the dark rectangle is what makes each one a body.
      // An ELLIPSE, not a rectangle: four upright rectangles in a row read as a
      // fence, while four ovals read as four bodies.
      g.lineStyle(3, NORMAL_DARK, (0.45 + 0.55 * Math.sin(t * Math.PI * 6 + i)) * spread);
      g.strokeEllipse(Math.round(x), ay, wide * 2, half * 2);
      g.lineStyle(2, TAN, 0.7 * spread);
      g.strokeEllipse(Math.round(x), ay, wide * 2 - 5, half * 2 - 5);
      // ...and a shadow pooled under each copy, which grounds the fan.
      g.fillStyle(NORMAL_DARK, 0.5 * spread);
      g.fillEllipse(Math.round(x), ay + half + 2, wide * 2 - 2, 7);
    });
    attackerSprite.setAlpha(a0 * (0.75 + 0.25 * Math.sin(t * Math.PI * 8)));
  };

  // Fan fast, HOLD long, snap back late: the hold is what makes the 75 %
  // frame a fan of four bodies rather than a sprite on its way home.
  await frames(scene, Math.round(d * 0.26), t => drawCopies(Math.min(1, t * 1.5), t));
  await smear;
  await frames(scene, Math.round(d * 0.52), t => drawCopies(1, 1 + t));
  await frames(scene, Math.round(d * 0.2), t => drawCopies(1 - t, 2 + t));

  copies.forEach(c => c.destroy());
  g.destroy();
  attackerSprite.setPosition(ax, ay);
  attackerSprite.setAlpha(a0);
}

/**
 * ID 107 MINIMIZE - the attacker gets small, in steps.
 *
 * The inverse of DOUBLE TEAM in every measurable way: one sprite, no copies,
 * and less of the screen covered at the end than at the start. Four discrete
 * shrink steps, each one squashing on the way down and letting off a puff at
 * the feet, then a pop back to full size - the brief's hard requirement, and
 * the runner re-reads the sprite's scale afterwards to check it.
 *
 * The sprite's origin is its centre, so a plain scale would leave it hovering;
 * `y` is corrected on every step to keep its feet on the same line.
 */
async function renderMinimize(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  const { scene, attackerSprite } = ctx;
  const d = spec.duration; // 900 ms via OVERRIDE_DURATION
  const ax = attackerSprite.x;
  const ay = attackerSprite.y;
  const sx0 = attackerSprite.scaleX;
  const sy0 = attackerSprite.scaleY;
  const a0 = attackerSprite.alpha;
  const footY = ay + 16 * sy0;

  soundSystem.shrink();

  const g = newG(scene, 866);
  const puffs: Array<{ x: number; y: number; r: number; born: number }> = [];
  let clock = 0;
  let press = 0;   // how far the compression marks have closed in, 0..1
  // Four chevrons pressing inward from OUTSIDE the sprite's own bbox. They are
  // the reason MINIMIZE is visible at all: the move's whole content is a
  // sprite getting smaller, which SUBTRACTS ink from the screen rather than
  // adding it. They also sit deliberately outside the +-20 px box the runner
  // measures for MINI-BAND, so the thing that proves MINIMIZE is small is not
  // the thing that makes it visible.
  const chevrons = (): void => {
    const k = 1 - press * 0.45;                  // 44 px out, closing to ~24
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + Math.PI / 4;
      const ux = Math.cos(a), uy = Math.sin(a);
      const px = -uy, py = ux;
      const cxp = ax + ux * 44 * k, cyp = ay + uy * 32 * k;
      const pts: Pt[] = [
        { x: cxp + px * 13 + ux * 8, y: cyp + py * 13 + uy * 7 },
        { x: cxp, y: cyp },
        { x: cxp - px * 13 + ux * 8, y: cyp - py * 13 + uy * 7 },
      ];
      strokePath(g, pts, 8, NORMAL_DARK, 0.9);
      strokePath(g, pts, 4, TAN, 1);
    }
  };
  const drawPuffs = (): void => {
    g.clear();
    for (const p of puffs) {
      const age = (clock - p.born) / 340;
      if (age < 0 || age > 1) continue;
      const r = p.r * (0.6 + age * 1.9);
      g.lineStyle(5, NORMAL_DARK, (1 - age) * 0.95);
      g.strokeEllipse(p.x, p.y - age * 5, r * 2.6, r * 1.5);
      g.lineStyle(3, TAN, (1 - age) * 0.95);
      g.strokeEllipse(p.x, p.y - age * 5, r * 2.6, r * 1.5);
    }
    chevrons();
  };

  const STEPS = [0.8, 0.65, 0.5, 0.4];
  // 0.13 rather than 0.15: four steps are eight sequential awaits, and every
  // await costs a frame of slack on top of its tween. At 0.15 the measured
  // wall clock ran past the runner's budget + 200 ms ceiling.
  const stepMs = Math.round(d * 0.13);
  let stepN = 0;
  for (const s of STEPS) {
    press = ++stepN / STEPS.length;
    const y = footY - 16 * sy0 * s;
    // Squash on the way down, then settle to the step's true scale.
    await tweenPromise(scene, {
      targets: attackerSprite,
      scaleX: sx0 * s * 1.2, scaleY: sy0 * s * 0.8, y: y + 2,
      duration: Math.round(stepMs * 0.4), ease: 'Quad.easeIn',
    });
    // Alternating sides, so the puffs spread along the ground instead of
    // stacking into one blob under the sprite.
    puffs.push({ x: ax + (stepN % 2 ? -11 : 11), y: footY - 2, r: 8 + 4 * (1 - s), born: clock });
    await Promise.all([
      tweenPromise(scene, {
        targets: attackerSprite,
        scaleX: sx0 * s, scaleY: sy0 * s, y,
        duration: Math.round(stepMs * 0.6), ease: 'Back.easeOut',
      }),
      frames(scene, Math.round(stepMs * 0.6), () => {
        clock += 16;
        drawPuffs();
      }),
    ]);
  }

  // A beat of being tiny, so the smallness is a state and not a transition.
  await frames(scene, Math.round(d * 0.1), () => { clock += 16; drawPuffs(); });

  // The pop back, with an overshoot so it lands rather than inflates.
  await Promise.all([
    tweenPromise(scene, {
      targets: attackerSprite,
      scaleX: sx0 * 1.14, scaleY: sy0 * 1.14, y: footY - 16 * sy0 * 1.14,
      duration: Math.round(d * 0.12), ease: 'Quad.easeOut',
    }),
    frames(scene, Math.round(d * 0.12), t => { clock += 16; press = 1 - t; drawPuffs(); }),
  ]);
  puffs.push({ x: ax, y: footY - 2, r: 15, born: clock });
  await Promise.all([
    tweenPromise(scene, {
      targets: attackerSprite,
      scaleX: sx0, scaleY: sy0, y: ay,
      duration: Math.round(d * 0.1), ease: 'Back.easeOut',
    }),
    frames(scene, Math.round(d * 0.1), t => { clock += 16; press = Math.max(0, 1 - t * 3); drawPuffs(); }),
  ]);

  g.destroy();
  attackerSprite.setScale(sx0, sy0);
  attackerSprite.setPosition(ax, ay);
  attackerSprite.setAlpha(a0);
}

/**
 * ID 113 LIGHT SCREEN - a pane of light, between you and the rest of the turn.
 *
 * REFLECT (115) and BARRIER (112) both still render the generic self-aura, a
 * ring and a sparkle; this is a piece of architecture. A dark-edged pale-yellow
 * rectangle rises in front of the attacker, a glint sweeps diagonally across
 * it, and - the part that matters - it HOLDS. A screen that flashes and goes
 * is a flash.
 */
async function renderLightScreen(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  const { scene, attackerSprite } = ctx;
  const d = spec.duration; // 900 ms via OVERRIDE_DURATION
  const ax = attackerSprite.x;
  const ay = attackerSprite.y;
  const a0 = attackerSprite.alpha;
  const dir = ctx.isPlayer ? 1 : -1;

  soundSystem.paneRise();

  // The pane stands just in front of the attacker, on the side it is facing.
  const cx = ax + dir * 10;
  const w = 40;
  const h = 50;
  const g = newG(scene, 880);

  const drawPane = (rise: number, glint: number, alpha: number): void => {
    g.clear();
    const top = ay - h / 2 + (1 - rise) * h;
    const vis = h * rise;
    if (vis < 2) return;
    g.fillStyle(PANE, PANE_ALPHA * alpha);
    g.fillRect(cx - w / 2, top, w, vis);
    g.lineStyle(3, EDGE, alpha);
    g.strokeRect(cx - w / 2, top, w, vis);
    // Two inner mullions: without them a flat rectangle reads as a colour
    // wash rather than as a pane of something.
    g.lineStyle(1, EDGE, 0.55 * alpha);
    g.beginPath();
    g.moveTo(cx - w / 2 + 13, top); g.lineTo(cx - w / 2 + 13, top + vis);
    g.moveTo(cx - w / 2 + 27, top); g.lineTo(cx - w / 2 + 27, top + vis);
    g.strokePath();
    if (glint >= 0) {
      // A diagonal bright band crossing the pane left to right.
      const gx = cx - w / 2 - 14 + glint * (w + 28);
      g.fillStyle(PANE_GLINT, 0.95 * alpha);
      g.fillPoints([
        { x: gx, y: top + vis }, { x: gx + 7, y: top + vis },
        { x: gx + 21, y: top }, { x: gx + 14, y: top },
      ], true);
      g.lineStyle(2, WHITE, 0.9 * alpha);
      g.beginPath();
      g.moveTo(gx + 3, top + vis); g.lineTo(gx + 17, top);
      g.strokePath();
      // Redraw the frame so the glint never spills past the pane's edge.
      g.lineStyle(3, EDGE, alpha);
      g.strokeRect(cx - w / 2, top, w, vis);
    }
  };

  await frames(scene, Math.round(d * 0.24), t => drawPane(t, -1, 1));
  await frames(scene, Math.round(d * 0.46), t => drawPane(1, t, 1));
  await frames(scene, Math.round(d * 0.3), t => drawPane(1, -1, 1 - t));

  g.destroy();
  attackerSprite.setPosition(ax, ay);
  attackerSprite.setAlpha(a0);
}

/** One sword, ~18 px, drawn pointing along `ang`: dark edge, steel blade,
 *  brown cross-guard, pommel dot. */
function drawSword(g: Phaser.GameObjects.Graphics, x: number, y: number, ang: number): void {
  const ux = Math.cos(ang), uy = Math.sin(ang);
  const px = -uy, py = ux;                     // perpendicular, for the guard
  const tip: Pt = { x: x + ux * 15, y: y + uy * 15 };
  const hilt: Pt = { x: x - ux * 6, y: y - uy * 6 };
  const guard: Pt = { x: x - ux * 3, y: y - uy * 3 };
  strokePath(g, [hilt, tip], 9, NORMAL_DARK, 1);
  strokePath(g, [hilt, tip], 5, STEEL, 1);
  strokePath(g, [
    { x: guard.x - px * 8, y: guard.y - py * 8 },
    { x: guard.x + px * 8, y: guard.y + py * 8 },
  ], 7, NORMAL_DARK, 1);
  strokePath(g, [
    { x: guard.x - px * 7, y: guard.y - py * 7 },
    { x: guard.x + px * 7, y: guard.y + py * 7 },
  ], 4, HILT, 1);
  g.fillStyle(NORMAL_DARK, 1);
  g.fillCircle(hilt.x, hilt.y, 4);
  g.fillStyle(HILT, 1);
  g.fillCircle(hilt.x, hilt.y, 2.5);
}

/**
 * ID 14 SWORDS DANCE - a stat boost that is actually a dance.
 *
 * GROWTH (74) is the generic self-aura and so is the stripped body of this
 * move: a ring and a sparkle. SWORDS DANCE is three swords on an elliptical
 * orbit that ACCELERATES - two and a half turns, each one faster than the last
 * - over a tan orbit trail, with the red aura pulsing in thin rings and the
 * attacker rocking with the beat. The aura stays thin on purpose: a solid red
 * wash would make a Normal move vote FIRE.
 *
 * `renderSpec` restores position, alpha, scale and tint but NOT rotation, so
 * the rock is undone here by hand (the same footnote as SING's).
 */
async function renderSwordsDance(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  const { scene, attackerSprite } = ctx;
  const d = spec.duration; // 950 ms via OVERRIDE_DURATION
  const ax = attackerSprite.x;
  const ay = attackerSprite.y;
  const a0 = attackerSprite.alpha;
  const rot0 = attackerSprite.rotation;

  soundSystem.bladeRing();

  const g = newG(scene, 869);
  const trail = newG(scene, 866);
  const RX = 32, RY = 18;

  const spin = Math.round(d * 0.82);
  const rock = tweenPromise(scene, {
    targets: attackerSprite, rotation: rot0 + 0.11,
    duration: Math.round(d * 0.12), yoyo: true, repeat: 2, ease: 'Sine.easeInOut',
  });
  await frames(scene, spin, t => {
    g.clear();
    trail.clear();
    // t + 1.6t^2: two and a half orbits, and visibly quicker at the end.
    const a = Math.PI * 2 * (t + 1.6 * t * t);
    // The orbit trail: tan, so the NORMAL vote has some mass behind it.
    trail.lineStyle(6, NORMAL_DARK, 0.55);
    trail.strokeEllipse(ax, ay, RX * 2, RY * 2);
    trail.lineStyle(3, TAN, 0.9);
    trail.strokeEllipse(ax, ay, RX * 2, RY * 2);
    // Three thin red aura rings, breathing with the beat. Thin on purpose: a
    // solid red wash would swing a Normal move's colour vote to FIRE.
    const pulse = 0.5 + 0.5 * Math.sin(t * Math.PI * 8);
    trail.lineStyle(3, AURA_RED, 0.5 + 0.5 * pulse);
    trail.strokeEllipse(ax, ay, RX * 2 + 14 + pulse * 10, RY * 2 + 16 + pulse * 8);
    trail.strokeEllipse(ax, ay, RX * 2 + 2 + pulse * 6, RY * 2 + 4 + pulse * 5);
    trail.strokeEllipse(ax, ay, RX + 6 + pulse * 4, RY + 10 + pulse * 3);
    for (let i = 0; i < 3; i++) {
      const th = a + (i * Math.PI * 2) / 3;
      drawSword(g, ax + Math.cos(th) * RX, ay + Math.sin(th) * RY, th + Math.PI / 2);
    }
  });
  await rock;

  // The swords fly outward and go.
  await frames(scene, Math.round(d * 0.18), t => {
    g.clear();
    trail.clear();
    const a = Math.PI * 2 * (1 + 1.6) + t * 1.2;
    trail.lineStyle(3, TAN, 0.85 * (1 - t));
    trail.strokeEllipse(ax, ay, RX * 2 + t * 24, RY * 2 + t * 20);
    trail.lineStyle(2, AURA_RED, 1 - t);
    trail.strokeEllipse(ax, ay, RX * 2 + 14 + t * 30, RY * 2 + 16 + t * 26);
    for (let i = 0; i < 3; i++) {
      const th = a + (i * Math.PI * 2) / 3;
      const r = 1 + t * 0.9;
      drawSword(g, ax + Math.cos(th) * RX * r, ay + Math.sin(th) * RY * r, th + Math.PI / 2);
    }
  });

  g.destroy();
  trail.destroy();
  attackerSprite.setRotation(rot0);
  attackerSprite.setPosition(ax, ay);
  attackerSprite.setAlpha(a0);
}

/**
 * ID 150 SPLASH - three hops, and absolutely nothing happens.
 *
 * The shortest override in the game except QUICK ATTACK's, and the only one
 * whose entire content is the joke: the attacker hops, squashes on landing,
 * kicks up a few droplets, and that is the move. No aura, no target, no flash.
 * The droplets are water blue on a Normal-typed move - the batch's fourth
 * declared off-type palette (EXPECTED_TYPE 150) - because SPLASH is Gen 1's
 * MAGIKARP joke and khaki droplets would just be dust.
 */
async function renderSplash(spec: AnimationSpec, ctx: AnimationContext): Promise<void> {
  const { scene, attackerSprite } = ctx;
  const d = spec.duration; // 600 ms via OVERRIDE_DURATION - deliberately short
  const ax = attackerSprite.x;
  const ay = attackerSprite.y;
  const sx0 = attackerSprite.scaleX;
  const sy0 = attackerSprite.scaleY;
  const a0 = attackerSprite.alpha;

  // Two layers: the droplets fly over the sprite, the ground rings stay UNDER
  // it (depth 4, below the sprite's 5) so the hop is never hidden behind its
  // own splash.
  const g = newG(scene, 866);
  const ground = newG(scene, 4);
  const drops: Array<{ x: number; y: number; vx: number; vy: number; born: number; r: number }> = [];
  const landings: number[] = [];
  const LIFE = 340;
  let clock = 0;
  const draw = (): void => {
    g.clear();
    for (const p of drops) {
      const age = (clock - p.born) / LIFE;
      if (age < 0 || age > 1) continue;
      const x = p.x + p.vx * age * 48;
      const y = p.y + p.vy * age * 42 + age * age * 44;
      g.fillStyle(DROP_EDGE, 1 - age * 0.4);
      g.fillCircle(x, y, p.r + 2);
      g.fillStyle(DROP, 1 - age * 0.4);
      g.fillCircle(x, y, p.r);
      g.fillStyle(DROP_PALE, 1 - age * 0.4);
      g.fillCircle(x - p.r * 0.3, y - p.r * 0.3, p.r * 0.45);
    }
    // The crown left on the ground by the most recent landing.
    // The crown each landing throws up and the ripple rolling out behind it.
    // Both landings that are still young get drawn, so the middle of the move
    // is two sets of rings and not one - 600 ms is not long enough to let the
    // screen go empty between hops.
    ground.clear();
    for (const born of landings) {
      const age = (clock - born) / LIFE;
      if (age < 0 || age > 1) continue;
      for (const [w0, h0, dw, dh, th] of [
        [30, 10, 34, 12, 7], [14, 5, 54, 20, 5], [46, 16, 30, 10, 5],
      ] as const) {
        ground.lineStyle(th, DROP_EDGE, (1 - age) * 0.85);
        ground.strokeEllipse(ax, ay + 15 * sy0, w0 + age * dw, h0 + age * dh);
        ground.lineStyle(Math.max(2, th - 3), DROP, (1 - age) * 0.95);
        ground.strokeEllipse(ax, ay + 15 * sy0, w0 + age * dw, h0 + age * dh);
      }
    }
  };
  const land = (): void => {
    landings.push(clock);
    for (let i = 0; i < 16; i++) {
      const a = -Math.PI + (i / 15) * Math.PI;
      drops.push({
        x: ax + Math.cos(a) * 10, y: ay + 14 * sy0,
        vx: Math.cos(a) * 1.25, vy: Math.sin(a) * 0.9 - 0.75,
        born: clock, r: 3.6 + Math.random() * 2.4,
      });
    }
  };

  const hop = Math.round(d * 0.29);
  for (let i = 0; i < 3; i++) {
    soundSystem.plop();
    await Promise.all([
      tweenPromise(scene, {
        targets: attackerSprite, y: ay - 11,
        duration: Math.round(hop * 0.5), ease: 'Quad.easeOut',
      }),
      frames(scene, Math.round(hop * 0.5), () => { clock += 16; draw(); }),
    ]);
    await Promise.all([
      tweenPromise(scene, {
        targets: attackerSprite, y: ay,
        duration: Math.round(hop * 0.34), ease: 'Quad.easeIn',
      }),
      frames(scene, Math.round(hop * 0.34), () => { clock += 16; draw(); }),
    ]);
    land();
    // The squash: it lands with weight, which is the only weight in the move.
    await Promise.all([
      tweenPromise(scene, {
        targets: attackerSprite,
        scaleX: sx0 * 1.2, scaleY: sy0 * 0.8, y: ay + 3,
        duration: Math.round(hop * 0.08), yoyo: true, ease: 'Quad.easeOut',
      }),
      frames(scene, Math.round(hop * 0.16), () => { clock += 16; draw(); }),
    ]);
  }
  await frames(scene, Math.round(d * 0.12), () => { clock += 16; draw(); });

  g.destroy();
  ground.destroy();
  attackerSprite.setScale(sx0, sy0);
  attackerSprite.setPosition(ax, ay);
  attackerSprite.setAlpha(a0);
}

registerSpecOverride('transform', renderTransform);
registerSpecOverride('substitute', renderSubstitute);
registerSpecOverride('rest', renderRest);
registerSpecOverride('doubleTeam', renderDoubleTeam);
registerSpecOverride('minimize', renderMinimize);
registerSpecOverride('lightScreen', renderLightScreen);
registerSpecOverride('swordsDance', renderSwordsDance);
registerSpecOverride('splash', renderSplash);
