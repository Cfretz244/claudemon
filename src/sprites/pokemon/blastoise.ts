import { CustomSpriteDrawFn } from '../types';

export const blastoise: CustomSpriteDrawFn = (ctx, isBack) => {
  // Massive shell/body
  ctx.fillStyle = '#5088c0';
  ctx.fillRect(4, 10, 24, 16);
  ctx.fillRect(6, 8, 20, 4);

  // Head
  ctx.fillStyle = '#5088c0';
  ctx.fillRect(8, 2, 16, 10);
  ctx.fillRect(6, 4, 20, 6);

  // Cream belly
  ctx.fillStyle = '#f0d890';
  ctx.fillRect(8, 14, 16, 10);

  // Cannons on back
  ctx.fillStyle = '#808080';
  ctx.fillRect(3, 6, 4, 8);
  ctx.fillRect(25, 6, 4, 8);
  // Cannon openings
  ctx.fillStyle = '#404040';
  ctx.fillRect(3, 6, 4, 2);
  ctx.fillRect(25, 6, 4, 2);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 4, 3, 4);
    ctx.fillRect(19, 4, 3, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 4, 2, 2);
    ctx.fillRect(19, 4, 2, 2);
    // Mouth
    ctx.fillStyle = '#406888';
    ctx.fillRect(13, 9, 6, 1);
  } else {
    // Shell pattern
    ctx.fillStyle = '#c09040';
    ctx.fillRect(7, 10, 18, 14);
    ctx.fillStyle = '#d8a850';
    ctx.fillRect(8, 11, 16, 12);
    ctx.fillStyle = '#c09040';
    ctx.fillRect(15, 11, 2, 12);
    ctx.fillRect(8, 16, 16, 2);
    // Cannons from back
    ctx.fillStyle = '#808080';
    ctx.fillRect(2, 5, 5, 10);
    ctx.fillRect(25, 5, 5, 10);
  }

  // Thick legs
  ctx.fillStyle = '#406888';
  ctx.fillRect(6, 26, 7, 4);
  ctx.fillRect(19, 26, 7, 4);
};
