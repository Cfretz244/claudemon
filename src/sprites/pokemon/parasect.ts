import { CustomSpriteDrawFn } from '../types';

export const parasect: CustomSpriteDrawFn = (ctx, isBack) => {
  // Parasect - large mushroom cap dominates, small crab body underneath

  // Giant mushroom cap - red
  ctx.fillStyle = '#c03030';
  ctx.fillRect(2, 4, 28, 14);
  ctx.fillRect(4, 2, 24, 2);
  ctx.fillRect(4, 18, 24, 2);

  // Cap spots - white
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(6, 5, 4, 3);
  ctx.fillRect(14, 4, 4, 3);
  ctx.fillRect(22, 6, 4, 3);
  ctx.fillRect(9, 10, 3, 3);
  ctx.fillRect(18, 11, 4, 3);
  ctx.fillRect(26, 10, 2, 2);

  // Small crab body underneath
  ctx.fillStyle = '#e08040';
  ctx.fillRect(8, 20, 16, 6);
  ctx.fillRect(6, 22, 20, 4);

  // Legs
  ctx.fillStyle = '#c06830';
  ctx.fillRect(3, 24, 4, 4);
  ctx.fillRect(7, 26, 3, 3);
  ctx.fillRect(22, 26, 3, 3);
  ctx.fillRect(25, 24, 4, 4);

  // Pincers
  ctx.fillStyle = '#c06830';
  ctx.fillRect(2, 20, 6, 3);
  ctx.fillRect(24, 20, 6, 3);
  ctx.fillRect(1, 19, 3, 2);
  ctx.fillRect(28, 19, 3, 2);

  if (!isBack) {
    // Small eyes under the cap
    ctx.fillStyle = '#302020';
    ctx.fillRect(11, 21, 2, 2);
    ctx.fillRect(19, 21, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 21, 1, 1);
    ctx.fillRect(19, 21, 1, 1);
  } else {
    // Back - just the massive mushroom cap
    ctx.fillStyle = '#a02020';
    ctx.fillRect(6, 8, 20, 8);
  }
};
