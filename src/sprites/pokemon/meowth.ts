import { CustomSpriteDrawFn } from '../types';

export const meowth: CustomSpriteDrawFn = (ctx, isBack) => {
  // Meowth - cream cat body, gold coin on forehead, curly tail

  // Body
  ctx.fillStyle = '#f0e0b0';
  ctx.fillRect(10, 16, 14, 10);
  ctx.fillRect(8, 18, 18, 8);

  // Head
  ctx.fillStyle = '#f0e0b0';
  ctx.fillRect(6, 6, 20, 12);
  ctx.fillRect(8, 4, 16, 3);

  // Ears - pointed
  ctx.fillStyle = '#f0e0b0';
  ctx.fillRect(6, 1, 5, 5);
  ctx.fillRect(21, 1, 5, 5);
  // Inner ears
  ctx.fillStyle = '#e0a080';
  ctx.fillRect(7, 2, 3, 3);
  ctx.fillRect(22, 2, 3, 3);

  // Tail - curly
  ctx.fillStyle = '#d8b878';
  ctx.fillRect(24, 18, 3, 4);
  ctx.fillRect(26, 15, 3, 4);
  ctx.fillRect(24, 12, 3, 4);
  ctx.fillRect(26, 11, 3, 3);

  // Feet
  ctx.fillStyle = '#f0e0b0';
  ctx.fillRect(8, 26, 5, 3);
  ctx.fillRect(19, 26, 5, 3);
  // Foot pads
  ctx.fillStyle = '#e0a080';
  ctx.fillRect(9, 27, 3, 2);
  ctx.fillRect(20, 27, 3, 2);

  // Whiskers (hint)
  ctx.fillStyle = '#d8b878';
  ctx.fillRect(3, 12, 4, 1);
  ctx.fillRect(25, 12, 4, 1);
  ctx.fillRect(3, 14, 4, 1);
  ctx.fillRect(25, 14, 4, 1);

  if (!isBack) {
    // Gold coin on forehead
    ctx.fillStyle = '#d8b030';
    ctx.fillRect(13, 4, 6, 4);
    ctx.fillRect(14, 3, 4, 1);
    ctx.fillRect(14, 8, 4, 1);

    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(9, 9, 4, 4);
    ctx.fillRect(19, 9, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(9, 9, 2, 2);
    ctx.fillRect(19, 9, 2, 2);

    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(14, 14, 4, 1);
  } else {
    // Back markings
    ctx.fillStyle = '#d8b878';
    ctx.fillRect(12, 8, 8, 6);
  }
};
