import { CustomSpriteDrawFn } from '../types';

export const bulbasaur: CustomSpriteDrawFn = (ctx, isBack) => {
  // Body - squat green quadruped
  ctx.fillStyle = '#78c850';
  ctx.fillRect(6, 16, 20, 10);
  ctx.fillRect(8, 14, 16, 4);

  // Bulb on back
  ctx.fillStyle = '#406830';
  ctx.fillRect(10, 8, 12, 8);
  ctx.fillRect(8, 10, 16, 4);
  ctx.fillStyle = '#58a830';
  ctx.fillRect(12, 9, 8, 5);

  if (!isBack) {
    // Head
    ctx.fillStyle = '#78c850';
    ctx.fillRect(4, 14, 8, 8);
    ctx.fillRect(3, 16, 10, 4);
    // Eyes
    ctx.fillStyle = '#e03030';
    ctx.fillRect(5, 15, 3, 3);
    ctx.fillStyle = '#302020';
    ctx.fillRect(6, 16, 2, 2);
    // Mouth
    ctx.fillStyle = '#406830';
    ctx.fillRect(4, 20, 6, 1);
  } else {
    ctx.fillStyle = '#406830';
    ctx.fillRect(9, 7, 14, 9);
    ctx.fillStyle = '#58a830';
    ctx.fillRect(11, 8, 10, 6);
  }

  // Four legs
  ctx.fillStyle = '#58a830';
  ctx.fillRect(7, 26, 4, 4);
  ctx.fillRect(21, 26, 4, 4);
  ctx.fillRect(10, 26, 4, 3);
  ctx.fillRect(18, 26, 4, 3);
};
