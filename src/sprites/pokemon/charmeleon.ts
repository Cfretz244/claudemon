import { CustomSpriteDrawFn } from '../types';

export const charmeleon: CustomSpriteDrawFn = (ctx, isBack) => {
  // Body - taller than Charmander
  ctx.fillStyle = '#e06030';
  ctx.fillRect(9, 10, 14, 14);
  ctx.fillRect(7, 12, 18, 10);

  // Head with horn
  ctx.fillStyle = '#e06030';
  ctx.fillRect(9, 3, 14, 10);
  ctx.fillRect(7, 5, 18, 6);
  // Horn on back of head
  ctx.fillStyle = '#c04820';
  ctx.fillRect(20, 1, 3, 4);

  // Yellow belly
  ctx.fillStyle = '#f8d030';
  ctx.fillRect(11, 14, 10, 8);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 6, 3, 3);
    ctx.fillRect(18, 6, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 6, 2, 2);
    ctx.fillRect(18, 6, 2, 2);
    // Mouth
    ctx.fillStyle = '#c04820';
    ctx.fillRect(12, 10, 8, 1);
  } else {
    ctx.fillStyle = '#c04820';
    ctx.fillRect(14, 6, 4, 12);
    ctx.fillRect(20, 1, 3, 5);
  }

  // Arms
  ctx.fillStyle = '#e06030';
  ctx.fillRect(5, 14, 4, 4);
  ctx.fillRect(23, 14, 4, 4);

  // Legs
  ctx.fillStyle = '#c04820';
  ctx.fillRect(9, 24, 5, 4);
  ctx.fillRect(18, 24, 5, 4);

  // Longer tail with flame
  ctx.fillStyle = '#e06030';
  ctx.fillRect(23, 18, 4, 3);
  ctx.fillRect(25, 14, 3, 5);
  ctx.fillRect(27, 10, 3, 5);
  // Flame
  ctx.fillStyle = '#f8d030';
  ctx.fillRect(27, 7, 4, 4);
  ctx.fillStyle = '#f87830';
  ctx.fillRect(28, 8, 2, 2);
};
