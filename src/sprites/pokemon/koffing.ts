import { CustomSpriteDrawFn } from '../types';

export const koffing: CustomSpriteDrawFn = (ctx, isBack) => {
  // Koffing - purple floating ball, skull-and-crossbones marking, wisps of smoke

  // Main body - round purple
  ctx.fillStyle = '#8060a0';
  ctx.fillRect(7, 8, 18, 16);
  ctx.fillRect(5, 10, 22, 12);
  ctx.fillRect(9, 6, 14, 20);
  ctx.fillRect(11, 5, 10, 2);
  ctx.fillRect(11, 25, 10, 2);

  // Crater bumps on surface
  ctx.fillStyle = '#705890';
  ctx.fillRect(6, 14, 3, 3);
  ctx.fillRect(23, 12, 3, 3);
  ctx.fillRect(10, 22, 3, 3);
  ctx.fillRect(20, 20, 3, 3);

  // Skull marking
  ctx.fillStyle = '#d8d0c0';
  ctx.fillRect(13, 12, 6, 5);
  ctx.fillRect(12, 13, 8, 3);
  // Crossbones below skull
  ctx.fillRect(10, 18, 2, 1);
  ctx.fillRect(12, 19, 2, 1);
  ctx.fillRect(14, 20, 4, 1);
  ctx.fillRect(18, 19, 2, 1);
  ctx.fillRect(20, 18, 2, 1);
  ctx.fillRect(10, 20, 2, 1);
  ctx.fillRect(12, 19, 2, 1);
  ctx.fillRect(20, 20, 2, 1);

  // Smoke wisps above
  ctx.fillStyle = '#a890b8';
  ctx.fillRect(8, 2, 3, 4);
  ctx.fillRect(6, 1, 3, 3);
  ctx.fillRect(20, 3, 3, 3);
  ctx.fillRect(22, 1, 3, 3);
  ctx.fillRect(14, 1, 4, 3);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(11, 9, 3, 3);
    ctx.fillRect(18, 9, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 9, 2, 2);
    ctx.fillRect(18, 9, 2, 2);
    // Skull eye holes
    ctx.fillStyle = '#8060a0';
    ctx.fillRect(13, 13, 2, 2);
    ctx.fillRect(17, 13, 2, 2);
    // Mouth (sad/grumpy)
    ctx.fillStyle = '#302020';
    ctx.fillRect(14, 11, 4, 1);
  } else {
    // Back - crater detail
    ctx.fillStyle = '#705890';
    ctx.fillRect(12, 10, 8, 6);
    ctx.fillRect(14, 8, 4, 2);
  }
};
