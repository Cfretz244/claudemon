import { CustomSpriteDrawFn } from '../types';

export const poliwhirl: CustomSpriteDrawFn = (ctx, isBack) => {
  // Poliwhirl - blue frog body, spiral on white belly, white glove-like hands

  // Body
  ctx.fillStyle = '#3870b0';
  ctx.fillRect(6, 8, 20, 16);
  ctx.fillRect(4, 10, 24, 12);
  ctx.fillRect(8, 6, 16, 4);

  // White belly
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(10, 12, 12, 10);
  ctx.fillRect(12, 10, 8, 2);
  ctx.fillRect(12, 22, 8, 2);

  // Spiral on belly - bigger and clearer
  ctx.fillStyle = '#302020';
  ctx.fillRect(14, 15, 4, 2);
  ctx.fillRect(12, 13, 2, 6);
  ctx.fillRect(12, 19, 8, 2);
  ctx.fillRect(18, 13, 2, 8);
  ctx.fillRect(14, 11, 6, 2);
  ctx.fillRect(10, 13, 2, 4);

  // Arms
  ctx.fillStyle = '#3870b0';
  ctx.fillRect(0, 12, 5, 6);
  ctx.fillRect(27, 12, 5, 6);

  // White glove-like hands
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 16, 5, 5);
  ctx.fillRect(27, 16, 5, 5);

  // Legs
  ctx.fillStyle = '#3870b0';
  ctx.fillRect(8, 24, 6, 5);
  ctx.fillRect(18, 24, 6, 5);
  // Feet
  ctx.fillStyle = '#2860a0';
  ctx.fillRect(7, 28, 7, 2);
  ctx.fillRect(18, 28, 7, 2);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(9, 7, 4, 3);
    ctx.fillRect(19, 7, 4, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(9, 7, 2, 2);
    ctx.fillRect(19, 7, 2, 2);
    // Mouth
    ctx.fillStyle = '#f07080';
    ctx.fillRect(13, 9, 6, 2);
  } else {
    // Back - blue pattern
    ctx.fillStyle = '#2860a0';
    ctx.fillRect(10, 12, 12, 8);
    ctx.fillRect(12, 10, 8, 2);
  }
};
