import { CustomSpriteDrawFn } from '../types';

export const mankey: CustomSpriteDrawFn = (ctx, isBack) => {
  // Mankey - round furry beige pig-monkey, angry eyes, small limbs

  // Round fuzzy body
  ctx.fillStyle = '#e8d8c0';
  ctx.fillRect(6, 10, 20, 14);
  ctx.fillRect(4, 12, 24, 10);
  ctx.fillRect(8, 8, 16, 4);

  // Fur tufts on top
  ctx.fillStyle = '#e8d8c0';
  ctx.fillRect(10, 4, 4, 5);
  ctx.fillRect(16, 5, 4, 4);
  ctx.fillRect(13, 3, 3, 3);

  // Ears - round
  ctx.fillStyle = '#e8d8c0';
  ctx.fillRect(4, 8, 4, 4);
  ctx.fillRect(24, 8, 4, 4);
  // Inner ears
  ctx.fillStyle = '#d0a888';
  ctx.fillRect(5, 9, 2, 2);
  ctx.fillRect(25, 9, 2, 2);

  // Pig snout
  ctx.fillStyle = '#d0a888';
  ctx.fillRect(12, 16, 8, 4);
  ctx.fillRect(13, 15, 6, 1);

  // Nostrils
  ctx.fillStyle = '#302020';
  ctx.fillRect(13, 17, 2, 2);
  ctx.fillRect(17, 17, 2, 2);

  // Small arms
  ctx.fillStyle = '#e8d8c0';
  ctx.fillRect(1, 14, 4, 6);
  ctx.fillRect(27, 14, 4, 6);
  // Hands
  ctx.fillStyle = '#d0a888';
  ctx.fillRect(1, 19, 3, 3);
  ctx.fillRect(28, 19, 3, 3);

  // Small legs/feet
  ctx.fillStyle = '#e8d8c0';
  ctx.fillRect(8, 24, 5, 4);
  ctx.fillRect(19, 24, 5, 4);
  ctx.fillStyle = '#d0a888';
  ctx.fillRect(8, 27, 5, 2);
  ctx.fillRect(19, 27, 5, 2);

  // Tail - long and thin
  ctx.fillStyle = '#d0a888';
  ctx.fillRect(26, 12, 2, 3);
  ctx.fillRect(28, 10, 2, 3);
  ctx.fillRect(29, 8, 2, 3);

  if (!isBack) {
    // Angry eyes - angled brows
    ctx.fillStyle = '#302020';
    ctx.fillRect(9, 11, 4, 3);
    ctx.fillRect(19, 11, 4, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 11, 2, 2);
    ctx.fillRect(20, 11, 2, 2);
    // Angry brows
    ctx.fillStyle = '#302020';
    ctx.fillRect(8, 10, 5, 1);
    ctx.fillRect(19, 10, 5, 1);
  } else {
    // Back - fur pattern
    ctx.fillStyle = '#d0b8a0';
    ctx.fillRect(10, 12, 12, 8);
  }
};
