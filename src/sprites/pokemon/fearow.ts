import { CustomSpriteDrawFn } from '../types';

export const fearow: CustomSpriteDrawFn = (ctx, isBack) => {
  // Long thin neck
  ctx.fillStyle = '#a07040';
  ctx.fillRect(12, 10, 6, 10);

  // Body - vulture-like
  ctx.fillStyle = '#a07040';
  ctx.fillRect(6, 18, 20, 8);
  ctx.fillRect(8, 16, 16, 4);

  // Head - small with large beak
  ctx.fillStyle = '#a07040';
  ctx.fillRect(8, 2, 10, 8);
  ctx.fillRect(10, 0, 6, 4);

  // Red crest
  ctx.fillStyle = '#d04040';
  ctx.fillRect(11, 0, 5, 3);

  // Cream belly
  ctx.fillStyle = '#e8d0a0';
  ctx.fillRect(8, 20, 16, 4);

  // Large pointed beak
  ctx.fillStyle = '#d8a850';
  ctx.fillRect(3, 5, 6, 3);
  ctx.fillRect(1, 6, 3, 2);
  ctx.fillRect(0, 7, 2, 1);

  // Wings - large spread
  ctx.fillStyle = '#885830';
  ctx.fillRect(0, 16, 8, 8);
  ctx.fillRect(24, 16, 8, 8);
  // Wing detail
  ctx.fillStyle = '#a07040';
  ctx.fillRect(1, 17, 6, 6);
  ctx.fillRect(25, 17, 6, 6);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(9, 4, 3, 3);
    ctx.fillRect(15, 4, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(9, 4, 2, 2);
    ctx.fillRect(15, 4, 2, 2);
  } else {
    // Back view - wings prominent
    ctx.fillStyle = '#885830';
    ctx.fillRect(0, 14, 10, 10);
    ctx.fillRect(22, 14, 10, 10);
    ctx.fillStyle = '#a07040';
    ctx.fillRect(2, 15, 7, 8);
    ctx.fillRect(23, 15, 7, 8);
    // Neck stripe
    ctx.fillStyle = '#885830';
    ctx.fillRect(13, 10, 4, 8);
  }

  // Feet - talons
  ctx.fillStyle = '#d8a850';
  ctx.fillRect(8, 26, 4, 4);
  ctx.fillRect(20, 26, 4, 4);

  // Long tail feathers
  ctx.fillStyle = '#885830';
  ctx.fillRect(13, 24, 2, 6);
  ctx.fillRect(17, 24, 2, 6);
  ctx.fillRect(15, 26, 2, 4);
};
