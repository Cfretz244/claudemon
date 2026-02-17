import { registerAnimation, screenFlash, spriteFlash, screenShake, particles, projectile, beam, lunge, delay, tweenPromise } from '../MoveAnimations';

const WATER = 0x3399FF;
const LIGHT_BLUE = 0x66BBFF;

// ID 55: WATER GUN
registerAnimation(55, async (ctx) => {
  await projectile(ctx.scene, ctx.attackerSprite, ctx.defenderSprite, WATER, 3, 300);
  await particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, LIGHT_BLUE, 8, 20, 200);
});

// ID 56: HYDRO PUMP
registerAnimation(56, async (ctx) => {
  await Promise.all([
    beam(ctx.scene, ctx.attackerSprite, ctx.defenderSprite, WATER, 6, 300),
    screenShake(ctx.scene, 3, 300),
  ]);
  await particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, LIGHT_BLUE, 20, 30, 250);
});

// ID 57: SURF
registerAnimation(57, async (ctx) => {
  await screenFlash(ctx.scene, WATER, 150);
  await Promise.all([
    particles(ctx.scene, 80, 72, LIGHT_BLUE, 30, 80, 300),
    spriteFlash(ctx.defenderSprite, ctx.scene, WATER, 3),
  ]);
});

// ID 61: BUBBLE BEAM
registerAnimation(61, async (ctx) => {
  for (let i = 0; i < 4; i++) {
    projectile(ctx.scene, ctx.attackerSprite, ctx.defenderSprite, LIGHT_BLUE, 2, 200);
    await delay(ctx.scene, 50);
  }
  await delay(ctx.scene, 150);
});

// ID 145: BUBBLE
registerAnimation(145, async (ctx) => {
  for (let i = 0; i < 3; i++) {
    projectile(ctx.scene, ctx.attackerSprite, ctx.defenderSprite, LIGHT_BLUE, 2, 250);
    await delay(ctx.scene, 80);
  }
  await delay(ctx.scene, 170);
});

// ID 127: WATERFALL
registerAnimation(127, async (ctx) => {
  await Promise.all([
    beam(ctx.scene, ctx.attackerSprite, ctx.defenderSprite, WATER, 5, 300),
    screenShake(ctx.scene, 2, 300),
  ]);
  await particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, LIGHT_BLUE, 15, 25, 200);
});

// ID 128: CLAMP
registerAnimation(128, async (ctx) => {
  await lunge(ctx.scene, ctx.attackerSprite, ctx.defenderSprite.x, ctx.defenderSprite.y, 200);
  await spriteFlash(ctx.defenderSprite, ctx.scene, WATER, 2);
});

// ID 152: CRABHAMMER
registerAnimation(152, async (ctx) => {
  await lunge(ctx.scene, ctx.attackerSprite, ctx.defenderSprite.x, ctx.defenderSprite.y, 200);
  await Promise.all([
    screenShake(ctx.scene, 3, 200),
    particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, WATER, 12, 25, 200),
  ]);
});
