import { CustomSpriteDrawFn } from '../types';

export const jigglypuff: CustomSpriteDrawFn = (ctx, isBack) => {
  // Jigglypuff - round pink ball, huge eyes, tuft of hair, tiny feet

  // Round body (main circle)
  ctx.fillStyle = '#f8a8b8';
  ctx.fillRect(7, 10, 18, 16);
  ctx.fillRect(5, 12, 22, 12);
  ctx.fillRect(9, 8, 14, 2);
  ctx.fillRect(9, 26, 14, 2);

  // Tuft of hair on top
  ctx.fillStyle = '#f8a8b8';
  ctx.fillRect(13, 3, 6, 6);
  ctx.fillRect(14, 2, 4, 2);
  ctx.fillRect(15, 1, 3, 2);

  // Ears - small and pointed
  ctx.fillStyle = '#f8a8b8';
  ctx.fillRect(5, 8, 4, 4);
  ctx.fillRect(23, 8, 4, 4);
  // Inner ear
  ctx.fillStyle = '#e08090';
  ctx.fillRect(6, 9, 2, 2);
  ctx.fillRect(24, 9, 2, 2);

  if (!isBack) {
    // Huge eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(9, 13, 5, 5);
    ctx.fillRect(18, 13, 5, 5);
    // Eye whites/highlights - big blue-green
    ctx.fillStyle = '#50b0a0';
    ctx.fillRect(10, 13, 3, 3);
    ctx.fillRect(19, 13, 3, 3);
    // Eye highlight
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 13, 2, 2);
    ctx.fillRect(19, 13, 2, 2);
    // Mouth - small
    ctx.fillStyle = '#302020';
    ctx.fillRect(14, 20, 4, 2);
    ctx.fillStyle = '#e05060';
    ctx.fillRect(14, 21, 4, 1);
  } else {
    // Back: round with back of hair tuft
    ctx.fillStyle = '#e08090';
    ctx.fillRect(12, 14, 8, 6);
  }

  // Tiny feet
  ctx.fillStyle = '#e08090';
  ctx.fillRect(10, 27, 4, 3);
  ctx.fillRect(18, 27, 4, 3);

  // Small arms
  ctx.fillStyle = '#f8a8b8';
  ctx.fillRect(4, 17, 3, 4);
  ctx.fillRect(25, 17, 3, 4);
};
