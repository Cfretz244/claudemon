import { registerAnimation, screenFlash, spriteFlash, particles, sparkle, delay, tweenPromise } from '../MoveAnimations';

const FIGHTING = 0xBB5544;
const PSYCHIC = 0xFF5599;

// ID 14: SWORDS DANCE
registerAnimation(14, async (ctx) => {
  const { scene, attackerSprite } = ctx;
  await Promise.all([
    sparkle(scene, attackerSprite.x, attackerSprite.y, 0xFFFFFF, 8, 400),
    spriteFlash(attackerSprite, scene, FIGHTING, 3),
  ]);
});

// ID 97: AGILITY
registerAnimation(97, async (ctx) => {
  const { scene, attackerSprite } = ctx;
  const origAlpha = attackerSprite.alpha;
  await tweenPromise(scene, { targets: attackerSprite, alpha: 0.3, duration: 80 });
  await tweenPromise(scene, { targets: attackerSprite, alpha: origAlpha, duration: 80 });
  await tweenPromise(scene, { targets: attackerSprite, alpha: 0.3, duration: 80 });
  await tweenPromise(scene, { targets: attackerSprite, alpha: origAlpha, duration: 80 });
  await sparkle(scene, attackerSprite.x, attackerSprite.y, 0xFFFFFF, 6, 200);
});

// ID 96: MEDITATE
registerAnimation(96, async (ctx) => {
  await sparkle(ctx.scene, ctx.attackerSprite.x, ctx.attackerSprite.y, PSYCHIC, 6, 400);
});

// ID 106: HARDEN
registerAnimation(106, async (ctx) => {
  await spriteFlash(ctx.attackerSprite, ctx.scene, 0xCCCCCC, 3);
});

// ID 110: WITHDRAW
registerAnimation(110, async (ctx) => {
  await spriteFlash(ctx.attackerSprite, ctx.scene, 0x66CCFF, 2);
  await sparkle(ctx.scene, ctx.attackerSprite.x, ctx.attackerSprite.y, 0x66CCFF, 5, 250);
});

// ID 111: DEFENSE CURL
registerAnimation(111, async (ctx) => {
  await spriteFlash(ctx.attackerSprite, ctx.scene, 0xCCCCCC, 2);
  await sparkle(ctx.scene, ctx.attackerSprite.x, ctx.attackerSprite.y, 0xFFFFFF, 4, 250);
});

// ID 112: BARRIER
registerAnimation(112, async (ctx) => {
  const { scene, attackerSprite } = ctx;
  const x = attackerSprite.x - 12;
  const y = attackerSprite.y;
  const wall = scene.add.rectangle(x, y, 4, 24, 0x66CCFF).setDepth(800).setScrollFactor(0).setAlpha(0);
  await tweenPromise(scene, { targets: wall, alpha: 0.8, duration: 150 });
  await tweenPromise(scene, { targets: wall, alpha: 0, duration: 250 });
  wall.destroy();
});

// ID 133: AMNESIA
registerAnimation(133, async (ctx) => {
  await sparkle(ctx.scene, ctx.attackerSprite.x, ctx.attackerSprite.y, PSYCHIC, 8, 400);
});

// ID 159: SHARPEN
registerAnimation(159, async (ctx) => {
  await spriteFlash(ctx.attackerSprite, ctx.scene, 0xFFFFFF, 3);
});

// ID 107: MINIMIZE
registerAnimation(107, async (ctx) => {
  const { scene, attackerSprite } = ctx;
  const origScaleX = attackerSprite.scaleX;
  const origScaleY = attackerSprite.scaleY;
  await tweenPromise(scene, {
    targets: attackerSprite,
    scaleX: origScaleX * 0.5,
    scaleY: origScaleY * 0.5,
    duration: 200,
  });
  await tweenPromise(scene, {
    targets: attackerSprite,
    scaleX: origScaleX,
    scaleY: origScaleY,
    duration: 200,
  });
});

// ID 116: FOCUS ENERGY
registerAnimation(116, async (ctx) => {
  await Promise.all([
    spriteFlash(ctx.attackerSprite, ctx.scene, FIGHTING, 3),
    sparkle(ctx.scene, ctx.attackerSprite.x, ctx.attackerSprite.y, 0xFFFFFF, 6, 300),
  ]);
});

// ID 113: LIGHT SCREEN
registerAnimation(113, async (ctx) => {
  const { scene, attackerSprite } = ctx;
  await screenFlash(scene, 0xFFFF88, 200);
  await sparkle(scene, attackerSprite.x, attackerSprite.y, 0xFFFF88, 6, 250);
});

// ID 115: REFLECT
registerAnimation(115, async (ctx) => {
  const { scene, attackerSprite } = ctx;
  await screenFlash(scene, 0xFFFFFF, 150);
  await sparkle(scene, attackerSprite.x, attackerSprite.y, 0xFFFFFF, 6, 250);
});

// ID 105: RECOVER
registerAnimation(105, async (ctx) => {
  await sparkle(ctx.scene, ctx.attackerSprite.x, ctx.attackerSprite.y, 0xFFFFAA, 10, 400);
});

// ID 135: SOFTBOILED
registerAnimation(135, async (ctx) => {
  await sparkle(ctx.scene, ctx.attackerSprite.x, ctx.attackerSprite.y, 0xFFCCCC, 8, 350);
});

// ID 156: REST
registerAnimation(156, async (ctx) => {
  await sparkle(ctx.scene, ctx.attackerSprite.x, ctx.attackerSprite.y, 0x6688FF, 6, 400);
});

// ID 54: MIST
registerAnimation(54, async (ctx) => {
  await particles(ctx.scene, ctx.attackerSprite.x, ctx.attackerSprite.y, 0xCCDDFF, 15, 30, 400);
});

// ID 114: HAZE
registerAnimation(114, async (ctx) => {
  await particles(ctx.scene, 80, 72, 0x8899AA, 20, 60, 400);
});

// ID 160: CONVERSION
registerAnimation(160, async (ctx) => {
  await spriteFlash(ctx.attackerSprite, ctx.scene, 0xFFFFFF, 4);
});

// ID 164: SUBSTITUTE
registerAnimation(164, async (ctx) => {
  const { scene, attackerSprite } = ctx;
  await spriteFlash(attackerSprite, scene, 0xFFFFFF, 2);
  await sparkle(scene, attackerSprite.x, attackerSprite.y, 0xFFFFFF, 8, 300);
});

// ID 104: DOUBLE TEAM
registerAnimation(104, async (ctx) => {
  const { scene, attackerSprite } = ctx;
  const origAlpha = attackerSprite.alpha;
  for (let i = 0; i < 3; i++) {
    await tweenPromise(scene, { targets: attackerSprite, alpha: 0.2, duration: 60 });
    await tweenPromise(scene, { targets: attackerSprite, alpha: origAlpha, duration: 60 });
  }
});

// ID 117: BIDE
registerAnimation(117, async (ctx) => {
  await spriteFlash(ctx.attackerSprite, ctx.scene, 0xFFFFFF, 3);
});

// ID 99: RAGE
registerAnimation(99, async (ctx) => {
  await Promise.all([
    spriteFlash(ctx.attackerSprite, ctx.scene, FIGHTING, 3),
    particles(ctx.scene, ctx.attackerSprite.x, ctx.attackerSprite.y, FIGHTING, 8, 15, 300),
  ]);
});

// ID 150: SPLASH
registerAnimation(150, async (ctx) => {
  const { scene, attackerSprite } = ctx;
  const origY = attackerSprite.y;
  await tweenPromise(scene, { targets: attackerSprite, y: origY - 10, duration: 150, ease: 'Bounce' });
  await tweenPromise(scene, { targets: attackerSprite, y: origY, duration: 150, ease: 'Bounce' });
});
