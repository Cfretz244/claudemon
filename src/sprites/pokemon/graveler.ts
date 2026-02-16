import { CustomSpriteDrawFn } from '../types';

export const graveler: CustomSpriteDrawFn = (ctx, isBack) => {
  // Graveler - larger gray rock, 4 stubby arms, rough texture

  // Four stubby arms
  // Upper pair
  ctx.fillStyle = '#787878';
  ctx.fillRect(1, 8, 6, 5);
  ctx.fillRect(25, 8, 6, 5);
  // Lower pair
  ctx.fillRect(2, 18, 5, 5);
  ctx.fillRect(25, 18, 5, 5);

  // Main large rock body
  ctx.fillStyle = '#888888';
  ctx.fillRect(6, 4, 20, 20);
  ctx.fillRect(4, 6, 24, 16);
  ctx.fillRect(8, 2, 16, 4);

  // Rocky bumps / texture
  ctx.fillStyle = '#787878';
  ctx.fillRect(8, 4, 4, 3);
  ctx.fillRect(18, 3, 5, 3);
  ctx.fillRect(6, 14, 3, 4);
  ctx.fillRect(23, 12, 3, 4);
  ctx.fillRect(12, 20, 4, 3);
  ctx.fillRect(20, 18, 3, 3);

  // Lighter spots
  ctx.fillStyle = '#989898';
  ctx.fillRect(12, 5, 8, 3);
  ctx.fillRect(8, 10, 4, 3);

  // Darker cracks
  ctx.fillStyle = '#686868';
  ctx.fillRect(14, 10, 2, 6);
  ctx.fillRect(10, 16, 6, 2);

  if (!isBack) {
    // Eyes - small and angry
    ctx.fillStyle = '#302020';
    ctx.fillRect(9, 8, 4, 4);
    ctx.fillRect(19, 8, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(9, 8, 2, 2);
    ctx.fillRect(19, 8, 2, 2);
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(11, 14, 10, 2);
    ctx.fillStyle = '#686868';
    ctx.fillRect(12, 14, 8, 1);
  } else {
    // Back - rough rocky surface
    ctx.fillStyle = '#787878';
    ctx.fillRect(8, 6, 16, 14);
    ctx.fillStyle = '#686868';
    ctx.fillRect(12, 8, 3, 3);
    ctx.fillRect(18, 10, 3, 3);
    ctx.fillRect(14, 15, 4, 3);
  }

  // Stubby feet
  ctx.fillStyle = '#787878';
  ctx.fillRect(8, 24, 5, 4);
  ctx.fillRect(19, 24, 5, 4);
};
