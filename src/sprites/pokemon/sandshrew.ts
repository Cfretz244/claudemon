import { CustomSpriteDrawFn } from '../types';

export const sandshrew: CustomSpriteDrawFn = (ctx, isBack) => {
  // Body - round yellow armadillo
  ctx.fillStyle = '#d8b868';
  ctx.fillRect(6, 10, 20, 14);
  ctx.fillRect(4, 12, 24, 10);

  // Head
  ctx.fillStyle = '#d8b868';
  ctx.fillRect(4, 6, 14, 8);
  ctx.fillRect(6, 4, 10, 4);

  // Cream belly
  ctx.fillStyle = '#f0e0b0';
  ctx.fillRect(8, 16, 14, 6);

  // Brick pattern on back
  ctx.fillStyle = '#c0a050';
  ctx.fillRect(16, 10, 8, 3);
  ctx.fillRect(14, 13, 10, 3);
  ctx.fillRect(16, 16, 8, 3);
  ctx.fillRect(14, 19, 10, 3);
  // Brick lines
  ctx.fillStyle = '#b09040';
  ctx.fillRect(20, 10, 1, 12);
  ctx.fillRect(16, 13, 1, 3);
  ctx.fillRect(22, 16, 1, 3);
  ctx.fillRect(16, 19, 1, 3);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(6, 7, 3, 3);
    ctx.fillRect(13, 7, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6, 7, 2, 2);
    ctx.fillRect(13, 7, 2, 2);
    // Nose
    ctx.fillStyle = '#302020';
    ctx.fillRect(4, 10, 2, 1);
    // Mouth
    ctx.fillStyle = '#c0a050';
    ctx.fillRect(6, 12, 6, 1);
  } else {
    // Full brick pattern visible from back
    ctx.fillStyle = '#c0a050';
    ctx.fillRect(6, 10, 20, 12);
    // Brick grid
    ctx.fillStyle = '#b09040';
    ctx.fillRect(6, 13, 20, 1);
    ctx.fillRect(6, 16, 20, 1);
    ctx.fillRect(6, 19, 20, 1);
    ctx.fillRect(12, 10, 1, 12);
    ctx.fillRect(19, 10, 1, 12);
    ctx.fillRect(16, 13, 1, 3);
    ctx.fillRect(16, 19, 1, 3);
  }

  // Small arms
  ctx.fillStyle = '#d8b868';
  ctx.fillRect(2, 14, 4, 4);
  ctx.fillRect(26, 14, 4, 4);
  // Claws
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(2, 17, 2, 2);
  ctx.fillRect(28, 17, 2, 2);

  // Feet
  ctx.fillStyle = '#c0a050';
  ctx.fillRect(8, 24, 5, 3);
  ctx.fillRect(19, 24, 5, 3);
};
