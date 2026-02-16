import { CustomSpriteDrawFn } from '../types';

export const cloyster: CustomSpriteDrawFn = (ctx, isBack) => {
  // Outer spiky shell
  ctx.fillStyle = '#8088a0';
  ctx.fillRect(2, 6, 28, 20);
  ctx.fillRect(0, 10, 32, 12);
  ctx.fillRect(4, 4, 24, 24);

  // Shell spikes - top
  ctx.fillStyle = '#8088a0';
  ctx.fillRect(8, 0, 4, 6);
  ctx.fillRect(20, 0, 4, 6);
  ctx.fillRect(14, 0, 4, 4);

  // Shell spikes - sides
  ctx.fillRect(0, 8, 4, 4);
  ctx.fillRect(28, 8, 4, 4);
  ctx.fillRect(0, 18, 4, 4);
  ctx.fillRect(28, 18, 4, 4);

  // Shell spikes - bottom
  ctx.fillRect(8, 26, 4, 4);
  ctx.fillRect(20, 26, 4, 4);
  ctx.fillRect(14, 28, 4, 4);

  // Shell inner ring
  ctx.fillStyle = '#606878';
  ctx.fillRect(6, 8, 20, 16);
  ctx.fillRect(4, 10, 24, 12);

  // Dark opening
  ctx.fillStyle = '#303040';
  ctx.fillRect(8, 10, 16, 12);
  ctx.fillRect(6, 12, 20, 8);

  // Face inside shell
  ctx.fillStyle = '#303040';
  ctx.fillRect(10, 12, 12, 8);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 13, 3, 3);
    ctx.fillRect(18, 13, 3, 3);
    ctx.fillStyle = '#302020';
    ctx.fillRect(12, 14, 2, 2);
    ctx.fillRect(19, 14, 2, 2);
    // Smirking mouth
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(12, 18, 8, 2);
    ctx.fillStyle = '#303040';
    ctx.fillRect(14, 18, 4, 1);
    // Inner pearl/gem
    ctx.fillStyle = '#b0b8c8';
    ctx.fillRect(14, 11, 4, 2);
  } else {
    // Back of shell - ridge lines
    ctx.fillStyle = '#606878';
    ctx.fillRect(8, 8, 16, 16);
    ctx.fillStyle = '#8088a0';
    ctx.fillRect(10, 10, 12, 12);
    ctx.fillStyle = '#606878';
    ctx.fillRect(12, 12, 8, 8);
    ctx.fillRect(14, 14, 4, 4);
  }
};
