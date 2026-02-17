import { registerAnimation, screenFlash, spriteFlash, screenShake, particles, beam, sparkle, projectile, lunge, lightning, delay, tweenPromise } from '../MoveAnimations';

const FLYING = 0x8899FF;
const NORMAL = 0xA8A878;
const DRAGON = 0x7766EE;
const GHOST = 0x6666BB;

// ID 16: GUST
registerAnimation(16, async (ctx) => {
  await particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, FLYING, 12, 25, 300);
});

// ID 17: WING ATTACK
registerAnimation(17, async (ctx) => {
  await lunge(ctx.scene, ctx.attackerSprite, ctx.defenderSprite.x, ctx.defenderSprite.y, 200);
  await particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, FLYING, 8, 20, 200);
});

// ID 19: FLY
registerAnimation(19, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  const origY = attackerSprite.y;
  await tweenPromise(scene, { targets: attackerSprite, alpha: 0, duration: 150 });
  await delay(scene, 150);
  attackerSprite.alpha = 1;
  await Promise.all([
    lunge(scene, attackerSprite, defenderSprite.x, defenderSprite.y, 200),
    screenShake(scene, 5, 200),
  ]);
});

// ID 18: WHIRLWIND
registerAnimation(18, async (ctx) => {
  await particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, FLYING, 16, 35, 400);
});

// ID 64: PECK
registerAnimation(64, async (ctx) => {
  await lunge(ctx.scene, ctx.attackerSprite, ctx.defenderSprite.x, ctx.defenderSprite.y, 180);
});

// ID 65: DRILL PECK
registerAnimation(65, async (ctx) => {
  await lunge(ctx.scene, ctx.attackerSprite, ctx.defenderSprite.x, ctx.defenderSprite.y, 200);
  await particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, FLYING, 10, 20, 200);
});

// ID 98: QUICK ATTACK
registerAnimation(98, async (ctx) => {
  await lunge(ctx.scene, ctx.attackerSprite, ctx.defenderSprite.x, ctx.defenderSprite.y, 120);
  await particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, 0xFFFFFF, 6, 15, 150);
});

// ID 129: SWIFT
registerAnimation(129, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  for (let i = 0; i < 3; i++) {
    projectile(scene, attackerSprite, defenderSprite, 0xFFCC00, 3, 350);
    await delay(scene, 60);
  }
  await delay(scene, 200);
  await sparkle(scene, defenderSprite.x, defenderSprite.y, 0xFFCC00, 6, 200);
});

// ID 13: RAZOR WIND
registerAnimation(13, async (ctx) => {
  await particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, 0xFFFFFF, 15, 30, 350);
  await screenShake(ctx.scene, 4, 200);
});

// ID 143: SKY ATTACK
registerAnimation(143, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await screenFlash(scene, 0xFFFFFF, 100);
  await lunge(scene, attackerSprite, defenderSprite.x, defenderSprite.y, 200);
  await Promise.all([
    screenShake(scene, 7, 250),
    particles(scene, defenderSprite.x, defenderSprite.y, FLYING, 15, 30, 300),
  ]);
});

// ID 63: HYPER BEAM
registerAnimation(63, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await screenFlash(scene, 0xFFFFFF, 100);
  await beam(scene, attackerSprite, defenderSprite, 0xFF8800, 8, 400);
  await Promise.all([
    screenShake(scene, 8, 300),
    particles(scene, defenderSprite.x, defenderSprite.y, 0xFF8800, 20, 35, 400),
  ]);
});

// ID 6: PAY DAY
registerAnimation(6, async (ctx) => {
  await projectile(ctx.scene, ctx.attackerSprite, ctx.defenderSprite, 0xFFCC00, 4, 250);
  await sparkle(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, 0xFFCC00, 6, 200);
});

// ID 161: TRI ATTACK
registerAnimation(161, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await Promise.all([
    beam(scene, attackerSprite, defenderSprite, 0xFF4422, 3, 300),
    delay(scene, 50).then(() => beam(scene, attackerSprite, defenderSprite, 0x66CCFF, 3, 300)),
    delay(scene, 100).then(() => beam(scene, attackerSprite, defenderSprite, 0xFFCC00, 3, 300)),
  ]);
  await particles(scene, defenderSprite.x, defenderSprite.y, 0xFFFFFF, 12, 20, 250);
});

// ID 36: TAKE DOWN
registerAnimation(36, async (ctx) => {
  await lunge(ctx.scene, ctx.attackerSprite, ctx.defenderSprite.x, ctx.defenderSprite.y, 200);
  await Promise.all([
    screenShake(ctx.scene, 5, 200),
    spriteFlash(ctx.defenderSprite, ctx.scene, 0xFFFFFF, 2),
  ]);
});

// ID 38: DOUBLE-EDGE
registerAnimation(38, async (ctx) => {
  await lunge(ctx.scene, ctx.attackerSprite, ctx.defenderSprite.x, ctx.defenderSprite.y, 180);
  await Promise.all([
    screenShake(ctx.scene, 7, 250),
    particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, 0xFFFFFF, 12, 25, 250),
    spriteFlash(ctx.attackerSprite, ctx.scene, 0xFFFFFF, 2),
  ]);
});

// ID 37: THRASH
registerAnimation(37, async (ctx) => {
  for (let i = 0; i < 2; i++) {
    await lunge(ctx.scene, ctx.attackerSprite, ctx.defenderSprite.x, ctx.defenderSprite.y, 180);
    await delay(ctx.scene, 50);
  }
  await particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, NORMAL, 10, 20, 200);
});

// ID 11: VICE GRIP
registerAnimation(11, async (ctx) => {
  await lunge(ctx.scene, ctx.attackerSprite, ctx.defenderSprite.x, ctx.defenderSprite.y, 200);
  await spriteFlash(ctx.defenderSprite, ctx.scene, 0xFFFFFF, 2);
});

// ID 158: HYPER FANG
registerAnimation(158, async (ctx) => {
  await lunge(ctx.scene, ctx.attackerSprite, ctx.defenderSprite.x, ctx.defenderSprite.y, 180);
  await Promise.all([
    particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, 0xFFFFFF, 8, 20, 200),
    spriteFlash(ctx.defenderSprite, ctx.scene, 0xFFFFFF, 2),
  ]);
});

// ID 49: SONIC BOOM
registerAnimation(49, async (ctx) => {
  await projectile(ctx.scene, ctx.attackerSprite, ctx.defenderSprite, NORMAL, 5, 300);
  await screenShake(ctx.scene, 3, 150);
});

// ID 82: DRAGON RAGE
registerAnimation(82, async (ctx) => {
  await beam(ctx.scene, ctx.attackerSprite, ctx.defenderSprite, DRAGON, 5, 300);
  await particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, DRAGON, 12, 25, 250);
});

// ID 101: NIGHT SHADE
registerAnimation(101, async (ctx) => {
  await Promise.all([
    beam(ctx.scene, ctx.attackerSprite, ctx.defenderSprite, GHOST, 4, 300),
    spriteFlash(ctx.defenderSprite, ctx.scene, GHOST, 3),
  ]);
});

// ID 120: SELF-DESTRUCT
registerAnimation(120, async (ctx) => {
  await screenFlash(ctx.scene, 0xFFFFFF, 200);
  await Promise.all([
    screenShake(ctx.scene, 10, 400),
    particles(ctx.scene, ctx.attackerSprite.x, ctx.attackerSprite.y, 0xFF4400, 20, 40, 400),
    particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, 0xFF4400, 15, 30, 400),
  ]);
});

// ID 153: EXPLOSION
registerAnimation(153, async (ctx) => {
  await screenFlash(ctx.scene, 0xFFFFFF, 300);
  await Promise.all([
    screenShake(ctx.scene, 14, 500),
    particles(ctx.scene, ctx.attackerSprite.x, ctx.attackerSprite.y, 0xFF4400, 25, 50, 500),
    particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, 0xFF4400, 25, 50, 500),
    particles(ctx.scene, 80, 72, 0xFFCC00, 20, 60, 500),
  ]);
});

// ID 68: COUNTER
registerAnimation(68, async (ctx) => {
  await lunge(ctx.scene, ctx.attackerSprite, ctx.defenderSprite.x, ctx.defenderSprite.y, 180);
  await Promise.all([
    screenShake(ctx.scene, 5, 200),
    spriteFlash(ctx.defenderSprite, ctx.scene, 0xBB5544, 2),
  ]);
});

// ID 162: SUPER FANG
registerAnimation(162, async (ctx) => {
  await lunge(ctx.scene, ctx.attackerSprite, ctx.defenderSprite.x, ctx.defenderSprite.y, 180);
  await particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, 0xFFFFFF, 8, 20, 200);
});

// ID 118: METRONOME
registerAnimation(118, async (ctx) => {
  await sparkle(ctx.scene, ctx.attackerSprite.x, ctx.attackerSprite.y, 0xFFFFFF, 10, 400);
});

// ID 119: MIRROR MOVE
registerAnimation(119, async (ctx) => {
  await sparkle(ctx.scene, ctx.attackerSprite.x, ctx.attackerSprite.y, FLYING, 8, 350);
});

// ID 144: TRANSFORM
registerAnimation(144, async (ctx) => {
  const { scene, attackerSprite } = ctx;
  await tweenPromise(scene, { targets: attackerSprite, alpha: 0.2, duration: 150 });
  await delay(scene, 100);
  await tweenPromise(scene, { targets: attackerSprite, alpha: 1, duration: 150 });
  await sparkle(scene, attackerSprite.x, attackerSprite.y, 0xFF5599, 6, 250);
});

// ID 102: MIMIC
registerAnimation(102, async (ctx) => {
  await sparkle(ctx.scene, ctx.attackerSprite.x, ctx.attackerSprite.y, 0xFFFFFF, 6, 300);
});

// ID 146: DIZZY PUNCH
registerAnimation(146, async (ctx) => {
  await lunge(ctx.scene, ctx.attackerSprite, ctx.defenderSprite.x, ctx.defenderSprite.y, 200);
  await sparkle(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y - 10, 0xFFCC00, 5, 250);
});
