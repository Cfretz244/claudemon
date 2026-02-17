import { registerAnimation, screenFlash, spriteFlash, particles, sparkle, delay } from '../MoveAnimations';

const STATUS_YELLOW = 0xFFCC00;
const STATUS_RED = 0xFF4444;

// ID 45: GROWL
registerAnimation(45, async (ctx) => {
  await particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, STATUS_RED, 8, 15, 300);
});

// ID 43: LEER
registerAnimation(43, async (ctx) => {
  await spriteFlash(ctx.defenderSprite, ctx.scene, STATUS_RED, 3);
});

// ID 39: TAIL WHIP
registerAnimation(39, async (ctx) => {
  await particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, 0xDDBB55, 8, 15, 300);
});

// ID 103: SCREECH
registerAnimation(103, async (ctx) => {
  await Promise.all([
    spriteFlash(ctx.defenderSprite, ctx.scene, STATUS_YELLOW, 3),
    particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, STATUS_YELLOW, 10, 20, 300),
  ]);
});

// ID 46: ROAR
registerAnimation(46, async (ctx) => {
  await Promise.all([
    particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, 0xDDBB55, 12, 25, 300),
    spriteFlash(ctx.defenderSprite, ctx.scene, 0xFFFFFF, 2),
  ]);
});

// ID 47: SING
registerAnimation(47, async (ctx) => {
  await sparkle(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, 0x88BBFF, 8, 400);
});

// ID 48: DISABLE
registerAnimation(48, async (ctx) => {
  await spriteFlash(ctx.defenderSprite, ctx.scene, 0x6666BB, 3);
});

// ID 50: SUPERSONIC
registerAnimation(50, async (ctx) => {
  await Promise.all([
    particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, STATUS_YELLOW, 10, 20, 300),
    sparkle(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, STATUS_YELLOW, 5, 300),
  ]);
});

// ID 108: SMOKESCREEN
registerAnimation(108, async (ctx) => {
  await particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, 0x555555, 20, 30, 400);
});

// ID 109: CONFUSE RAY
registerAnimation(109, async (ctx) => {
  await sparkle(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, 0xFF5599, 8, 400);
});

// ID 137: GLARE
registerAnimation(137, async (ctx) => {
  await Promise.all([
    spriteFlash(ctx.defenderSprite, ctx.scene, STATUS_YELLOW, 3),
    screenFlash(ctx.scene, STATUS_YELLOW, 150),
  ]);
});

// ID 142: LOVELY KISS
registerAnimation(142, async (ctx) => {
  await sparkle(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, 0xFF88AA, 8, 350);
});

// ID 78: STUN SPORE
registerAnimation(78, async (ctx) => {
  await sparkle(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, STATUS_YELLOW, 10, 400);
});

// ID 79: SLEEP POWDER
registerAnimation(79, async (ctx) => {
  await sparkle(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, 0x44BB44, 10, 400);
});

// ID 147: SPORE
registerAnimation(147, async (ctx) => {
  await sparkle(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, 0x88BB44, 12, 400);
});

// ID 148: FLASH
registerAnimation(148, async (ctx) => {
  await screenFlash(ctx.scene, 0xFFFFFF, 300);
});
