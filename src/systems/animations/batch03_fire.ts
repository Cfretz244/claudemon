import { registerAnimation, screenFlash, spriteFlash, screenShake, particles, projectile, beam, lunge, delay, tweenPromise } from '../MoveAnimations';

const FIRE = 0xFF4422;
const ORANGE = 0xFF8800;

// ID 52: EMBER
registerAnimation(52, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await projectile(scene, attackerSprite, defenderSprite, FIRE, 4, 300);
  await Promise.all([
    particles(scene, defenderSprite.x, defenderSprite.y, ORANGE, 8, 16, 300),
    spriteFlash(defenderSprite, scene, FIRE, 2),
  ]);
});

// ID 53: FLAMETHROWER
registerAnimation(53, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await Promise.all([
    beam(scene, attackerSprite, defenderSprite, ORANGE, 6, 400),
    particles(scene, (attackerSprite.x + defenderSprite.x) / 2, (attackerSprite.y + defenderSprite.y) / 2, FIRE, 12, 20, 400),
  ]);
  await spriteFlash(defenderSprite, scene, FIRE, 3);
});

// ID 126: FIRE BLAST
registerAnimation(126, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await projectile(scene, attackerSprite, defenderSprite, FIRE, 10, 250);
  await Promise.all([
    screenFlash(scene, ORANGE, 200),
    screenShake(scene, 4, 300),
    particles(scene, defenderSprite.x, defenderSprite.y, FIRE, 20, 32, 400),
    particles(scene, defenderSprite.x, defenderSprite.y, ORANGE, 16, 24, 350),
    spriteFlash(defenderSprite, scene, FIRE, 4),
  ]);
});

// ID 83: FIRE SPIN
registerAnimation(83, async (ctx) => {
  const { scene, defenderSprite } = ctx;
  const count = 6;
  const radius = 20;
  const rects: Phaser.GameObjects.Rectangle[] = [];

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const x = defenderSprite.x + Math.cos(angle) * radius;
    const y = defenderSprite.y + Math.sin(angle) * radius;
    const rect = scene.add.rectangle(x, y, 3, 3, i % 2 === 0 ? FIRE : ORANGE);
    rect.setDepth(900);
    rect.setScrollFactor(0);
    rects.push(rect);
  }

  const duration = 500;
  await Promise.all([
    ...rects.map((rect, i) => {
      const startAngle = (i / count) * Math.PI * 2;
      return tweenPromise(scene, {
        targets: rect,
        duration,
        onUpdate: (tween: Phaser.Tweens.Tween) => {
          const progress = tween.progress;
          const currentAngle = startAngle + progress * Math.PI * 4;
          rect.x = defenderSprite.x + Math.cos(currentAngle) * radius;
          rect.y = defenderSprite.y + Math.sin(currentAngle) * radius;
        },
        onComplete: () => rect.destroy(),
      });
    }),
    spriteFlash(defenderSprite, scene, FIRE, 3),
  ]);
});

// ID 7: FIRE PUNCH
registerAnimation(7, async (ctx) => {
  const { scene, attackerSprite, defenderSprite } = ctx;
  await lunge(scene, attackerSprite, defenderSprite.x, defenderSprite.y, 200);
  await Promise.all([
    particles(scene, defenderSprite.x, defenderSprite.y, FIRE, 10, 16, 250),
    particles(scene, defenderSprite.x, defenderSprite.y, ORANGE, 8, 12, 250),
    spriteFlash(defenderSprite, scene, FIRE, 3),
  ]);
});
