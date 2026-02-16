import { CustomSpriteDrawFn } from '../types';

export const pikachu: CustomSpriteDrawFn = (ctx, isBack) => {
  // Body
  ctx.fillStyle = '#f8d030';
  ctx.fillRect(9, 12, 14, 12);
  ctx.fillRect(7, 14, 18, 8);

  // Ears - tall pointed
  ctx.fillStyle = '#f8d030';
  ctx.fillRect(8, 2, 4, 12);
  ctx.fillRect(20, 2, 4, 12);
  // Black ear tips
  ctx.fillStyle = '#302020';
  ctx.fillRect(8, 2, 4, 4);
  ctx.fillRect(20, 2, 4, 4);

  // Head
  ctx.fillStyle = '#f8d030';
  ctx.fillRect(8, 8, 16, 8);
  ctx.fillRect(7, 10, 18, 4);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(11, 10, 3, 4);
    ctx.fillRect(18, 10, 3, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 10, 2, 2);
    ctx.fillRect(18, 10, 2, 2);
    // Red cheeks
    ctx.fillStyle = '#e03030';
    ctx.fillRect(7, 13, 3, 3);
    ctx.fillRect(22, 13, 3, 3);
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(15, 15, 2, 1);
  } else {
    ctx.fillStyle = '#c0a020';
    ctx.fillRect(11, 12, 10, 6);
    ctx.fillStyle = '#b09018';
    ctx.fillRect(13, 10, 6, 2);
  }

  // Arms
  ctx.fillStyle = '#f8d030';
  ctx.fillRect(6, 16, 3, 4);
  ctx.fillRect(23, 16, 3, 4);

  // Feet
  ctx.fillStyle = '#c0a020';
  ctx.fillRect(9, 24, 5, 3);
  ctx.fillRect(18, 24, 5, 3);

  // Tail - lightning bolt
  ctx.fillStyle = '#c0a020';
  ctx.fillRect(24, 8, 4, 3);
  ctx.fillRect(26, 5, 4, 4);
  ctx.fillRect(24, 3, 4, 3);
  ctx.fillStyle = '#f8d030';
  ctx.fillRect(22, 10, 4, 3);
};
