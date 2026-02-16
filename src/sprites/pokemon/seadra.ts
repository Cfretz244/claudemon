import { CustomSpriteDrawFn } from '../types';

export const seadra: CustomSpriteDrawFn = (ctx, isBack) => {
  // Seadra - larger blue seahorse, spiky fins, longer snout

  // Body
  ctx.fillStyle = '#3878b0';
  ctx.fillRect(8, 10, 14, 12);
  ctx.fillRect(6, 12, 18, 8);
  ctx.fillRect(10, 8, 10, 14);

  // Head
  ctx.fillStyle = '#3878b0';
  ctx.fillRect(8, 3, 14, 9);
  ctx.fillRect(6, 5, 16, 7);

  // Belly lighter
  ctx.fillStyle = '#6098c8';
  ctx.fillRect(10, 12, 8, 6);

  // Longer snout
  ctx.fillStyle = '#3878b0';
  ctx.fillRect(2, 6, 6, 3);
  ctx.fillRect(0, 7, 4, 2);
  // Snout tip
  ctx.fillStyle = '#2868a0';
  ctx.fillRect(0, 7, 2, 2);

  // Head crest - spikier
  ctx.fillStyle = '#2868a0';
  ctx.fillRect(18, 2, 4, 4);
  ctx.fillRect(21, 0, 3, 4);
  ctx.fillRect(24, 0, 2, 2);
  ctx.fillRect(16, 3, 3, 3);

  // Spiky fins on sides
  ctx.fillStyle = '#2868a0';
  ctx.fillRect(22, 10, 4, 3);
  ctx.fillRect(25, 8, 3, 3);
  ctx.fillRect(27, 6, 3, 3);
  ctx.fillRect(22, 16, 4, 3);
  ctx.fillRect(25, 18, 3, 3);

  // Belly spine/ridges
  ctx.fillStyle = '#6098c8';
  ctx.fillRect(6, 14, 2, 2);
  ctx.fillRect(4, 16, 2, 2);

  // Curly tail
  ctx.fillStyle = '#3878b0';
  ctx.fillRect(10, 22, 6, 3);
  ctx.fillRect(8, 24, 4, 3);
  ctx.fillRect(10, 26, 4, 3);
  ctx.fillRect(13, 27, 4, 3);
  ctx.fillRect(16, 26, 3, 2);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 6, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 6, 2, 2);
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(0, 9, 2, 1);
  } else {
    // Back detail
    ctx.fillStyle = '#2868a0';
    ctx.fillRect(10, 8, 10, 8);
    ctx.fillRect(12, 6, 6, 2);
  }
};
