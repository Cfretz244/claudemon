import { CustomSpriteDrawFn } from '../types';

export const tentacool: CustomSpriteDrawFn = (ctx, isBack) => {
  // Tentacool - blue jellyfish, two red gem dots, thin tentacles

  // Tentacles hanging down
  ctx.fillStyle = '#3068a0';
  ctx.fillRect(8, 20, 2, 10);
  ctx.fillRect(14, 22, 2, 8);
  ctx.fillRect(22, 20, 2, 10);
  // Thinner tips
  ctx.fillStyle = '#2858a0';
  ctx.fillRect(8, 28, 2, 3);
  ctx.fillRect(14, 28, 2, 3);
  ctx.fillRect(22, 28, 2, 3);

  // Main body - jellyfish bell
  ctx.fillStyle = '#4080c0';
  ctx.fillRect(8, 4, 16, 16);
  ctx.fillRect(6, 6, 20, 12);
  ctx.fillRect(10, 2, 12, 4);

  // Body highlight
  ctx.fillStyle = '#58a0d8';
  ctx.fillRect(10, 4, 8, 4);

  // Red gem dots
  ctx.fillStyle = '#c03030';
  ctx.fillRect(10, 10, 4, 4);
  ctx.fillRect(18, 10, 4, 4);
  // Gem highlight
  ctx.fillStyle = '#e06060';
  ctx.fillRect(11, 11, 2, 2);
  ctx.fillRect(19, 11, 2, 2);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 6, 3, 3);
    ctx.fillRect(19, 6, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 6, 2, 2);
    ctx.fillRect(19, 6, 2, 2);
  } else {
    // Back - smooth dome
    ctx.fillStyle = '#3068a0';
    ctx.fillRect(10, 5, 12, 10);
    ctx.fillRect(8, 7, 16, 6);
  }

  // Extra thin tentacles on sides
  ctx.fillStyle = '#3068a0';
  ctx.fillRect(6, 18, 2, 8);
  ctx.fillRect(24, 18, 2, 8);
};
