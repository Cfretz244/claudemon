import { CustomSpriteDrawFn } from '../types';

export const hitmonchan: CustomSpriteDrawFn = (ctx, isBack) => {
  // Hitmonchan - brown body, red boxing gloves, skirt-like lower body

  // Head
  ctx.fillStyle = '#b09060';
  ctx.fillRect(11, 4, 10, 8);
  ctx.fillRect(9, 6, 14, 6);

  // Torso
  ctx.fillStyle = '#b09060';
  ctx.fillRect(11, 12, 10, 6);
  ctx.fillRect(10, 14, 12, 3);

  // Skirt-like lower body
  ctx.fillStyle = '#a07848';
  ctx.fillRect(8, 17, 16, 6);
  ctx.fillRect(6, 19, 20, 4);

  // Arms
  ctx.fillStyle = '#b09060';
  ctx.fillRect(5, 12, 6, 3);
  ctx.fillRect(21, 12, 6, 3);

  // Red boxing gloves
  ctx.fillStyle = '#c03030';
  ctx.fillRect(1, 10, 6, 6);
  ctx.fillRect(2, 9, 4, 8);
  ctx.fillRect(25, 10, 6, 6);
  ctx.fillRect(26, 9, 4, 8);

  // Glove details
  ctx.fillStyle = '#e04040';
  ctx.fillRect(2, 11, 3, 2);
  ctx.fillRect(26, 11, 3, 2);

  // Legs
  ctx.fillStyle = '#b09060';
  ctx.fillRect(10, 23, 4, 4);
  ctx.fillRect(18, 23, 4, 4);

  // Feet
  ctx.fillStyle = '#a07848';
  ctx.fillRect(9, 27, 5, 3);
  ctx.fillRect(17, 27, 5, 3);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(12, 7, 2, 3);
    ctx.fillRect(18, 7, 2, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(12, 7, 1, 2);
    ctx.fillRect(18, 7, 1, 2);
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(14, 11, 4, 1);
  } else {
    // Back shading
    ctx.fillStyle = '#987848';
    ctx.fillRect(12, 6, 8, 5);
    ctx.fillRect(10, 18, 12, 3);
  }
};
