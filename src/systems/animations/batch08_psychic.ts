import { registerAnimation, screenFlash, spriteFlash, screenShake, particles, beam, sparkle, delay } from '../MoveAnimations';

// ID 93: CONFUSION
registerAnimation(93, async (ctx) => {
  const { scene, defenderSprite } = ctx;
  await Promise.all([
    particles(scene, defenderSprite.x, defenderSprite.y, 0xAA55FF, 12, 20, 300),
    spriteFlash(defenderSprite, scene, 0xAA55FF, 2),
  ]);
});

// ID 94: PSYCHIC
registerAnimation(94, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await screenFlash(scene, 0xFF5599, 100);
  await Promise.all([
    beam(scene, attackerSprite, defenderSprite, 0xFF5599, 4, 250),
    (async () => {
      await delay(scene, 100);
      await screenShake(scene, 3, 200);
    })(),
  ]);
  await particles(scene, defenderSprite.x, defenderSprite.y, 0xFF5599, 15, 25, 200);
});

// ID 60: PSYBEAM
registerAnimation(60, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await Promise.all([
    beam(scene, attackerSprite, defenderSprite, 0xFF55FF, 3, 300),
    sparkle(scene, defenderSprite.x, defenderSprite.y, 0xFF55FF, 8, 300),
  ]);
});

// ID 149: PSYWAVE
registerAnimation(149, async (ctx) => {
  const { scene, defenderSprite } = ctx;
  for (let i = 0; i < 3; i++) {
    await particles(scene, defenderSprite.x - 30 + i * 15, defenderSprite.y, 0xAA55FF, 5, 15, 100);
    await delay(scene, 50);
  }
});

// ID 95: HYPNOSIS
registerAnimation(95, async (ctx) => {
  await sparkle(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, 0xAA55FF, 6, 400);
});

// ID 138: DREAM EATER
registerAnimation(138, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await particles(scene, defenderSprite.x, defenderSprite.y, 0x6644AA, 10, 15, 200);
  await delay(scene, 100);
  await particles(scene, attackerSprite.x, attackerSprite.y, 0x6644AA, 8, 12, 200);
});

// ID 134: KINESIS
registerAnimation(134, async (ctx) => {
  await sparkle(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, 0xFFCC00, 5, 250);
});

// ID 100: TELEPORT
registerAnimation(100, async (ctx) => {
  const { scene, attackerSprite } = ctx;
  await Promise.all([
    spriteFlash(attackerSprite, scene, 0xFF5599, 3),
    sparkle(scene, attackerSprite.x, attackerSprite.y, 0xFF5599, 8, 300),
  ]);
});
