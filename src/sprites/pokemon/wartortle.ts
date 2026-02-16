import { CustomSpriteDrawFn } from '../types';

export const wartortle: CustomSpriteDrawFn = (ctx, isBack) => {
  // Body
  ctx.fillStyle = '#5088c0';
  ctx.fillRect(7, 10, 18, 14);
  ctx.fillRect(5, 12, 22, 10);

  // Head
  ctx.fillStyle = '#5088c0';
  ctx.fillRect(8, 3, 16, 10);
  ctx.fillRect(6, 5, 20, 6);

  // Fluffy ear tufts
  ctx.fillStyle = '#d0e8f8';
  ctx.fillRect(5, 2, 5, 5);
  ctx.fillRect(22, 2, 5, 5);

  // Cream belly
  ctx.fillStyle = '#f0d890';
  ctx.fillRect(9, 14, 14, 8);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 5, 3, 4);
    ctx.fillRect(19, 5, 3, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 5, 2, 2);
    ctx.fillRect(19, 5, 2, 2);
    // Mouth
    ctx.fillStyle = '#406888';
    ctx.fillRect(13, 10, 6, 1);
  } else {
    // Shell
    ctx.fillStyle = '#c09040';
    ctx.fillRect(9, 11, 14, 10);
    ctx.fillStyle = '#d8a850';
    ctx.fillRect(10, 12, 12, 8);
    ctx.fillStyle = '#c09040';
    ctx.fillRect(15, 12, 2, 8);
    ctx.fillRect(10, 15, 12, 2);
  }

  // Arms
  ctx.fillStyle = '#5088c0';
  ctx.fillRect(3, 14, 4, 4);
  ctx.fillRect(25, 14, 4, 4);

  // Legs
  ctx.fillStyle = '#406888';
  ctx.fillRect(8, 24, 6, 4);
  ctx.fillRect(18, 24, 6, 4);

  // Fluffy tail
  ctx.fillStyle = '#d0e8f8';
  ctx.fillRect(23, 18, 5, 4);
  ctx.fillRect(25, 15, 4, 5);
  ctx.fillRect(27, 13, 3, 4);
};
