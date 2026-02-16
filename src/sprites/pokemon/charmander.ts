import { CustomSpriteDrawFn } from '../types';

export const charmander: CustomSpriteDrawFn = (ctx, isBack) => {
  // Body - upright orange lizard
  ctx.fillStyle = '#f08030';
  ctx.fillRect(10, 10, 12, 14);
  ctx.fillRect(8, 12, 16, 10);

  // Head
  ctx.fillStyle = '#f08030';
  ctx.fillRect(10, 4, 12, 10);
  ctx.fillRect(8, 6, 16, 6);

  // Yellow belly
  ctx.fillStyle = '#f8d030';
  ctx.fillRect(12, 14, 8, 8);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(11, 7, 3, 3);
    ctx.fillRect(18, 7, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 7, 2, 2);
    ctx.fillRect(18, 7, 2, 2);
    // Mouth
    ctx.fillStyle = '#c06020';
    ctx.fillRect(13, 11, 6, 1);
  } else {
    ctx.fillStyle = '#c06020';
    ctx.fillRect(14, 8, 4, 10);
  }

  // Arms
  ctx.fillStyle = '#f08030';
  ctx.fillRect(6, 14, 4, 3);
  ctx.fillRect(22, 14, 4, 3);

  // Legs
  ctx.fillStyle = '#c06020';
  ctx.fillRect(10, 24, 5, 4);
  ctx.fillRect(17, 24, 5, 4);

  // Tail with flame
  ctx.fillStyle = '#f08030';
  ctx.fillRect(22, 18, 4, 3);
  ctx.fillRect(24, 15, 3, 4);
  ctx.fillStyle = '#f8d030';
  ctx.fillRect(25, 12, 3, 4);
  ctx.fillStyle = '#f87830';
  ctx.fillRect(26, 13, 2, 2);
};
