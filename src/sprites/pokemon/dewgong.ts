import { CustomSpriteDrawFn } from '../types';

export const dewgong: CustomSpriteDrawFn = (ctx, isBack) => {
  // Sleek body - larger seal
  ctx.fillStyle = '#e8e8f0';
  ctx.fillRect(4, 12, 24, 14);
  ctx.fillRect(2, 14, 28, 10);
  ctx.fillRect(6, 10, 20, 16);

  // Head
  ctx.fillStyle = '#e8e8f0';
  ctx.fillRect(6, 2, 18, 12);
  ctx.fillRect(4, 4, 22, 8);

  // Horn
  ctx.fillStyle = '#c0c0c0';
  ctx.fillRect(13, 0, 6, 4);
  ctx.fillRect(14, 0, 4, 2);

  // Muzzle
  ctx.fillStyle = '#d0d0d8';
  ctx.fillRect(8, 8, 14, 4);

  // Nose
  ctx.fillStyle = '#302020';
  ctx.fillRect(14, 8, 4, 2);

  // Flippers
  ctx.fillStyle = '#d0d0d8';
  ctx.fillRect(0, 16, 5, 6);
  ctx.fillRect(27, 16, 5, 6);

  // Elegant tail fin
  ctx.fillStyle = '#d0d0e0';
  ctx.fillRect(22, 24, 8, 4);
  ctx.fillRect(24, 22, 6, 8);
  ctx.fillRect(26, 20, 4, 4);
  ctx.fillRect(28, 26, 4, 4);

  // Belly
  ctx.fillStyle = '#d0d0d8';
  ctx.fillRect(8, 18, 14, 6);

  if (!isBack) {
    // Eyes - serene
    ctx.fillStyle = '#302020';
    ctx.fillRect(8, 5, 4, 3);
    ctx.fillRect(18, 5, 4, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(8, 5, 3, 2);
    ctx.fillRect(18, 5, 3, 2);
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(12, 10, 8, 1);
  } else {
    // Back shading
    ctx.fillStyle = '#d0d0d8';
    ctx.fillRect(8, 6, 16, 10);
    ctx.fillStyle = '#c0c0c8';
    ctx.fillRect(10, 8, 12, 6);
  }
};
