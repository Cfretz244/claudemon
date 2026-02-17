import { registerAnimation, screenFlash, spriteFlash, screenShake, particles, lightning, lunge, delay } from '../MoveAnimations';

const YELLOW = 0xFFCC00;

// ID 9: THUNDER PUNCH
registerAnimation(9, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await lunge(scene, attackerSprite, defenderSprite.x, defenderSprite.y, 200);
  await Promise.all([
    particles(scene, defenderSprite.x, defenderSprite.y, YELLOW, 8, 15, 300),
    lightning(scene, defenderSprite.x, defenderSprite.y - 20, defenderSprite.x, defenderSprite.y + 10, YELLOW, 200),
    spriteFlash(defenderSprite, scene, YELLOW, 2),
  ]);
});

// ID 85: THUNDERBOLT
registerAnimation(85, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await Promise.all([
    lightning(scene, attackerSprite.x, attackerSprite.y, defenderSprite.x, defenderSprite.y - 10, YELLOW, 250),
    delay(scene, 100).then(() =>
      lightning(scene, attackerSprite.x, attackerSprite.y, defenderSprite.x, defenderSprite.y + 10, YELLOW, 250),
    ),
  ]);
  await Promise.all([
    particles(scene, defenderSprite.x, defenderSprite.y, YELLOW, 12, 20, 300),
    screenFlash(scene, YELLOW, 100),
    spriteFlash(defenderSprite, scene, YELLOW, 3),
  ]);
});

// ID 86: THUNDER WAVE
registerAnimation(86, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await lightning(scene, attackerSprite.x, attackerSprite.y, defenderSprite.x, defenderSprite.y, YELLOW, 400);
  await Promise.all([
    spriteFlash(defenderSprite, scene, YELLOW, 2),
    particles(scene, defenderSprite.x, defenderSprite.y, YELLOW, 6, 12, 200),
  ]);
});

// ID 87: THUNDER
registerAnimation(87, async (ctx) => {
  const { scene, defenderSprite } = ctx;
  await screenFlash(scene, YELLOW, 150);
  await Promise.all([
    lightning(scene, defenderSprite.x - 10, 0, defenderSprite.x - 10, defenderSprite.y, YELLOW, 300),
    delay(scene, 80).then(() =>
      lightning(scene, defenderSprite.x, 0, defenderSprite.x, defenderSprite.y, YELLOW, 300),
    ),
    delay(scene, 160).then(() =>
      lightning(scene, defenderSprite.x + 10, 0, defenderSprite.x + 10, defenderSprite.y, YELLOW, 300),
    ),
    delay(scene, 100).then(() => screenShake(scene, 4, 300)),
  ]);
  await Promise.all([
    particles(scene, defenderSprite.x, defenderSprite.y, YELLOW, 16, 25, 400),
    spriteFlash(defenderSprite, scene, YELLOW, 4),
  ]);
});
