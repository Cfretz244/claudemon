import { CustomSpriteDrawFn } from '../types';

export const staryu: CustomSpriteDrawFn = (ctx, isBack) => {
  // Staryu - brown/tan five-pointed star with red gem center

  // Top point
  ctx.fillStyle = '#b09868';
  ctx.fillRect(14, 0, 4, 8);
  ctx.fillRect(13, 4, 6, 4);

  // Left point
  ctx.fillRect(0, 12, 8, 4);
  ctx.fillRect(4, 10, 4, 8);

  // Right point
  ctx.fillRect(24, 12, 8, 4);
  ctx.fillRect(24, 10, 4, 8);

  // Bottom-left point
  ctx.fillRect(4, 24, 4, 6);
  ctx.fillRect(6, 22, 4, 4);

  // Bottom-right point
  ctx.fillRect(24, 24, 4, 6);
  ctx.fillRect(22, 22, 4, 4);

  // Center body connecting all points
  ctx.fillRect(8, 8, 16, 16);
  ctx.fillRect(6, 10, 20, 12);
  ctx.fillRect(10, 6, 12, 20);

  // Darker outline detail
  ctx.fillStyle = '#988050';
  ctx.fillRect(10, 8, 12, 2);
  ctx.fillRect(8, 10, 2, 12);
  ctx.fillRect(22, 10, 2, 12);
  ctx.fillRect(10, 22, 12, 2);

  // Red gem center
  ctx.fillStyle = '#c03030';
  ctx.fillRect(13, 13, 6, 6);
  ctx.fillRect(12, 14, 8, 4);
  ctx.fillRect(14, 12, 4, 8);

  if (!isBack) {
    // Gem highlight
    ctx.fillStyle = '#e06060';
    ctx.fillRect(13, 13, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(13, 13, 1, 1);
  } else {
    // Back - slightly darker star
    ctx.fillStyle = '#988050';
    ctx.fillRect(12, 12, 8, 8);
    // Gem still visible from back
    ctx.fillStyle = '#a02828';
    ctx.fillRect(14, 14, 4, 4);
  }
};
