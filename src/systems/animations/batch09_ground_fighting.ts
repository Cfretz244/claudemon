import { registerAnimation, screenFlash, spriteFlash, screenShake, particles, projectile, lunge, delay, tweenPromise } from '../MoveAnimations';

const BROWN = 0xDDBB55;
const ROCK = 0xBBAA66;
const FIGHTING = 0xBB5544;

// ID 89: EARTHQUAKE
registerAnimation(89, async (ctx) => {
  await Promise.all([
    screenShake(ctx.scene, 8, 300),
    particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y + 20, BROWN, 20, 40, 300),
    delay(ctx.scene, 100).then(() => screenFlash(ctx.scene, BROWN, 200)),
  ]);
});

// ID 90: FISSURE
registerAnimation(90, async (ctx) => {
  await Promise.all([
    screenShake(ctx.scene, 12, 400),
    screenFlash(ctx.scene, BROWN, 300),
  ]);
});

// ID 88: ROCK THROW
registerAnimation(88, async (ctx) => {
  await projectile(ctx.scene, ctx.attackerSprite, ctx.defenderSprite, ROCK, 6, 250);
  await particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, BROWN, 8, 20, 200);
});

// ID 157: ROCK SLIDE
registerAnimation(157, async (ctx) => {
  const x = ctx.defenderSprite.x;
  const y = ctx.defenderSprite.y;
  const scene = ctx.scene;

  await Promise.all([
    (async () => {
      const rock1 = scene.add.rectangle(x - 10, y - 40, 6, 6, ROCK).setDepth(800).setScrollFactor(0);
      await tweenPromise(scene, { targets: rock1, y, duration: 250, ease: 'Cubic.easeIn' });
      rock1.destroy();
    })(),
    delay(scene, 80).then(async () => {
      const rock2 = scene.add.rectangle(x + 5, y - 45, 6, 6, ROCK).setDepth(800).setScrollFactor(0);
      await tweenPromise(scene, { targets: rock2, y, duration: 250, ease: 'Cubic.easeIn' });
      rock2.destroy();
    }),
    delay(scene, 160).then(async () => {
      const rock3 = scene.add.rectangle(x + 10, y - 50, 6, 6, ROCK).setDepth(800).setScrollFactor(0);
      await tweenPromise(scene, { targets: rock3, y, duration: 250, ease: 'Cubic.easeIn' });
      rock3.destroy();
    }),
    delay(scene, 100).then(() => screenShake(scene, 5, 250)),
  ]);
});

// ID 91: DIG
registerAnimation(91, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  const origY = attackerSprite.y;
  await tweenPromise(scene, { targets: attackerSprite, alpha: 0, duration: 150 });
  await delay(scene, 100);
  attackerSprite.alpha = 1;
  await Promise.all([
    lunge(scene, attackerSprite, defenderSprite.x, defenderSprite.y, 200),
    screenShake(scene, 6, 200),
  ]);
});

// ID 28: SAND ATTACK
registerAnimation(28, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  const midX = (attackerSprite.x + defenderSprite.x) / 2;
  const midY = (attackerSprite.y + defenderSprite.y) / 2;
  await particles(scene, midX, midY, BROWN, 12, 30, 250);
});

// ID 12: GUILLOTINE
registerAnimation(12, async (ctx) => {
  await lunge(ctx.scene, ctx.attackerSprite, ctx.defenderSprite.x, ctx.defenderSprite.y, 200);
  await Promise.all([
    screenFlash(ctx.scene, 0xFFFFFF, 150),
    screenShake(ctx.scene, 8, 200),
  ]);
});

// ID 23: STOMP
registerAnimation(23, async (ctx) => {
  await lunge(ctx.scene, ctx.attackerSprite, ctx.defenderSprite.x, ctx.defenderSprite.y, 200);
  await screenShake(ctx.scene, 5, 200);
});

// ID 70: STRENGTH
registerAnimation(70, async (ctx) => {
  await lunge(ctx.scene, ctx.attackerSprite, ctx.defenderSprite.x, ctx.defenderSprite.y, 250);
  await Promise.all([
    screenShake(ctx.scene, 6, 200),
    particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, 0xFFFFFF, 10, 25, 200),
  ]);
});

// ID 69: SEISMIC TOSS
registerAnimation(69, async (ctx) => {
  await lunge(ctx.scene, ctx.attackerSprite, ctx.defenderSprite.x, ctx.defenderSprite.y, 200);
  await Promise.all([
    screenShake(ctx.scene, 7, 250),
    spriteFlash(ctx.defenderSprite, ctx.scene, 0xFFFFFF, 3),
  ]);
});

// ID 66: SUBMISSION
registerAnimation(66, async (ctx) => {
  await lunge(ctx.scene, ctx.attackerSprite, ctx.defenderSprite.x, ctx.defenderSprite.y, 200);
  await Promise.all([
    spriteFlash(ctx.attackerSprite, ctx.scene, FIGHTING, 2),
    spriteFlash(ctx.defenderSprite, ctx.scene, 0xFFFFFF, 3),
  ]);
});

// ID 67: LOW KICK
registerAnimation(67, async (ctx) => {
  await lunge(ctx.scene, ctx.attackerSprite, ctx.defenderSprite.x, ctx.defenderSprite.y, 180);
  await particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y + 10, BROWN, 8, 20, 200);
});

// ID 26: JUMP KICK
registerAnimation(26, async (ctx) => {
  await lunge(ctx.scene, ctx.attackerSprite, ctx.defenderSprite.x, ctx.defenderSprite.y, 200);
  await particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, FIGHTING, 10, 25, 200);
});

// ID 136: HIGH JUMP KICK
registerAnimation(136, async (ctx) => {
  await lunge(ctx.scene, ctx.attackerSprite, ctx.defenderSprite.x, ctx.defenderSprite.y, 220);
  await Promise.all([
    screenShake(ctx.scene, 7, 250),
    particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, FIGHTING, 15, 30, 250),
  ]);
});

// ID 27: ROLLING KICK
registerAnimation(27, async (ctx) => {
  await lunge(ctx.scene, ctx.attackerSprite, ctx.defenderSprite.x, ctx.defenderSprite.y, 250);
  await particles(ctx.scene, ctx.defenderSprite.x, ctx.defenderSprite.y, BROWN, 10, 25, 200);
});
