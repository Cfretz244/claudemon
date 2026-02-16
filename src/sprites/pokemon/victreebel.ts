import { CustomSpriteDrawFn } from '../types';

export const victreebel: CustomSpriteDrawFn = (ctx, isBack) => {
  // Victreebel - yellow pitcher plant with green leaf, gaping mouth

  // Vine at top
  ctx.fillStyle = '#406830';
  ctx.fillRect(14, 0, 4, 3);
  ctx.fillRect(16, 0, 4, 2);

  // Large green leaf / cap
  ctx.fillStyle = '#406830';
  ctx.fillRect(4, 2, 24, 6);
  ctx.fillRect(6, 1, 20, 4);
  // Leaf vein
  ctx.fillStyle = '#305020';
  ctx.fillRect(12, 3, 8, 2);

  // Yellow pitcher body
  ctx.fillStyle = '#d8b030';
  ctx.fillRect(4, 7, 24, 18);
  ctx.fillRect(2, 10, 28, 12);
  ctx.fillRect(6, 24, 20, 4);

  // Dark spots on body
  ctx.fillStyle = '#c09828';
  ctx.fillRect(8, 20, 4, 4);
  ctx.fillRect(20, 20, 4, 4);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(7, 9, 4, 4);
    ctx.fillRect(21, 9, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 9, 2, 2);
    ctx.fillRect(21, 9, 2, 2);
    // Wide gaping mouth
    ctx.fillStyle = '#802020';
    ctx.fillRect(8, 14, 16, 7);
    ctx.fillRect(6, 15, 20, 5);
    // Teeth on rim
    ctx.fillStyle = '#d8b030';
    ctx.fillRect(8, 14, 3, 2);
    ctx.fillRect(14, 14, 4, 2);
    ctx.fillRect(21, 14, 3, 2);
  } else {
    // Back view - leaf and body
    ctx.fillStyle = '#c09828';
    ctx.fillRect(6, 8, 20, 14);
    ctx.fillStyle = '#305020';
    ctx.fillRect(8, 3, 16, 5);
  }

  // Bottom narrowing
  ctx.fillStyle = '#d8b030';
  ctx.fillRect(10, 27, 12, 3);
  ctx.fillRect(13, 29, 6, 2);
};
