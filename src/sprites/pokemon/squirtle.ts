import { CustomSpriteDrawFn } from '../types';

export const squirtle: CustomSpriteDrawFn = (ctx, isBack) => {
  // Body - round blue
  ctx.fillStyle = '#68a8d8';
  ctx.fillRect(8, 10, 16, 14);
  ctx.fillRect(6, 12, 20, 10);

  // Head
  ctx.fillStyle = '#68a8d8';
  ctx.fillRect(9, 4, 14, 10);
  ctx.fillRect(7, 6, 18, 6);

  // Cream belly
  ctx.fillStyle = '#f0d890';
  ctx.fillRect(10, 14, 12, 8);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(11, 6, 3, 4);
    ctx.fillRect(18, 6, 3, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 6, 2, 2);
    ctx.fillRect(18, 6, 2, 2);
    // Mouth
    ctx.fillStyle = '#4878a8';
    ctx.fillRect(13, 11, 6, 1);
  } else {
    // Shell pattern
    ctx.fillStyle = '#c09040';
    ctx.fillRect(10, 11, 12, 10);
    ctx.fillStyle = '#d8a850';
    ctx.fillRect(11, 12, 10, 8);
    ctx.fillStyle = '#c09040';
    ctx.fillRect(15, 12, 2, 8);
    ctx.fillRect(11, 15, 10, 2);
  }

  // Arms
  ctx.fillStyle = '#68a8d8';
  ctx.fillRect(4, 14, 4, 4);
  ctx.fillRect(24, 14, 4, 4);

  // Legs
  ctx.fillStyle = '#4878a8';
  ctx.fillRect(9, 24, 5, 4);
  ctx.fillRect(18, 24, 5, 4);

  // Curly tail
  ctx.fillStyle = '#68a8d8';
  ctx.fillRect(23, 20, 4, 3);
  ctx.fillRect(25, 17, 3, 4);
  ctx.fillRect(23, 15, 3, 3);
};
