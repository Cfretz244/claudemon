import { CustomSpriteDrawFn } from '../types';

export const weepinbell: CustomSpriteDrawFn = (ctx, isBack) => {
  // Weepinbell - yellow bell shape, green leaf on top, wide open mouth

  // Vine/hook at top
  ctx.fillStyle = '#58a830';
  ctx.fillRect(14, 0, 4, 4);
  ctx.fillRect(16, 0, 4, 2);

  // Green leaf on top
  ctx.fillStyle = '#58a830';
  ctx.fillRect(6, 3, 20, 5);
  ctx.fillRect(8, 2, 16, 3);
  // Leaf detail
  ctx.fillStyle = '#408020';
  ctx.fillRect(10, 4, 12, 2);

  // Yellow bell body
  ctx.fillStyle = '#d8b030';
  ctx.fillRect(6, 7, 20, 16);
  ctx.fillRect(4, 10, 24, 10);
  ctx.fillRect(8, 22, 16, 3);

  // Body gets narrower toward bottom
  ctx.fillStyle = '#c09828';
  ctx.fillRect(10, 22, 12, 3);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(8, 10, 4, 4);
    ctx.fillRect(20, 10, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(8, 10, 2, 2);
    ctx.fillRect(20, 10, 2, 2);
    // Wide open mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(9, 16, 14, 5);
    ctx.fillStyle = '#c03030';
    ctx.fillRect(10, 17, 12, 3);
    // Lip/edge
    ctx.fillStyle = '#e0c038';
    ctx.fillRect(8, 15, 16, 2);
  } else {
    // Back - leaf and bell shape
    ctx.fillStyle = '#c09828';
    ctx.fillRect(8, 8, 16, 12);
    ctx.fillStyle = '#408020';
    ctx.fillRect(8, 4, 16, 4);
  }

  // Bottom point
  ctx.fillStyle = '#d8b030';
  ctx.fillRect(12, 25, 8, 3);
  ctx.fillRect(14, 27, 4, 3);
};
