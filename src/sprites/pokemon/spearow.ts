import { CustomSpriteDrawFn } from '../types';

export const spearow: CustomSpriteDrawFn = (ctx, isBack) => {
  // Body - small aggressive bird
  ctx.fillStyle = '#b06030';
  ctx.fillRect(10, 14, 12, 10);
  ctx.fillRect(8, 16, 16, 6);

  // Head
  ctx.fillStyle = '#b06030';
  ctx.fillRect(6, 6, 12, 10);
  ctx.fillRect(8, 4, 8, 4);

  // Cream/tan chest
  ctx.fillStyle = '#e8c898';
  ctx.fillRect(10, 16, 10, 6);

  // Short wings
  ctx.fillStyle = '#904828';
  ctx.fillRect(3, 14, 7, 6);
  ctx.fillRect(22, 14, 7, 6);
  // Wing detail
  ctx.fillStyle = '#b06030';
  ctx.fillRect(4, 15, 5, 4);
  ctx.fillRect(23, 15, 5, 4);

  // Red crest/patch on head
  ctx.fillStyle = '#d04040';
  ctx.fillRect(9, 3, 6, 3);

  if (!isBack) {
    // Eyes - angry
    ctx.fillStyle = '#302020';
    ctx.fillRect(7, 8, 3, 3);
    ctx.fillRect(14, 8, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 8, 2, 2);
    ctx.fillRect(14, 8, 2, 2);
    // Sharp beak
    ctx.fillStyle = '#d8a850';
    ctx.fillRect(4, 11, 4, 2);
    ctx.fillRect(2, 12, 3, 1);
  } else {
    // Back wing pattern
    ctx.fillStyle = '#904828';
    ctx.fillRect(6, 12, 20, 8);
    ctx.fillStyle = '#b06030';
    ctx.fillRect(8, 13, 16, 6);
  }

  // Feet - small talons
  ctx.fillStyle = '#d8a850';
  ctx.fillRect(10, 24, 3, 4);
  ctx.fillRect(19, 24, 3, 4);

  // Tail feathers
  ctx.fillStyle = '#904828';
  ctx.fillRect(19, 22, 3, 4);
  ctx.fillRect(21, 21, 2, 4);
};
