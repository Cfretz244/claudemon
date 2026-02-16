import { CustomSpriteDrawFn } from '../types';

export const chansey: CustomSpriteDrawFn = (ctx, isBack) => {
  // Chansey - pink round body, egg in belly pouch, tiny arms, happy

  // Main body - very round
  ctx.fillStyle = '#f0a0b0';
  ctx.fillRect(6, 8, 20, 16);
  ctx.fillRect(4, 10, 24, 12);
  ctx.fillRect(8, 6, 16, 20);
  ctx.fillRect(10, 5, 12, 2);

  // Head area
  ctx.fillStyle = '#f0a0b0';
  ctx.fillRect(8, 2, 16, 8);
  ctx.fillRect(10, 1, 12, 2);

  // Hair tufts
  ctx.fillStyle = '#e090a0';
  ctx.fillRect(10, 0, 4, 3);
  ctx.fillRect(18, 0, 4, 3);

  // Belly pouch
  ctx.fillStyle = '#f8c8d0';
  ctx.fillRect(10, 14, 12, 8);
  ctx.fillRect(8, 16, 16, 4);

  // Egg in pouch
  ctx.fillStyle = '#f0f0e0';
  ctx.fillRect(12, 16, 8, 6);
  ctx.fillRect(13, 15, 6, 7);
  // Egg highlight
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(14, 16, 2, 2);

  // Tiny arms
  ctx.fillStyle = '#f0a0b0';
  ctx.fillRect(2, 12, 4, 3);
  ctx.fillRect(26, 12, 4, 3);

  // Feet
  ctx.fillStyle = '#e090a0';
  ctx.fillRect(9, 24, 5, 4);
  ctx.fillRect(18, 24, 5, 4);

  // Tail nub
  ctx.fillStyle = '#f0a0b0';
  ctx.fillRect(26, 18, 3, 3);

  if (!isBack) {
    // Eyes - happy
    ctx.fillStyle = '#302020';
    ctx.fillRect(11, 6, 3, 3);
    ctx.fillRect(18, 6, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 6, 2, 2);
    ctx.fillRect(18, 6, 2, 2);
    // Happy mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(13, 10, 6, 1);
    ctx.fillRect(14, 11, 4, 1);
  } else {
    // Back shading
    ctx.fillStyle = '#e090a0';
    ctx.fillRect(10, 6, 12, 10);
    ctx.fillRect(12, 4, 8, 2);
  }
};
