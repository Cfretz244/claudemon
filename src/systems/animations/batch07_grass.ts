import { registerAnimation, screenFlash, spriteFlash, particles, beam, sparkle, projectile, lunge, delay } from '../MoveAnimations';

// ID 22: VINE WHIP
registerAnimation(22, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await beam(scene, attackerSprite, defenderSprite, 0x44BB44, 3, 250);
  await particles(scene, defenderSprite.x, defenderSprite.y, 0x44BB44, 8, 20, 200);
});

// ID 75: RAZOR LEAF
registerAnimation(75, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  for (let i = 0; i < 3; i++) {
    projectile(scene, attackerSprite, defenderSprite, 0x228822, 4, 300);
    await delay(scene, 50);
  }
  await delay(scene, 150);
});

// ID 76: SOLAR BEAM
registerAnimation(76, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await Promise.all([
    beam(scene, attackerSprite, defenderSprite, 0x88FF44, 8, 400),
    screenFlash(scene, 0x88FF44, 400),
    particles(scene, defenderSprite.x, defenderSprite.y, 0x88FF44, 15, 30, 400),
  ]);
});

// ID 71: ABSORB
registerAnimation(71, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await projectile(scene, defenderSprite, attackerSprite, 0x44BB44, 3, 300);
  await particles(scene, attackerSprite.x, attackerSprite.y, 0x44BB44, 6, 15, 200);
});

// ID 72: MEGA DRAIN
registerAnimation(72, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await beam(scene, defenderSprite, attackerSprite, 0x44BB44, 4, 300);
  await sparkle(scene, attackerSprite.x, attackerSprite.y, 0x44BB44, 8, 250);
});

// ID 73: LEECH SEED
registerAnimation(73, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await projectile(scene, attackerSprite, defenderSprite, 0x228822, 3, 250);
  await sparkle(scene, defenderSprite.x, defenderSprite.y, 0x44BB44, 6, 200);
});

// ID 141: LEECH LIFE
registerAnimation(141, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await lunge(scene, attackerSprite, defenderSprite.x, defenderSprite.y, 200);
  await projectile(scene, defenderSprite, attackerSprite, 0x44BB44, 3, 250);
  await particles(scene, attackerSprite.x, attackerSprite.y, 0x44BB44, 6, 15, 200);
});

// ID 80: PETAL DANCE
registerAnimation(80, async (ctx) => {
  const { scene, defenderSprite } = ctx;
  await Promise.all([
    particles(scene, defenderSprite.x - 15, defenderSprite.y, 0xFF88AA, 6, 25, 350),
    particles(scene, defenderSprite.x + 15, defenderSprite.y, 0xFF88AA, 6, 25, 350),
    particles(scene, defenderSprite.x, defenderSprite.y - 15, 0xFF88AA, 6, 25, 350),
  ]);
});

// ID 74: GROWTH
registerAnimation(74, async (ctx) => {
  const { scene, attackerSprite } = ctx;
  await sparkle(scene, attackerSprite.x, attackerSprite.y, 0x44BB44, 10, 300);
});
