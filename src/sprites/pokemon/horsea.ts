import { CustomSpriteDrawFn } from '../types';

export const horsea: CustomSpriteDrawFn = (ctx, isBack) => {
  // Horsea - small blue seahorse, tubular snout, curly tail

  // Body
  ctx.fillStyle = '#4888c0';
  ctx.fillRect(10, 10, 12, 10);
  ctx.fillRect(8, 12, 16, 6);
  ctx.fillRect(12, 8, 8, 14);

  // Head
  ctx.fillStyle = '#4888c0';
  ctx.fillRect(10, 4, 12, 8);
  ctx.fillRect(8, 6, 14, 6);

  // Belly lighter
  ctx.fillStyle = '#78b0d8';
  ctx.fillRect(12, 12, 6, 6);

  // Tubular snout
  ctx.fillStyle = '#4888c0';
  ctx.fillRect(4, 7, 6, 3);
  ctx.fillRect(2, 8, 4, 2);
  // Snout tip
  ctx.fillStyle = '#3878b0';
  ctx.fillRect(2, 8, 2, 2);

  // Head fin/crest
  ctx.fillStyle = '#3878b0';
  ctx.fillRect(18, 3, 3, 4);
  ctx.fillRect(20, 1, 3, 4);
  ctx.fillRect(22, 0, 2, 3);

  // Small fin on back
  ctx.fillStyle = '#3878b0';
  ctx.fillRect(22, 12, 4, 3);
  ctx.fillRect(24, 11, 3, 2);

  // Curly tail
  ctx.fillStyle = '#4888c0';
  ctx.fillRect(12, 20, 6, 3);
  ctx.fillRect(10, 22, 4, 3);
  ctx.fillRect(12, 24, 4, 3);
  ctx.fillRect(14, 26, 4, 3);
  ctx.fillRect(16, 24, 3, 3);
  // Inner curve of tail
  ctx.fillStyle = '#78b0d8';
  ctx.fillRect(13, 23, 2, 2);

  if (!isBack) {
    // Eye
    ctx.fillStyle = '#302020';
    ctx.fillRect(12, 7, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(12, 7, 2, 2);
    // Mouth at snout end
    ctx.fillStyle = '#302020';
    ctx.fillRect(2, 10, 2, 1);
  } else {
    // Back shading
    ctx.fillStyle = '#3878b0';
    ctx.fillRect(12, 8, 8, 8);
    ctx.fillRect(14, 6, 4, 2);
  }
};
