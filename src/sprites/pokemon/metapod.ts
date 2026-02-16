import { CustomSpriteDrawFn } from '../types';

export const metapod: CustomSpriteDrawFn = (ctx, isBack) => {
  // Metapod - green crescent cocoon shape

  // Main cocoon body
  ctx.fillStyle = '#78c850';
  ctx.fillRect(8, 6, 16, 22);
  ctx.fillRect(6, 8, 20, 18);
  ctx.fillRect(5, 10, 22, 14);

  // Darker green shell ridges/outline
  ctx.fillStyle = '#406830';
  ctx.fillRect(6, 6, 2, 2);
  ctx.fillRect(24, 6, 2, 2);
  ctx.fillRect(5, 8, 1, 4);
  ctx.fillRect(26, 8, 1, 4);
  ctx.fillRect(4, 12, 1, 8);
  ctx.fillRect(27, 12, 1, 8);
  ctx.fillRect(5, 24, 1, 2);
  ctx.fillRect(26, 24, 1, 2);
  ctx.fillRect(6, 26, 2, 2);
  ctx.fillRect(24, 26, 2, 2);

  // Shell segment lines
  ctx.fillStyle = '#406830';
  ctx.fillRect(7, 11, 18, 1);
  ctx.fillRect(6, 16, 20, 1);
  ctx.fillRect(7, 21, 18, 1);

  // Lighter highlight on shell
  ctx.fillStyle = '#90e068';
  ctx.fillRect(10, 7, 8, 3);
  ctx.fillRect(9, 12, 6, 3);
  ctx.fillRect(9, 17, 6, 3);

  if (!isBack) {
    // Sleepy half-closed eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 13, 4, 2);
    ctx.fillRect(18, 13, 4, 2);
    // Eyelid (half closed - darker green)
    ctx.fillStyle = '#406830';
    ctx.fillRect(10, 13, 4, 1);
    ctx.fillRect(18, 13, 4, 1);
    // Tiny white highlight
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 14, 1, 1);
    ctx.fillRect(18, 14, 1, 1);
  } else {
    // Back: plain shell, extra ridge detail
    ctx.fillStyle = '#406830';
    ctx.fillRect(12, 8, 8, 1);
    ctx.fillRect(11, 13, 10, 1);
    ctx.fillRect(12, 18, 8, 1);
    ctx.fillRect(13, 23, 6, 1);
  }

  // Bottom point of cocoon
  ctx.fillStyle = '#78c850';
  ctx.fillRect(10, 28, 12, 2);
  ctx.fillRect(12, 30, 8, 1);
  ctx.fillStyle = '#406830';
  ctx.fillRect(14, 30, 4, 1);
};
