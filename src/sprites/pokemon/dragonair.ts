import { CustomSpriteDrawFn } from '../types';

export const dragonair: CustomSpriteDrawFn = (ctx, isBack) => {
  // Head
  ctx.fillStyle = '#4878b8';
  ctx.fillRect(11, 1, 10, 8);
  ctx.fillRect(9, 3, 14, 5);

  // Wing-like ear fins
  ctx.fillStyle = '#d0e0f0';
  ctx.fillRect(6, 0, 5, 5);
  ctx.fillRect(4, 1, 3, 3);
  ctx.fillRect(21, 0, 5, 5);
  ctx.fillRect(25, 1, 3, 3);
  // Fin highlights
  ctx.fillStyle = '#e0ecf8';
  ctx.fillRect(7, 1, 3, 3);
  ctx.fillRect(22, 1, 3, 3);

  // Horn on head
  ctx.fillStyle = '#d0e0f0';
  ctx.fillRect(14, 0, 4, 2);

  // Neck (slender)
  ctx.fillStyle = '#4878b8';
  ctx.fillRect(13, 8, 6, 4);

  // Crystal orb on neck
  ctx.fillStyle = '#6090c0';
  ctx.fillRect(14, 10, 4, 4);
  ctx.fillStyle = '#88b0d8';
  ctx.fillRect(14, 10, 2, 2);

  // Upper body curve
  ctx.fillStyle = '#4878b8';
  ctx.fillRect(12, 13, 8, 4);
  ctx.fillRect(18, 14, 6, 4);
  ctx.fillRect(22, 15, 4, 3);

  // Body curves elegantly
  ctx.fillRect(18, 17, 8, 4);
  ctx.fillRect(14, 19, 8, 4);
  ctx.fillRect(8, 20, 8, 4);

  // Crystal orb on body
  ctx.fillStyle = '#6090c0';
  ctx.fillRect(22, 16, 4, 4);
  ctx.fillStyle = '#88b0d8';
  ctx.fillRect(22, 16, 2, 2);

  // Lower body curve
  ctx.fillStyle = '#4878b8';
  ctx.fillRect(6, 23, 8, 3);
  ctx.fillRect(10, 25, 8, 3);

  // Tail
  ctx.fillRect(16, 27, 6, 3);
  ctx.fillRect(20, 26, 4, 3);

  // Crystal orb on tail
  ctx.fillStyle = '#6090c0';
  ctx.fillRect(10, 25, 4, 4);
  ctx.fillStyle = '#88b0d8';
  ctx.fillRect(10, 25, 2, 2);

  // Tail tip
  ctx.fillStyle = '#d0e0f0';
  ctx.fillRect(22, 26, 4, 3);
  ctx.fillRect(24, 25, 3, 2);

  // White belly detail
  ctx.fillStyle = '#a0c0e0';
  ctx.fillRect(13, 9, 6, 1);
  ctx.fillRect(14, 14, 4, 2);
  ctx.fillRect(18, 18, 4, 2);
  ctx.fillRect(10, 21, 4, 2);

  if (!isBack) {
    // Elegant eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(11, 3, 3, 3);
    ctx.fillRect(18, 3, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 3, 2, 2);
    ctx.fillRect(18, 3, 2, 2);
    // Small mouth
    ctx.fillStyle = '#3868a0';
    ctx.fillRect(14, 6, 4, 1);
  } else {
    // Back: elegant curves with orb highlights
    ctx.fillStyle = '#3868a0';
    ctx.fillRect(12, 2, 8, 4);
    // Ear fins from back
    ctx.fillStyle = '#d0e0f0';
    ctx.fillRect(5, 0, 5, 5);
    ctx.fillRect(22, 0, 5, 5);
    // Crystal glow
    ctx.fillStyle = '#88b0d8';
    ctx.fillRect(14, 10, 4, 4);
    ctx.fillRect(22, 16, 4, 4);
    ctx.fillRect(10, 25, 4, 4);
  }
};
