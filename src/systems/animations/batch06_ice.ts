import { registerAnimation, screenFlash, spriteFlash, screenShake, particles, beam, sparkle, lunge, delay } from '../MoveAnimations';

// ID 8: ICE PUNCH
registerAnimation(8, async (ctx) => {
  await lunge(ctx.scene, ctx.attackerSprite, ctx.defenderSprite.x, ctx.defenderSprite.y, 200);
  await Promise.all([
    particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, 0x66CCFF, 12, 20, 250),
    spriteFlash(ctx.defenderSprite, ctx.scene, 0x66CCFF, 2),
  ]);
});

// ID 58: ICE BEAM
registerAnimation(58, async (ctx) => {
  await Promise.all([
    beam(ctx.scene, ctx.attackerSprite, ctx.defenderSprite, 0x66CCFF, 4, 300),
    (async () => {
      await delay(ctx.scene, 100);
      await Promise.all([
        sparkle(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, 0xFFFFFF, 8, 200),
        spriteFlash(ctx.defenderSprite, ctx.scene, 0x66CCFF, 2),
      ]);
    })(),
  ]);
});

// ID 59: BLIZZARD
registerAnimation(59, async (ctx) => {
  await screenFlash(ctx.scene, 0xFFFFFF, 150);
  await Promise.all([
    particles(ctx.scene, 80, 72, 0x66CCFF, 30, 80, 400),
    particles(ctx.scene, 40, 50, 0xFFFFFF, 20, 60, 400),
    particles(ctx.scene, 120, 90, 0x66CCFF, 20, 60, 400),
    screenShake(ctx.scene, 2, 300),
    (async () => {
      await delay(ctx.scene, 200);
      await spriteFlash(ctx.defenderSprite, ctx.scene, 0x66CCFF, 3);
    })(),
  ]);
});

// ID 62: AURORA BEAM
registerAnimation(62, async (ctx) => {
  await Promise.all([
    beam(ctx.scene, ctx.attackerSprite, ctx.defenderSprite, 0xFF99CC, 3, 300),
    (async () => {
      await delay(ctx.scene, 100);
      await sparkle(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, 0xFFFFFF, 10, 200);
    })(),
  ]);
});
