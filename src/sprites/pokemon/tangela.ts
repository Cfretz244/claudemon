import { CustomSpriteDrawFn } from '../types';

export const tangela: CustomSpriteDrawFn = (ctx, isBack) => {
  // Tangela - mass of blue vines, red feet peeking out, eyes peeking from vines

  // Main vine mass
  ctx.fillStyle = '#4878b8';
  ctx.fillRect(4, 4, 24, 20);
  ctx.fillRect(2, 6, 28, 16);
  ctx.fillRect(6, 2, 20, 22);

  // Vine tendrils sticking out
  ctx.fillStyle = '#4878b8';
  ctx.fillRect(0, 8, 4, 3);
  ctx.fillRect(28, 10, 4, 3);
  ctx.fillRect(2, 4, 4, 3);
  ctx.fillRect(26, 5, 4, 3);
  ctx.fillRect(8, 1, 4, 3);
  ctx.fillRect(20, 0, 4, 3);
  ctx.fillRect(14, 0, 4, 3);
  ctx.fillRect(0, 14, 3, 3);
  ctx.fillRect(29, 14, 3, 3);

  // Vine texture - lighter vine highlights
  ctx.fillStyle = '#5888c8';
  ctx.fillRect(6, 6, 3, 12);
  ctx.fillRect(12, 4, 3, 14);
  ctx.fillRect(18, 5, 3, 13);
  ctx.fillRect(24, 7, 3, 11);
  ctx.fillRect(9, 8, 2, 8);
  ctx.fillRect(15, 3, 2, 10);
  ctx.fillRect(21, 6, 2, 10);

  // Darker vine shadows
  ctx.fillStyle = '#3868a8';
  ctx.fillRect(8, 10, 2, 6);
  ctx.fillRect(14, 8, 2, 6);
  ctx.fillRect(20, 10, 2, 6);
  ctx.fillRect(10, 16, 12, 3);

  // Red feet peeking out bottom
  ctx.fillStyle = '#d05040';
  ctx.fillRect(7, 22, 6, 4);
  ctx.fillRect(19, 22, 6, 4);
  ctx.fillRect(6, 24, 7, 4);
  ctx.fillRect(18, 24, 7, 4);

  if (!isBack) {
    // Eyes peeking through vines
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 9, 3, 4);
    ctx.fillRect(19, 9, 3, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 9, 2, 3);
    ctx.fillRect(19, 9, 2, 3);
  } else {
    // Back - more vine texture
    ctx.fillStyle = '#3868a8';
    ctx.fillRect(8, 6, 16, 12);
    ctx.fillStyle = '#5888c8';
    ctx.fillRect(10, 8, 4, 8);
    ctx.fillRect(18, 8, 4, 8);
  }
};
