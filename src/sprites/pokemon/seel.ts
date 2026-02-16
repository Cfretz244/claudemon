import { CustomSpriteDrawFn } from '../types';

export const seel: CustomSpriteDrawFn = (ctx, isBack) => {
  // Body - white seal
  ctx.fillStyle = '#e8e8f0';
  ctx.fillRect(4, 14, 24, 12);
  ctx.fillRect(6, 12, 20, 14);
  ctx.fillRect(2, 18, 28, 6);

  // Head
  ctx.fillStyle = '#e8e8f0';
  ctx.fillRect(8, 4, 16, 12);
  ctx.fillRect(6, 6, 20, 8);

  // Horn on head
  ctx.fillStyle = '#c0c0c0';
  ctx.fillRect(14, 0, 4, 5);
  ctx.fillRect(15, 0, 2, 2);

  // Muzzle
  ctx.fillStyle = '#d0d0d8';
  ctx.fillRect(10, 10, 12, 4);

  // Nose
  ctx.fillStyle = '#302020';
  ctx.fillRect(14, 10, 4, 2);

  // Flippers
  ctx.fillStyle = '#d0d0d8';
  ctx.fillRect(0, 20, 5, 4);
  ctx.fillRect(27, 20, 5, 4);
  ctx.fillRect(0, 22, 4, 3);
  ctx.fillRect(28, 22, 4, 3);

  // Tail
  ctx.fillStyle = '#d0d0d8';
  ctx.fillRect(24, 24, 6, 3);
  ctx.fillRect(26, 22, 4, 6);
  ctx.fillRect(28, 26, 3, 3);

  // Belly
  ctx.fillStyle = '#d0d0d8';
  ctx.fillRect(10, 20, 12, 5);

  if (!isBack) {
    // Eyes - happy
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 6, 3, 3);
    ctx.fillRect(19, 6, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 6, 2, 2);
    ctx.fillRect(19, 6, 2, 2);
    // Mouth - smile
    ctx.fillStyle = '#302020';
    ctx.fillRect(13, 12, 6, 1);
    ctx.fillStyle = '#d07080';
    ctx.fillRect(14, 13, 4, 1);
  } else {
    // Back shading
    ctx.fillStyle = '#d0d0d8';
    ctx.fillRect(10, 8, 12, 8);
    ctx.fillStyle = '#c0c0c8';
    ctx.fillRect(12, 10, 8, 4);
  }
};
