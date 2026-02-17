import Phaser from 'phaser';
import { PokemonType, MoveCategory, PHYSICAL_TYPES } from '../types/pokemon.types';
import { MOVES_DATA } from '../data/moves';

// === Types ===

export interface AnimationContext {
  scene: Phaser.Scene;
  attackerSprite: Phaser.GameObjects.Sprite;
  defenderSprite: Phaser.GameObjects.Sprite;
  isPlayer: boolean; // true = player attacking (bottom-left → top-right)
}

export type MoveAnimationFn = (ctx: AnimationContext) => Promise<void>;

// === Registry ===

const MOVE_ANIMATIONS: Record<number, MoveAnimationFn> = {};

export function registerAnimation(moveId: number, fn: MoveAnimationFn): void {
  MOVE_ANIMATIONS[moveId] = fn;
}

// === Type Color Map ===

export const TYPE_COLORS: Record<string, number> = {
  [PokemonType.NORMAL]: 0xA8A878,
  [PokemonType.FIRE]: 0xFF4422,
  [PokemonType.WATER]: 0x3399FF,
  [PokemonType.ELECTRIC]: 0xFFCC00,
  [PokemonType.GRASS]: 0x44BB44,
  [PokemonType.ICE]: 0x66CCFF,
  [PokemonType.FIGHTING]: 0xBB5544,
  [PokemonType.POISON]: 0xAA5599,
  [PokemonType.GROUND]: 0xDDBB55,
  [PokemonType.FLYING]: 0x8899FF,
  [PokemonType.PSYCHIC]: 0xFF5599,
  [PokemonType.BUG]: 0xAABB22,
  [PokemonType.ROCK]: 0xBBAA66,
  [PokemonType.GHOST]: 0x6666BB,
  [PokemonType.DRAGON]: 0x7766EE,
};

// === Helper Utilities ===

export function delay(scene: Phaser.Scene, ms: number): Promise<void> {
  return new Promise(resolve => {
    scene.time.delayedCall(ms, resolve);
  });
}

export function tweenPromise(scene: Phaser.Scene, config: Phaser.Types.Tweens.TweenBuilderConfig): Promise<void> {
  return new Promise(resolve => {
    scene.tweens.add({
      ...config,
      onComplete: () => resolve(),
    });
  });
}

export function screenFlash(scene: Phaser.Scene, color: number, duration: number): Promise<void> {
  const overlay = scene.add.graphics();
  overlay.setDepth(900);
  overlay.setScrollFactor(0);
  overlay.fillStyle(color, 0.6);
  overlay.fillRect(0, 0, 160, 144);
  overlay.setAlpha(1);

  return tweenPromise(scene, {
    targets: overlay,
    alpha: 0,
    duration,
    onComplete: () => { overlay.destroy(); },
  }).then(() => { overlay.destroy(); });
}

export function screenShake(scene: Phaser.Scene, intensity: number, duration: number): Promise<void> {
  scene.cameras.main.shake(duration, intensity / 160);
  return delay(scene, duration);
}

export function spriteFlash(sprite: Phaser.GameObjects.Sprite, scene: Phaser.Scene, color: number, count: number): Promise<void> {
  return new Promise(resolve => {
    let flashes = 0;
    const doFlash = () => {
      sprite.setTint(color);
      scene.time.delayedCall(60, () => {
        sprite.clearTint();
        flashes++;
        if (flashes < count) {
          scene.time.delayedCall(60, doFlash);
        } else {
          resolve();
        }
      });
    };
    doFlash();
  });
}

export function projectile(
  scene: Phaser.Scene,
  fromSprite: Phaser.GameObjects.Sprite,
  toSprite: Phaser.GameObjects.Sprite,
  color: number,
  size: number,
  speed: number,
): Promise<void> {
  const g = scene.add.graphics();
  g.setDepth(800);
  g.setScrollFactor(0);
  g.fillStyle(color, 1);
  g.fillCircle(0, 0, size);
  g.setPosition(fromSprite.x, fromSprite.y);

  const dist = Phaser.Math.Distance.Between(fromSprite.x, fromSprite.y, toSprite.x, toSprite.y);
  const duration = (dist / speed) * 1000;

  return tweenPromise(scene, {
    targets: g,
    x: toSprite.x,
    y: toSprite.y,
    duration,
  }).then(() => { g.destroy(); });
}

export function lunge(
  scene: Phaser.Scene,
  sprite: Phaser.GameObjects.Sprite,
  targetX: number,
  targetY: number,
  duration: number,
): Promise<void> {
  const origX = sprite.x;
  const origY = sprite.y;
  const midX = origX + (targetX - origX) * 0.4;
  const midY = origY + (targetY - origY) * 0.4;

  return tweenPromise(scene, {
    targets: sprite,
    x: midX,
    y: midY,
    duration: duration / 2,
    ease: 'Power2',
  }).then(() =>
    tweenPromise(scene, {
      targets: sprite,
      x: origX,
      y: origY,
      duration: duration / 2,
      ease: 'Power2',
    })
  );
}

export function beam(
  scene: Phaser.Scene,
  fromSprite: Phaser.GameObjects.Sprite,
  toSprite: Phaser.GameObjects.Sprite,
  color: number,
  width: number,
  duration: number,
): Promise<void> {
  const g = scene.add.graphics();
  g.setDepth(800);
  g.setScrollFactor(0);
  g.lineStyle(width, color, 1);
  g.beginPath();
  g.moveTo(fromSprite.x, fromSprite.y);
  g.lineTo(toSprite.x, toSprite.y);
  g.strokePath();
  g.setAlpha(1);

  return tweenPromise(scene, {
    targets: g,
    alpha: 0,
    duration,
  }).then(() => { g.destroy(); });
}

export function particles(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: number,
  count: number,
  spread: number,
  duration: number,
): Promise<void> {
  const graphics: Phaser.GameObjects.Graphics[] = [];
  for (let i = 0; i < count; i++) {
    const g = scene.add.graphics();
    g.setDepth(800);
    g.setScrollFactor(0);
    g.fillStyle(color, 1);
    const s = 1 + Math.random() * 2;
    g.fillRect(-s / 2, -s / 2, s, s);
    g.setPosition(x, y);
    graphics.push(g);
  }

  const promises = graphics.map(g => {
    const tx = x + (Math.random() - 0.5) * spread * 2;
    const ty = y + (Math.random() - 0.5) * spread * 2;
    return tweenPromise(scene, {
      targets: g,
      x: tx,
      y: ty,
      alpha: 0,
      duration: duration + Math.random() * 100,
    }).then(() => { g.destroy(); });
  });

  return Promise.all(promises).then(() => {});
}

export function sparkle(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: number,
  count: number,
  duration: number,
): Promise<void> {
  const graphics: Phaser.GameObjects.Graphics[] = [];
  for (let i = 0; i < count; i++) {
    const g = scene.add.graphics();
    g.setDepth(800);
    g.setScrollFactor(0);
    const sx = x + (Math.random() - 0.5) * 20;
    const sy = y + (Math.random() - 0.5) * 20;
    g.setPosition(sx, sy);
    // Draw a small star/cross
    g.lineStyle(1, color, 1);
    g.beginPath();
    g.moveTo(-2, 0); g.lineTo(2, 0);
    g.moveTo(0, -2); g.lineTo(0, 2);
    g.strokePath();
    g.setAlpha(0);
    graphics.push(g);
  }

  const promises = graphics.map((g, i) =>
    delay(scene, i * (duration / count / 2)).then(() =>
      tweenPromise(scene, {
        targets: g,
        alpha: 1,
        duration: duration / 4,
        yoyo: true,
        hold: duration / 4,
      }).then(() => { g.destroy(); })
    )
  );

  return Promise.all(promises).then(() => {});
}

export function lightning(
  scene: Phaser.Scene,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  color: number,
  duration: number,
): Promise<void> {
  const g = scene.add.graphics();
  g.setDepth(800);
  g.setScrollFactor(0);

  // Build zigzag path
  const segments = 6;
  const dx = (endX - startX) / segments;
  const dy = (endY - startY) / segments;

  g.lineStyle(2, color, 1);
  g.beginPath();
  g.moveTo(startX, startY);

  for (let i = 1; i < segments; i++) {
    const jitter = (Math.random() - 0.5) * 12;
    g.lineTo(startX + dx * i + jitter, startY + dy * i + jitter * 0.5);
  }
  g.lineTo(endX, endY);
  g.strokePath();

  return tweenPromise(scene, {
    targets: g,
    alpha: 0,
    duration,
    delay: duration * 0.3,
  }).then(() => { g.destroy(); });
}

// === Thunder Shock Animation (ID 84) ===

registerAnimation(84, async (ctx: AnimationContext) => {
  const { scene, attackerSprite, defenderSprite } = ctx;

  // 1. Lightning bolt from attacker to defender
  await lightning(
    scene,
    attackerSprite.x, attackerSprite.y - 4,
    defenderSprite.x, defenderSprite.y,
    0xFFCC00, 300,
  );

  // 2. Electric spark particles around defender
  await particles(scene, defenderSprite.x, defenderSprite.y, 0xFFCC00, 6, 12, 200);

  // 3. Brief yellow screen flash
  await screenFlash(scene, 0xFFCC00, 50);

  // 4. Yellow tint-flash on defender
  await spriteFlash(defenderSprite, scene, 0xFFCC00, 2);
});

// === Main Entry Point ===

export async function playMoveAnimation(moveId: number, ctx: AnimationContext): Promise<void> {
  const animFn = MOVE_ANIMATIONS[moveId];
  if (animFn) {
    await animFn(ctx);
    return;
  }

  // Type-based fallback
  const moveData = MOVES_DATA[moveId];
  if (!moveData) return;

  const color = TYPE_COLORS[moveData.type] || 0xA8A878;

  if (moveData.category === MoveCategory.STATUS) {
    // Status: sparkle on self or target
    const target = moveData.power === 0 && !moveData.effect?.toString().includes('DOWN')
      ? ctx.attackerSprite
      : ctx.defenderSprite;
    await sparkle(ctx.scene, target.x, target.y, color, 5, 300);
  } else if (PHYSICAL_TYPES.includes(moveData.type) && moveData.power > 0) {
    // Physical: lunge toward target
    await lunge(ctx.scene, ctx.attackerSprite, ctx.defenderSprite.x, ctx.defenderSprite.y, 200);
  } else {
    // Special: colored flash
    await screenFlash(ctx.scene, color, 150);
  }
}
