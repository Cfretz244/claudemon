import { registerAnimation, lunge, spriteFlash, screenShake, particles, delay, tweenPromise } from '../MoveAnimations';

// ID 1: POUND - quick lunge + small impact
registerAnimation(1, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await lunge(scene, attackerSprite, defenderSprite.x, defenderSprite.y, 150);
  await particles(scene, defenderSprite.x, defenderSprite.y, 0xFFFFFF, 3, 8, 200);
});

// ID 2: KARATE CHOP - lunge + white flash on defender
registerAnimation(2, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await lunge(scene, attackerSprite, defenderSprite.x, defenderSprite.y, 180);
  await spriteFlash(defenderSprite, scene, 0xFFFFFF, 3);
});

// ID 5: MEGA PUNCH - lunge + screen shake + particles
registerAnimation(5, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await lunge(scene, attackerSprite, defenderSprite.x, defenderSprite.y, 200);
  await Promise.all([
    screenShake(scene, 3, 150),
    particles(scene, defenderSprite.x, defenderSprite.y, 0xFFFFFF, 8, 12, 300),
  ]);
});

// ID 10: SCRATCH - lunge + white scratch particles
registerAnimation(10, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await lunge(scene, attackerSprite, defenderSprite.x, defenderSprite.y, 160);
  await Promise.all([
    spriteFlash(defenderSprite, scene, 0xFFFFFF, 2),
    particles(scene, defenderSprite.x, defenderSprite.y, 0xFFFFFF, 5, 10, 200),
  ]);
});

// ID 15: CUT - fast lunge + white slash
registerAnimation(15, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await lunge(scene, attackerSprite, defenderSprite.x, defenderSprite.y, 140);
  await spriteFlash(defenderSprite, scene, 0xFFFFFF, 3);
});

// ID 21: SLAM - lunge + screen shake
registerAnimation(21, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await lunge(scene, attackerSprite, defenderSprite.x, defenderSprite.y, 200);
  await Promise.all([
    screenShake(scene, 4, 180),
    particles(scene, defenderSprite.x, defenderSprite.y, 0xFFFFFF, 6, 10, 250),
  ]);
});

// ID 25: MEGA KICK - big lunge + screen shake + particles
registerAnimation(25, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await lunge(scene, attackerSprite, defenderSprite.x, defenderSprite.y, 220);
  await Promise.all([
    screenShake(scene, 5, 200),
    spriteFlash(defenderSprite, scene, 0xFFFFFF, 3),
    particles(scene, defenderSprite.x, defenderSprite.y, 0xFFFFFF, 10, 14, 350),
  ]);
});

// ID 29: HEADBUTT - lunge + defender flash
registerAnimation(29, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await lunge(scene, attackerSprite, defenderSprite.x, defenderSprite.y, 170);
  await Promise.all([
    spriteFlash(defenderSprite, scene, 0xFFFFFF, 3),
    screenShake(scene, 2, 120),
  ]);
});

// ID 30: HORN ATTACK - lunge + white flash
registerAnimation(30, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await lunge(scene, attackerSprite, defenderSprite.x, defenderSprite.y, 180);
  await spriteFlash(defenderSprite, scene, 0xFFFFFF, 3);
});

// ID 33: TACKLE - simple lunge
registerAnimation(33, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await lunge(scene, attackerSprite, defenderSprite.x, defenderSprite.y, 160);
  await spriteFlash(defenderSprite, scene, 0xFFFFFF, 2);
});

// ID 34: BODY SLAM - big lunge + screen shake + defender flash
registerAnimation(34, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await lunge(scene, attackerSprite, defenderSprite.x, defenderSprite.y, 210);
  await Promise.all([
    screenShake(scene, 4, 180),
    spriteFlash(defenderSprite, scene, 0xFFFFFF, 4),
    particles(scene, defenderSprite.x, defenderSprite.y, 0xFFFFFF, 8, 12, 300),
  ]);
});

// ID 163: SLASH - fast lunge + white particle slash
registerAnimation(163, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await lunge(scene, attackerSprite, defenderSprite.x, defenderSprite.y, 150);
  await Promise.all([
    spriteFlash(defenderSprite, scene, 0xFFFFFF, 3),
    particles(scene, defenderSprite.x, defenderSprite.y, 0xFFFFFF, 7, 11, 260),
  ]);
});

// ID 165: STRUGGLE - weak lunge + attacker flash (recoil feel)
registerAnimation(165, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await lunge(scene, attackerSprite, defenderSprite.x, defenderSprite.y, 180);
  await spriteFlash(defenderSprite, scene, 0xFFFFFF, 2);
  await delay(scene, 100);
  await spriteFlash(attackerSprite, scene, 0xFF4444, 2);
});
