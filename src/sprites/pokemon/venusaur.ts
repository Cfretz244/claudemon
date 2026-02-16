import { CustomSpriteDrawFn } from '../types';

export const venusaur: CustomSpriteDrawFn = (ctx, isBack) => {
  // Massive body
  ctx.fillStyle = '#78c850';
  ctx.fillRect(3, 18, 26, 10);
  ctx.fillRect(5, 16, 22, 4);

  // Huge flower on back
  ctx.fillStyle = '#e06080';
  ctx.fillRect(8, 4, 16, 10);
  ctx.fillRect(6, 6, 20, 6);
  // Flower center
  ctx.fillStyle = '#f0a0b0';
  ctx.fillRect(12, 6, 8, 6);
  // Leaves
  ctx.fillStyle = '#406830';
  ctx.fillRect(4, 12, 24, 4);
  ctx.fillStyle = '#58a830';
  ctx.fillRect(6, 13, 20, 3);

  if (!isBack) {
    // Head
    ctx.fillStyle = '#78c850';
    ctx.fillRect(1, 16, 10, 8);
    ctx.fillRect(0, 18, 12, 4);
    // Eyes
    ctx.fillStyle = '#e03030';
    ctx.fillRect(2, 17, 3, 3);
    ctx.fillStyle = '#302020';
    ctx.fillRect(3, 18, 2, 2);
    // Mouth
    ctx.fillStyle = '#406830';
    ctx.fillRect(2, 22, 7, 1);
  } else {
    ctx.fillStyle = '#e06080';
    ctx.fillRect(7, 3, 18, 12);
    ctx.fillStyle = '#f0a0b0';
    ctx.fillRect(11, 5, 10, 8);
    ctx.fillStyle = '#406830';
    ctx.fillRect(4, 12, 24, 4);
  }

  // Thick legs
  ctx.fillStyle = '#58a830';
  ctx.fillRect(4, 28, 6, 4);
  ctx.fillRect(22, 28, 6, 4);
  ctx.fillRect(10, 28, 5, 3);
  ctx.fillRect(17, 28, 5, 3);
};
