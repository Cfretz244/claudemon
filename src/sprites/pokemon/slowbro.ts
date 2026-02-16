import { CustomSpriteDrawFn } from '../types';

export const slowbro: CustomSpriteDrawFn = (ctx, isBack) => {
  // Body - pink bipedal
  ctx.fillStyle = '#e898a8';
  ctx.fillRect(8, 12, 14, 12);
  ctx.fillRect(6, 14, 18, 8);

  // Head
  ctx.fillStyle = '#e898a8';
  ctx.fillRect(8, 4, 14, 10);
  ctx.fillRect(6, 6, 18, 6);

  // Muzzle / lighter belly
  ctx.fillStyle = '#f0c0c8';
  ctx.fillRect(10, 16, 10, 6);
  ctx.fillRect(12, 8, 6, 4);

  // Ears
  ctx.fillStyle = '#e898a8';
  ctx.fillRect(7, 2, 4, 4);
  ctx.fillRect(19, 2, 4, 4);

  // Arms
  ctx.fillStyle = '#e898a8';
  ctx.fillRect(4, 14, 4, 6);
  ctx.fillRect(22, 14, 4, 6);

  // Feet
  ctx.fillStyle = '#f0c0c8';
  ctx.fillRect(8, 24, 6, 4);
  ctx.fillRect(16, 24, 6, 4);

  // Tail stub + Shellder on tail
  ctx.fillStyle = '#e898a8';
  ctx.fillRect(22, 18, 4, 3);
  ctx.fillStyle = '#a088b0';
  ctx.fillRect(24, 14, 7, 10);
  ctx.fillRect(26, 12, 5, 14);
  // Shellder shell ridges
  ctx.fillStyle = '#8070a0';
  ctx.fillRect(26, 15, 4, 2);
  ctx.fillRect(26, 19, 4, 2);
  ctx.fillRect(26, 23, 4, 2);

  if (!isBack) {
    // Eyes - vacant/dazed
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 6, 3, 3);
    ctx.fillRect(17, 6, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 6, 2, 2);
    ctx.fillRect(17, 6, 2, 2);
    // Mouth - open dopey
    ctx.fillStyle = '#302020';
    ctx.fillRect(13, 10, 4, 2);
    ctx.fillStyle = '#d07080';
    ctx.fillRect(14, 11, 2, 1);
  } else {
    // Back shading
    ctx.fillStyle = '#d88898';
    ctx.fillRect(10, 8, 10, 8);
    // Shellder visible from back
    ctx.fillStyle = '#a088b0';
    ctx.fillRect(24, 14, 6, 10);
  }
};
