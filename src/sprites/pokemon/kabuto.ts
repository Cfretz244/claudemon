import { CustomSpriteDrawFn } from '../types';

export const kabuto: CustomSpriteDrawFn = (ctx, isBack) => {
  // Dome shell - main body
  ctx.fillStyle = '#a09060';
  ctx.fillRect(4, 6, 24, 16);
  ctx.fillRect(6, 4, 20, 2);
  ctx.fillRect(8, 2, 16, 4);
  ctx.fillRect(2, 10, 28, 10);

  // Shell highlight
  ctx.fillStyle = '#b8a878';
  ctx.fillRect(8, 4, 10, 4);
  ctx.fillRect(6, 6, 8, 4);

  // Shell ridge line
  ctx.fillStyle = '#887848';
  ctx.fillRect(14, 3, 4, 16);

  // Shell edge darkness
  ctx.fillStyle = '#887848';
  ctx.fillRect(2, 18, 28, 2);
  ctx.fillRect(4, 20, 24, 2);

  // Underside / body peeking out
  ctx.fillStyle = '#c0a870';
  ctx.fillRect(6, 22, 20, 4);
  ctx.fillRect(8, 20, 16, 3);

  // Small legs/feet
  ctx.fillStyle = '#a09060';
  ctx.fillRect(6, 26, 4, 4);
  ctx.fillRect(12, 26, 3, 4);
  ctx.fillRect(17, 26, 3, 4);
  ctx.fillRect(22, 26, 4, 4);

  if (!isBack) {
    // Two beady red eyes peeking from under shell
    ctx.fillStyle = '#c03030';
    ctx.fillRect(9, 20, 4, 3);
    ctx.fillRect(19, 20, 4, 3);
    // Eye shine
    ctx.fillStyle = '#e05050';
    ctx.fillRect(9, 20, 2, 2);
    ctx.fillRect(19, 20, 2, 2);
    // Eye pupil
    ctx.fillStyle = '#302020';
    ctx.fillRect(11, 21, 2, 2);
    ctx.fillRect(21, 21, 2, 2);
  } else {
    // Back: dome shell with ridges
    ctx.fillStyle = '#887848';
    ctx.fillRect(14, 3, 4, 18);
    ctx.fillRect(6, 10, 20, 2);
    // Shell texture lines
    ctx.fillStyle = '#b8a878';
    ctx.fillRect(6, 5, 8, 2);
    ctx.fillRect(18, 5, 8, 2);
  }
};
