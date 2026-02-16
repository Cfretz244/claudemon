import { CustomSpriteDrawFn } from '../types';

export const golduck: CustomSpriteDrawFn = (ctx, isBack) => {
  // Golduck - blue duck, red gem on forehead, webbed hands, sleeker

  // Body
  ctx.fillStyle = '#4878b8';
  ctx.fillRect(10, 16, 14, 10);
  ctx.fillRect(8, 18, 18, 8);

  // Head - sleeker, more angular
  ctx.fillStyle = '#4878b8';
  ctx.fillRect(7, 4, 18, 12);
  ctx.fillRect(9, 2, 14, 3);

  // Beak
  ctx.fillStyle = '#d0a028';
  ctx.fillRect(10, 12, 12, 3);
  ctx.fillRect(12, 11, 8, 1);

  // Webbed hands
  ctx.fillStyle = '#4878b8';
  ctx.fillRect(2, 16, 6, 5);
  ctx.fillRect(24, 16, 6, 5);
  // Webbing
  ctx.fillStyle = '#3868a8';
  ctx.fillRect(2, 18, 2, 3);
  ctx.fillRect(28, 18, 2, 3);

  // Arms
  ctx.fillStyle = '#4878b8';
  ctx.fillRect(5, 14, 4, 6);
  ctx.fillRect(23, 14, 4, 6);

  // Feet - webbed
  ctx.fillStyle = '#4878b8';
  ctx.fillRect(8, 26, 6, 4);
  ctx.fillRect(19, 26, 6, 4);
  ctx.fillStyle = '#3868a8';
  ctx.fillRect(8, 28, 2, 2);
  ctx.fillRect(23, 28, 2, 2);

  // Tail
  ctx.fillStyle = '#4878b8';
  ctx.fillRect(24, 22, 4, 3);
  ctx.fillRect(27, 20, 3, 3);

  if (!isBack) {
    // Red gem on forehead
    ctx.fillStyle = '#c03030';
    ctx.fillRect(13, 3, 6, 3);
    ctx.fillRect(14, 2, 4, 1);

    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 7, 4, 3);
    ctx.fillRect(18, 7, 4, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 7, 2, 2);
    ctx.fillRect(18, 7, 2, 2);
  } else {
    // Back - blue head crest
    ctx.fillStyle = '#3868a8';
    ctx.fillRect(10, 4, 12, 6);
    ctx.fillRect(12, 18, 8, 4);
  }
};
