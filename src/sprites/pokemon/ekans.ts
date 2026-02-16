import { CustomSpriteDrawFn } from '../types';

export const ekans: CustomSpriteDrawFn = (ctx, isBack) => {
  // Coiled body - bottom coil
  ctx.fillStyle = '#a058a0';
  ctx.fillRect(6, 22, 20, 6);
  ctx.fillRect(4, 24, 24, 4);

  // Middle coil
  ctx.fillStyle = '#a058a0';
  ctx.fillRect(8, 16, 18, 6);
  ctx.fillRect(6, 18, 22, 3);

  // Upper body rising up
  ctx.fillStyle = '#a058a0';
  ctx.fillRect(18, 8, 6, 10);
  ctx.fillRect(16, 10, 4, 6);

  // Head
  ctx.fillStyle = '#a058a0';
  ctx.fillRect(15, 2, 10, 8);
  ctx.fillRect(17, 0, 6, 4);

  // Yellow band around neck
  ctx.fillStyle = '#d8b030';
  ctx.fillRect(17, 8, 8, 3);

  // Yellow belly stripe on coils
  ctx.fillStyle = '#d8b030';
  ctx.fillRect(10, 18, 12, 2);
  ctx.fillRect(8, 24, 16, 2);

  // Tail rattle
  ctx.fillStyle = '#d8b030';
  ctx.fillRect(2, 20, 4, 3);
  ctx.fillRect(0, 21, 3, 2);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(17, 3, 3, 3);
    ctx.fillRect(22, 3, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(17, 3, 2, 2);
    ctx.fillRect(22, 3, 2, 2);
    // Mouth/tongue
    ctx.fillStyle = '#302020';
    ctx.fillRect(18, 8, 4, 1);
    ctx.fillStyle = '#d04040';
    ctx.fillRect(15, 7, 3, 1);
    ctx.fillRect(14, 8, 2, 1);
  } else {
    // Back pattern - dark diamonds
    ctx.fillStyle = '#804080';
    ctx.fillRect(20, 10, 2, 4);
    ctx.fillRect(12, 18, 2, 2);
    ctx.fillRect(18, 18, 2, 2);
    ctx.fillRect(10, 24, 2, 2);
    ctx.fillRect(16, 24, 2, 2);
    ctx.fillRect(22, 24, 2, 2);
  }
};
