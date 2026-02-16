import { CustomSpriteDrawFn } from '../types';

export const omanyte: CustomSpriteDrawFn = (ctx, isBack) => {
  // Spiral shell - outer
  ctx.fillStyle = '#5888c0';
  ctx.fillRect(6, 2, 20, 18);
  ctx.fillRect(4, 4, 24, 14);
  ctx.fillRect(8, 1, 16, 2);

  // Shell spiral detail - darker inner
  ctx.fillStyle = '#4070a8';
  ctx.fillRect(10, 4, 14, 12);
  ctx.fillRect(8, 6, 16, 8);

  // Shell spiral center
  ctx.fillStyle = '#5888c0';
  ctx.fillRect(14, 7, 6, 6);
  ctx.fillStyle = '#4070a8';
  ctx.fillRect(16, 8, 3, 4);

  // Shell highlight
  ctx.fillStyle = '#78a8d8';
  ctx.fillRect(8, 3, 6, 3);
  ctx.fillRect(6, 5, 4, 4);

  // Body underneath shell
  ctx.fillStyle = '#6898c8';
  ctx.fillRect(8, 18, 16, 6);
  ctx.fillRect(10, 17, 12, 2);

  // Tentacles
  ctx.fillStyle = '#6898c8';
  ctx.fillRect(8, 24, 3, 4);
  ctx.fillRect(13, 24, 3, 5);
  ctx.fillRect(18, 24, 3, 5);
  ctx.fillRect(22, 24, 3, 4);
  ctx.fillRect(10, 26, 2, 4);
  ctx.fillRect(20, 26, 2, 4);

  if (!isBack) {
    // Big cute eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 18, 4, 4);
    ctx.fillRect(18, 18, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 18, 2, 2);
    ctx.fillRect(18, 18, 2, 2);
  } else {
    // Back: shell more prominent, spiral lines
    ctx.fillStyle = '#4070a8';
    ctx.fillRect(12, 6, 2, 10);
    ctx.fillRect(12, 6, 10, 2);
    ctx.fillRect(20, 6, 2, 6);
    ctx.fillRect(14, 10, 6, 2);
  }
};
