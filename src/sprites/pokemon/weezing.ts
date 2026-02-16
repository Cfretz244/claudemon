import { CustomSpriteDrawFn } from '../types';

export const weezing: CustomSpriteDrawFn = (ctx, isBack) => {
  // Weezing - two connected purple balls, one larger, skull markings

  // Larger body (right side)
  ctx.fillStyle = '#705890';
  ctx.fillRect(12, 8, 16, 16);
  ctx.fillRect(10, 10, 20, 12);
  ctx.fillRect(14, 6, 12, 2);
  ctx.fillRect(14, 24, 12, 2);

  // Smaller body (left/above)
  ctx.fillStyle = '#705890';
  ctx.fillRect(1, 2, 12, 12);
  ctx.fillRect(3, 0, 8, 14);
  ctx.fillRect(0, 4, 14, 8);

  // Connecting tube
  ctx.fillStyle = '#605080';
  ctx.fillRect(10, 10, 5, 4);

  // Crater bumps on large body
  ctx.fillStyle = '#605080';
  ctx.fillRect(24, 14, 3, 3);
  ctx.fillRect(14, 20, 3, 3);
  ctx.fillRect(22, 20, 3, 3);

  // Crater bumps on small body
  ctx.fillStyle = '#605080';
  ctx.fillRect(2, 4, 2, 2);
  ctx.fillRect(10, 8, 2, 2);

  // Skull marking on large body
  ctx.fillStyle = '#d8d0c0';
  ctx.fillRect(17, 16, 5, 4);
  ctx.fillRect(16, 17, 7, 2);
  // Crossbones
  ctx.fillRect(15, 21, 2, 1);
  ctx.fillRect(17, 22, 4, 1);
  ctx.fillRect(21, 21, 2, 1);

  // Skull marking on small body
  ctx.fillStyle = '#d8d0c0';
  ctx.fillRect(4, 6, 4, 3);
  ctx.fillRect(3, 7, 6, 1);

  // Smoke wisps
  ctx.fillStyle = '#9880a8';
  ctx.fillRect(5, 0, 3, 2);
  ctx.fillRect(16, 4, 3, 3);
  ctx.fillRect(26, 8, 3, 3);

  if (!isBack) {
    // Large body eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(15, 11, 3, 3);
    ctx.fillRect(22, 11, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(15, 11, 2, 2);
    ctx.fillRect(22, 11, 2, 2);
    // Small body eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(4, 4, 2, 2);
    ctx.fillRect(8, 4, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(4, 4, 1, 1);
    ctx.fillRect(8, 4, 1, 1);
    // Skull eye holes
    ctx.fillStyle = '#705890';
    ctx.fillRect(17, 17, 2, 1);
    ctx.fillRect(20, 17, 2, 1);
  } else {
    // Back shading
    ctx.fillStyle = '#605080';
    ctx.fillRect(15, 10, 10, 8);
    ctx.fillRect(4, 4, 6, 6);
  }
};
