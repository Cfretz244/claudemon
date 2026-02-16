import { CustomSpriteDrawFn } from '../types';

export const shellder: CustomSpriteDrawFn = (ctx, isBack) => {
  // Outer shell - top half
  ctx.fillStyle = '#7868a0';
  ctx.fillRect(2, 2, 28, 12);
  ctx.fillRect(4, 0, 24, 4);
  ctx.fillRect(0, 6, 32, 6);

  // Outer shell - bottom half
  ctx.fillStyle = '#7868a0';
  ctx.fillRect(2, 18, 28, 12);
  ctx.fillRect(4, 28, 24, 4);
  ctx.fillRect(0, 20, 32, 6);

  // Shell ridges - top
  ctx.fillStyle = '#605088';
  ctx.fillRect(4, 4, 24, 2);
  ctx.fillRect(2, 8, 28, 2);

  // Shell ridges - bottom
  ctx.fillStyle = '#605088';
  ctx.fillRect(4, 26, 24, 2);
  ctx.fillRect(2, 22, 28, 2);

  // Shell gap / opening in middle
  ctx.fillStyle = '#302030';
  ctx.fillRect(4, 13, 24, 6);
  ctx.fillRect(2, 14, 28, 4);

  // Inner flesh visible in gap
  ctx.fillStyle = '#e05080';
  ctx.fillRect(8, 14, 16, 4);
  ctx.fillRect(6, 15, 20, 2);

  if (!isBack) {
    // Eyes peeking from gap
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 14, 4, 3);
    ctx.fillRect(18, 14, 4, 3);
    ctx.fillStyle = '#302020';
    ctx.fillRect(12, 15, 2, 2);
    ctx.fillRect(20, 15, 2, 2);
    // Tongue sticking out
    ctx.fillStyle = '#e05080';
    ctx.fillRect(14, 18, 4, 4);
    ctx.fillRect(13, 19, 6, 2);
    ctx.fillRect(15, 22, 2, 2);
  } else {
    // Back of shell - ridged pattern
    ctx.fillStyle = '#605088';
    ctx.fillRect(6, 3, 20, 8);
    ctx.fillRect(6, 21, 20, 8);
    ctx.fillStyle = '#7868a0';
    ctx.fillRect(8, 5, 16, 4);
    ctx.fillRect(8, 23, 16, 4);
  }
};
