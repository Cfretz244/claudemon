import { CustomSpriteDrawFn } from '../types';

export const ivysaur: CustomSpriteDrawFn = (ctx, isBack) => {
  // Body - larger than Bulbasaur
  ctx.fillStyle = '#78c850';
  ctx.fillRect(5, 16, 22, 10);
  ctx.fillRect(7, 14, 18, 4);

  // Flower bud on back
  ctx.fillStyle = '#e06080';
  ctx.fillRect(11, 6, 10, 8);
  ctx.fillRect(9, 8, 14, 4);
  ctx.fillStyle = '#406830';
  ctx.fillRect(9, 10, 4, 6);
  ctx.fillRect(19, 10, 4, 6);
  // Leaves around bud
  ctx.fillStyle = '#58a830';
  ctx.fillRect(8, 12, 16, 4);

  if (!isBack) {
    // Head
    ctx.fillStyle = '#78c850';
    ctx.fillRect(3, 14, 9, 8);
    ctx.fillRect(2, 16, 11, 4);
    // Eyes
    ctx.fillStyle = '#e03030';
    ctx.fillRect(4, 15, 3, 3);
    ctx.fillStyle = '#302020';
    ctx.fillRect(5, 16, 2, 2);
    // Mouth
    ctx.fillStyle = '#406830';
    ctx.fillRect(3, 20, 7, 1);
  } else {
    // Back view - big bud prominent
    ctx.fillStyle = '#e06080';
    ctx.fillRect(10, 5, 12, 10);
    ctx.fillStyle = '#58a830';
    ctx.fillRect(8, 11, 16, 5);
  }

  // Legs
  ctx.fillStyle = '#58a830';
  ctx.fillRect(6, 26, 5, 4);
  ctx.fillRect(21, 26, 5, 4);
  ctx.fillRect(10, 26, 4, 3);
  ctx.fillRect(18, 26, 4, 3);
};
