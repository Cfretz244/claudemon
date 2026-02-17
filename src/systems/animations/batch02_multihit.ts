import { registerAnimation, lunge, spriteFlash, screenShake, particles, projectile, delay, tweenPromise } from '../MoveAnimations';

// ID 3: DOUBLE SLAP
registerAnimation(3, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await lunge(scene, attackerSprite, defenderSprite.x, defenderSprite.y, 120);
  await spriteFlash(defenderSprite, scene, 0xFFFFFF, 1);
  await delay(scene, 50);
  await lunge(scene, attackerSprite, defenderSprite.x, defenderSprite.y, 120);
  await spriteFlash(defenderSprite, scene, 0xFFFFFF, 1);
});

// ID 4: COMET PUNCH
registerAnimation(4, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await lunge(scene, attackerSprite, defenderSprite.x, defenderSprite.y, 100);
  await particles(scene, defenderSprite.x, defenderSprite.y, 0xFFFF44, 6, 12, 200);
  await delay(scene, 50);
  await lunge(scene, attackerSprite, defenderSprite.x, defenderSprite.y, 100);
  await particles(scene, defenderSprite.x, defenderSprite.y, 0xFFFF44, 6, 12, 200);
});

// ID 31: FURY ATTACK
registerAnimation(31, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  for (let i = 0; i < 3; i++) {
    await lunge(scene, attackerSprite, defenderSprite.x, defenderSprite.y, 80);
    await spriteFlash(defenderSprite, scene, 0xFFFFFF, 1);
    if (i < 2) await delay(scene, 30);
  }
});

// ID 42: PIN MISSILE
registerAnimation(42, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  for (let i = 0; i < 3; i++) {
    projectile(scene, attackerSprite, defenderSprite, 0xAABB22, 3, 300);
    await delay(scene, 100);
  }
  await spriteFlash(defenderSprite, scene, 0xAABB22, 2);
});

// ID 41: TWINEEDLE
registerAnimation(41, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await projectile(scene, attackerSprite, defenderSprite, 0xAABB22, 4, 350);
  await delay(scene, 80);
  await projectile(scene, attackerSprite, defenderSprite, 0xAABB22, 4, 350);
  await spriteFlash(defenderSprite, scene, 0xAABB22, 2);
});

// ID 24: DOUBLE KICK
registerAnimation(24, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await lunge(scene, attackerSprite, defenderSprite.x, defenderSprite.y, 100);
  await particles(scene, defenderSprite.x, defenderSprite.y, 0xBB5544, 5, 10, 200);
  await delay(scene, 50);
  await lunge(scene, attackerSprite, defenderSprite.x, defenderSprite.y, 100);
  await particles(scene, defenderSprite.x, defenderSprite.y, 0xBB5544, 5, 10, 200);
});

// ID 140: BARRAGE
registerAnimation(140, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  for (let i = 0; i < 3; i++) {
    projectile(scene, attackerSprite, defenderSprite, 0xFFFFFF, 4, 320);
    await delay(scene, 90);
  }
  await spriteFlash(defenderSprite, scene, 0xFFFFFF, 2);
});

// ID 154: FURY SWIPES
registerAnimation(154, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  for (let i = 0; i < 3; i++) {
    await lunge(scene, attackerSprite, defenderSprite.x, defenderSprite.y, 70);
    await particles(scene, defenderSprite.x, defenderSprite.y, 0xFFFFFF, 4, 8, 150);
    if (i < 2) await delay(scene, 30);
  }
});

// ID 131: SPIKE CANNON
registerAnimation(131, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  for (let i = 0; i < 3; i++) {
    projectile(scene, attackerSprite, defenderSprite, 0xFFFFFF, 3, 400);
    await delay(scene, 70);
  }
  await spriteFlash(defenderSprite, scene, 0xFFFFFF, 2);
});

// ID 155: BONEMERANG
registerAnimation(155, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await projectile(scene, attackerSprite, defenderSprite, 0xFFFFFF, 5, 300);
  await spriteFlash(defenderSprite, scene, 0xFFFFFF, 1);
  await projectile(scene, defenderSprite, attackerSprite, 0xFFFFFF, 5, 300);
});

// ID 125: BONE CLUB
registerAnimation(125, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await lunge(scene, attackerSprite, defenderSprite.x, defenderSprite.y, 150);
  await Promise.all([
    particles(scene, defenderSprite.x, defenderSprite.y, 0xDDBB55, 8, 12, 250),
    spriteFlash(defenderSprite, scene, 0xFFFFFF, 2),
  ]);
});

// ID 121: EGG BOMB
registerAnimation(121, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await projectile(scene, attackerSprite, defenderSprite, 0xFFFFFF, 6, 250);
  await Promise.all([
    screenShake(scene, 3, 150),
    particles(scene, defenderSprite.x, defenderSprite.y, 0xFFFF88, 12, 20, 300),
    spriteFlash(defenderSprite, scene, 0xFFFFFF, 2),
  ]);
});

// ID 130: SKULL BASH
registerAnimation(130, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await screenShake(scene, 4, 200);
  await lunge(scene, attackerSprite, defenderSprite.x, defenderSprite.y, 180);
  await spriteFlash(defenderSprite, scene, 0xFFFFFF, 3);
});
