import { CustomSpriteDrawFn } from '../types';

export const tentacruel: CustomSpriteDrawFn = (ctx, isBack) => {
  // Tentacruel - larger blue jellyfish, more tentacles, angry red gems

  // Many tentacles
  ctx.fillStyle = '#2858a0';
  ctx.fillRect(4, 22, 2, 8);
  ctx.fillRect(8, 24, 2, 7);
  ctx.fillRect(12, 22, 2, 9);
  ctx.fillRect(16, 23, 2, 8);
  ctx.fillRect(20, 22, 2, 9);
  ctx.fillRect(24, 24, 2, 7);
  ctx.fillRect(28, 22, 2, 8);
  // Tentacle tips
  ctx.fillStyle = '#1e4888';
  ctx.fillRect(4, 28, 2, 3);
  ctx.fillRect(12, 29, 2, 3);
  ctx.fillRect(20, 29, 2, 3);
  ctx.fillRect(28, 28, 2, 3);

  // Main body - large bell
  ctx.fillStyle = '#3868a8';
  ctx.fillRect(6, 4, 20, 18);
  ctx.fillRect(4, 6, 24, 14);
  ctx.fillRect(8, 2, 16, 4);

  // Body highlight
  ctx.fillStyle = '#4878b8';
  ctx.fillRect(10, 3, 12, 4);

  // Red gems - larger, angrier
  ctx.fillStyle = '#c03030';
  ctx.fillRect(8, 10, 5, 5);
  ctx.fillRect(19, 10, 5, 5);
  // Gem highlights
  ctx.fillStyle = '#e05050';
  ctx.fillRect(9, 11, 3, 3);
  ctx.fillRect(20, 11, 3, 3);

  // Central red gem
  ctx.fillStyle = '#c03030';
  ctx.fillRect(14, 16, 4, 4);
  ctx.fillStyle = '#e05050';
  ctx.fillRect(15, 17, 2, 2);

  if (!isBack) {
    // Angry eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(9, 5, 4, 4);
    ctx.fillRect(19, 5, 4, 4);
    ctx.fillStyle = '#c03030';
    ctx.fillRect(10, 6, 2, 2);
    ctx.fillRect(20, 6, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 6, 1, 1);
    ctx.fillRect(20, 6, 1, 1);
    // Frown
    ctx.fillStyle = '#302020';
    ctx.fillRect(13, 8, 6, 1);
  } else {
    // Back - dome shape
    ctx.fillStyle = '#2858a0';
    ctx.fillRect(8, 4, 16, 14);
    ctx.fillRect(10, 3, 12, 4);
  }
};
