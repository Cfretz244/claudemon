import { CustomSpriteDrawFn } from '../types';

export const persian: CustomSpriteDrawFn = (ctx, isBack) => {
  // Persian - sleek tan cat, red gem on forehead, elegant long body

  // Long elegant body
  ctx.fillStyle = '#e0c888';
  ctx.fillRect(6, 16, 20, 8);
  ctx.fillRect(4, 18, 24, 6);

  // Head - sleek
  ctx.fillStyle = '#e0c888';
  ctx.fillRect(4, 6, 16, 12);
  ctx.fillRect(6, 4, 12, 3);

  // Ears - pointed, elegant
  ctx.fillStyle = '#e0c888';
  ctx.fillRect(4, 1, 4, 5);
  ctx.fillRect(14, 1, 4, 5);
  // Inner ears
  ctx.fillStyle = '#d0a868';
  ctx.fillRect(5, 2, 2, 3);
  ctx.fillRect(15, 2, 2, 3);

  // Long tail
  ctx.fillStyle = '#d0a868';
  ctx.fillRect(25, 14, 3, 3);
  ctx.fillRect(27, 11, 3, 4);
  ctx.fillRect(26, 8, 3, 4);
  ctx.fillRect(28, 8, 2, 2);

  // Front legs - slender
  ctx.fillStyle = '#e0c888';
  ctx.fillRect(6, 24, 4, 5);
  ctx.fillRect(14, 24, 4, 5);

  // Hind legs
  ctx.fillStyle = '#e0c888';
  ctx.fillRect(20, 23, 5, 6);

  // Paws
  ctx.fillStyle = '#d0a868';
  ctx.fillRect(6, 28, 4, 2);
  ctx.fillRect(14, 28, 4, 2);
  ctx.fillRect(20, 28, 5, 2);

  if (!isBack) {
    // Red gem on forehead
    ctx.fillStyle = '#c03030';
    ctx.fillRect(10, 5, 4, 3);
    ctx.fillRect(11, 4, 2, 1);

    // Elegant eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(6, 9, 4, 3);
    ctx.fillRect(14, 9, 4, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6, 9, 2, 2);
    ctx.fillRect(14, 9, 2, 2);

    // Whiskers
    ctx.fillStyle = '#d0a868';
    ctx.fillRect(1, 11, 4, 1);
    ctx.fillRect(1, 13, 3, 1);
    ctx.fillRect(19, 11, 4, 1);
    ctx.fillRect(20, 13, 3, 1);

    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 14, 4, 1);
  } else {
    // Back - sleek fur pattern
    ctx.fillStyle = '#d0a868';
    ctx.fillRect(10, 8, 8, 6);
    ctx.fillRect(8, 18, 14, 4);
  }
};
