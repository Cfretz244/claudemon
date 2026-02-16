import { CustomSpriteDrawFn } from '../types';

export const machamp: CustomSpriteDrawFn = (ctx, isBack) => {
  // Machamp - 4-armed muscular gray, belt, very wide

  // Body - massive torso
  ctx.fillStyle = '#6878a0';
  ctx.fillRect(8, 10, 16, 14);
  ctx.fillRect(6, 12, 20, 10);

  // Belt
  ctx.fillStyle = '#302020';
  ctx.fillRect(6, 20, 20, 3);
  // Belt buckle
  ctx.fillStyle = '#c0a020';
  ctx.fillRect(14, 20, 4, 3);

  // Head
  ctx.fillStyle = '#6878a0';
  ctx.fillRect(10, 2, 12, 10);
  ctx.fillRect(8, 4, 16, 6);

  // Three ridges
  ctx.fillStyle = '#4c6080';
  ctx.fillRect(12, 0, 3, 4);
  ctx.fillRect(15, 0, 3, 3);
  ctx.fillRect(18, 0, 3, 4);

  if (!isBack) {
    // Fierce eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(11, 5, 3, 3);
    ctx.fillRect(18, 5, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 5, 2, 2);
    ctx.fillRect(18, 5, 2, 2);
    // Angry mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(13, 9, 6, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(14, 9, 4, 1);
  } else {
    // Back musculature
    ctx.fillStyle = '#4c6080';
    ctx.fillRect(10, 5, 12, 10);
    ctx.fillRect(12, 13, 8, 5);
  }

  // Upper arms (pair 1 - higher, wider)
  ctx.fillStyle = '#6878a0';
  ctx.fillRect(0, 10, 7, 7);
  ctx.fillRect(25, 10, 7, 7);
  ctx.fillStyle = '#7888b0';
  ctx.fillRect(1, 11, 4, 4);
  ctx.fillRect(26, 11, 4, 4);

  // Lower arms (pair 2 - lower, slightly inward)
  ctx.fillStyle = '#6878a0';
  ctx.fillRect(2, 16, 6, 6);
  ctx.fillRect(24, 16, 6, 6);
  ctx.fillStyle = '#7888b0';
  ctx.fillRect(3, 17, 3, 3);
  ctx.fillRect(25, 17, 3, 3);

  // Legs
  ctx.fillStyle = '#6878a0';
  ctx.fillRect(8, 24, 6, 5);
  ctx.fillRect(18, 24, 6, 5);
  // Feet
  ctx.fillStyle = '#4c6080';
  ctx.fillRect(7, 28, 7, 3);
  ctx.fillRect(17, 28, 7, 3);
};
