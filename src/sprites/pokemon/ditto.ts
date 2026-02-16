import { CustomSpriteDrawFn } from '../types';

export const ditto: CustomSpriteDrawFn = (ctx, isBack) => {
  // Ditto - pink amorphous blob, simple dot eyes and line mouth

  // Main blob body
  ctx.fillStyle = '#d088c0';
  ctx.fillRect(8, 12, 16, 12);
  ctx.fillRect(6, 14, 20, 8);
  ctx.fillRect(10, 10, 12, 2);
  ctx.fillRect(4, 16, 24, 4);
  ctx.fillRect(7, 22, 18, 4);
  ctx.fillRect(10, 24, 12, 4);

  // Slight color variation for depth
  ctx.fillStyle = '#c880b8';
  ctx.fillRect(10, 18, 12, 6);
  ctx.fillRect(8, 20, 16, 2);

  // Lighter top highlight
  ctx.fillStyle = '#d898c8';
  ctx.fillRect(10, 12, 8, 3);
  ctx.fillRect(12, 10, 4, 2);

  if (!isBack) {
    // Simple dot eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(11, 15, 2, 2);
    ctx.fillRect(19, 15, 2, 2);
    // Simple line mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(13, 19, 6, 1);
  } else {
    // Back - just a blob, slightly darker
    ctx.fillStyle = '#c078b0';
    ctx.fillRect(10, 14, 12, 8);
    ctx.fillRect(8, 16, 16, 4);
  }
};
