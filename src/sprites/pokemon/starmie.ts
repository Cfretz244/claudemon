import { CustomSpriteDrawFn } from '../types';

export const starmie: CustomSpriteDrawFn = (ctx, isBack) => {
  // Starmie - purple star with second star behind, red gem center

  // Back star (rotated 36 degrees - offset points)
  ctx.fillStyle = '#7858a0';
  ctx.fillRect(2, 6, 6, 4);
  ctx.fillRect(24, 6, 6, 4);
  ctx.fillRect(14, 24, 4, 6);
  ctx.fillRect(4, 20, 5, 4);
  ctx.fillRect(23, 20, 5, 4);
  ctx.fillRect(6, 8, 20, 2);
  ctx.fillRect(6, 22, 20, 2);

  // Front star - top point
  ctx.fillStyle = '#8868a8';
  ctx.fillRect(14, 0, 4, 8);
  ctx.fillRect(13, 4, 6, 4);

  // Front star - left point
  ctx.fillRect(0, 13, 8, 4);
  ctx.fillRect(4, 11, 4, 8);

  // Front star - right point
  ctx.fillRect(24, 13, 8, 4);
  ctx.fillRect(24, 11, 4, 8);

  // Front star - bottom-left point
  ctx.fillRect(4, 24, 5, 5);
  ctx.fillRect(6, 22, 4, 4);

  // Front star - bottom-right point
  ctx.fillRect(23, 24, 5, 5);
  ctx.fillRect(22, 22, 4, 4);

  // Center body
  ctx.fillRect(8, 8, 16, 16);
  ctx.fillRect(6, 10, 20, 12);
  ctx.fillRect(10, 6, 12, 20);

  // Inner purple detail
  ctx.fillStyle = '#9878b8';
  ctx.fillRect(10, 10, 12, 12);

  // Red gem center
  ctx.fillStyle = '#c03030';
  ctx.fillRect(13, 13, 6, 6);
  ctx.fillRect(12, 14, 8, 4);
  ctx.fillRect(14, 12, 4, 8);

  if (!isBack) {
    // Gem shine
    ctx.fillStyle = '#e06060';
    ctx.fillRect(13, 13, 3, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(13, 13, 1, 1);
  } else {
    // Back - darker center
    ctx.fillStyle = '#7050a0';
    ctx.fillRect(12, 12, 8, 8);
    ctx.fillStyle = '#a02828';
    ctx.fillRect(14, 14, 4, 4);
  }
};
