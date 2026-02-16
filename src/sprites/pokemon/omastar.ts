import { CustomSpriteDrawFn } from '../types';

export const omastar: CustomSpriteDrawFn = (ctx, isBack) => {
  // Large spiral shell
  ctx.fillStyle = '#4878b0';
  ctx.fillRect(4, 0, 24, 20);
  ctx.fillRect(2, 2, 28, 16);
  ctx.fillRect(6, 0, 20, 2);

  // Spiky shell edges
  ctx.fillStyle = '#3868a0';
  ctx.fillRect(2, 2, 2, 4);
  ctx.fillRect(28, 2, 2, 4);
  ctx.fillRect(1, 6, 2, 3);
  ctx.fillRect(29, 6, 2, 3);
  ctx.fillRect(1, 12, 2, 3);
  ctx.fillRect(29, 12, 2, 3);

  // Shell spiral detail
  ctx.fillStyle = '#3868a0';
  ctx.fillRect(8, 3, 16, 14);
  ctx.fillRect(6, 5, 20, 10);

  // Spiral center
  ctx.fillStyle = '#4878b0';
  ctx.fillRect(14, 6, 8, 8);
  ctx.fillStyle = '#3868a0';
  ctx.fillRect(16, 7, 4, 6);
  ctx.fillStyle = '#4878b0';
  ctx.fillRect(17, 9, 2, 2);

  // Shell highlight
  ctx.fillStyle = '#6898c8';
  ctx.fillRect(6, 2, 8, 3);
  ctx.fillRect(4, 4, 4, 4);

  // Body underneath
  ctx.fillStyle = '#5888b8';
  ctx.fillRect(6, 18, 20, 6);
  ctx.fillRect(8, 17, 16, 2);

  // More tentacles than omanyte
  ctx.fillStyle = '#5888b8';
  ctx.fillRect(5, 24, 3, 4);
  ctx.fillRect(9, 24, 3, 5);
  ctx.fillRect(13, 24, 3, 6);
  ctx.fillRect(17, 24, 3, 6);
  ctx.fillRect(21, 24, 3, 5);
  ctx.fillRect(25, 24, 3, 4);
  ctx.fillRect(7, 27, 2, 3);
  ctx.fillRect(23, 27, 2, 3);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(8, 18, 4, 4);
    ctx.fillRect(20, 18, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(8, 18, 2, 2);
    ctx.fillRect(20, 18, 2, 2);
    // Mouth/beak
    ctx.fillStyle = '#c0a060';
    ctx.fillRect(12, 21, 8, 3);
    ctx.fillStyle = '#a08848';
    ctx.fillRect(13, 22, 6, 2);
  } else {
    // Back: spiral detail
    ctx.fillStyle = '#3868a0';
    ctx.fillRect(10, 5, 2, 12);
    ctx.fillRect(10, 5, 14, 2);
    ctx.fillRect(22, 5, 2, 8);
    ctx.fillRect(12, 11, 10, 2);
    ctx.fillRect(12, 11, 2, 4);
  }
};
