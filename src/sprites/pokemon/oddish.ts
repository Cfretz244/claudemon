import { CustomSpriteDrawFn } from '../types';

export const oddish: CustomSpriteDrawFn = (ctx, isBack) => {
  // Oddish - blue round body, 5 green leaves sprouting from top, small feet

  // Five green leaves on top
  ctx.fillStyle = '#58a830';
  // Center leaf (tallest)
  ctx.fillRect(14, 1, 4, 8);
  ctx.fillRect(15, 0, 2, 2);
  // Left leaves
  ctx.fillRect(8, 4, 4, 7);
  ctx.fillRect(7, 5, 2, 4);
  ctx.fillRect(11, 3, 3, 4);
  // Right leaves
  ctx.fillRect(20, 4, 4, 7);
  ctx.fillRect(24, 5, 2, 4);
  ctx.fillRect(18, 3, 3, 4);

  // Darker leaf veins
  ctx.fillStyle = '#408020';
  ctx.fillRect(15, 2, 2, 5);
  ctx.fillRect(9, 6, 2, 3);
  ctx.fillRect(21, 6, 2, 3);

  // Body - blue round
  ctx.fillStyle = '#5878a8';
  ctx.fillRect(8, 11, 16, 14);
  ctx.fillRect(6, 13, 20, 10);
  ctx.fillRect(10, 10, 12, 2);
  ctx.fillRect(10, 25, 12, 2);

  if (!isBack) {
    // Eyes - small
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 16, 3, 3);
    ctx.fillRect(19, 16, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 16, 2, 2);
    ctx.fillRect(19, 16, 2, 2);
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(14, 21, 4, 1);
  } else {
    // Back: leaves and round body
    ctx.fillStyle = '#4868a0';
    ctx.fillRect(11, 14, 10, 6);
  }

  // Small feet
  ctx.fillStyle = '#4868a0';
  ctx.fillRect(9, 26, 4, 3);
  ctx.fillRect(19, 26, 4, 3);
};
