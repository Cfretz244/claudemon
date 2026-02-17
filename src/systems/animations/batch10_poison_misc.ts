import { registerAnimation, spriteFlash, particles, projectile, beam, sparkle, lunge, delay } from '../MoveAnimations';

const POISON = 0xAA5599;
const DARK = 0x554466;

// ID 40: POISON STING
registerAnimation(40, async (ctx) => {
  await projectile(ctx.scene, ctx.attackerSprite, ctx.defenderSprite, POISON, 3, 300);
  await particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, POISON, 6, 15, 200);
});

// ID 51: ACID
registerAnimation(51, async (ctx) => {
  await projectile(ctx.scene, ctx.attackerSprite, ctx.defenderSprite, POISON, 5, 250);
  await particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, POISON, 10, 20, 250);
});

// ID 124: SLUDGE
registerAnimation(124, async (ctx) => {
  await projectile(ctx.scene, ctx.attackerSprite, ctx.defenderSprite, DARK, 6, 250);
  await particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, POISON, 14, 25, 300);
});

// ID 123: SMOG
registerAnimation(123, async (ctx) => {
  await particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, DARK, 18, 30, 400);
});

// ID 92: TOXIC
registerAnimation(92, async (ctx) => {
  await projectile(ctx.scene, ctx.attackerSprite, ctx.defenderSprite, POISON, 4, 250);
  await Promise.all([
    particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, POISON, 10, 20, 300),
    spriteFlash(ctx.defenderSprite, ctx.scene, POISON, 3),
  ]);
});

// ID 77: POISON POWDER
registerAnimation(77, async (ctx) => {
  await sparkle(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, POISON, 10, 400);
});

// ID 139: POISON GAS
registerAnimation(139, async (ctx) => {
  await particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, POISON, 15, 25, 400);
});

// ID 151: ACID ARMOR
registerAnimation(151, async (ctx) => {
  await Promise.all([
    sparkle(ctx.scene, ctx.attackerSprite.x, ctx.attackerSprite.y, POISON, 8, 300),
    spriteFlash(ctx.attackerSprite, ctx.scene, POISON, 2),
  ]);
});

// ID 122: LICK
registerAnimation(122, async (ctx) => {
  await lunge(ctx.scene, ctx.attackerSprite, ctx.defenderSprite.x, ctx.defenderSprite.y, 200);
  await spriteFlash(ctx.defenderSprite, ctx.scene, 0xFF66AA, 2);
});

// ID 44: BITE
registerAnimation(44, async (ctx) => {
  await lunge(ctx.scene, ctx.attackerSprite, ctx.defenderSprite.x, ctx.defenderSprite.y, 180);
  await particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, 0xFFFFFF, 6, 15, 200);
});

// ID 81: STRING SHOT
registerAnimation(81, async (ctx) => {
  await beam(ctx.scene, ctx.attackerSprite, ctx.defenderSprite, 0xFFFFCC, 2, 300);
  await spriteFlash(ctx.defenderSprite, ctx.scene, 0xFFFFCC, 2);
});

// ID 35: WRAP
registerAnimation(35, async (ctx) => {
  await lunge(ctx.scene, ctx.attackerSprite, ctx.defenderSprite.x, ctx.defenderSprite.y, 200);
  await Promise.all([
    spriteFlash(ctx.defenderSprite, ctx.scene, POISON, 3),
    particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, POISON, 8, 15, 300),
  ]);
});

// ID 20: BIND
registerAnimation(20, async (ctx) => {
  await lunge(ctx.scene, ctx.attackerSprite, ctx.defenderSprite.x, ctx.defenderSprite.y, 200);
  await spriteFlash(ctx.defenderSprite, ctx.scene, 0xDDAA44, 3);
});

// ID 132: CONSTRICT
registerAnimation(132, async (ctx) => {
  await lunge(ctx.scene, ctx.attackerSprite, ctx.defenderSprite.x, ctx.defenderSprite.y, 200);
  await spriteFlash(ctx.defenderSprite, ctx.scene, 0xDDAA44, 2);
});
