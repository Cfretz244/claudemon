import { CustomSpriteDrawFn } from '../types';

export const mewtwo: CustomSpriteDrawFn = (ctx, isBack) => {
  // Tall humanoid body - purple/white
  ctx.fillStyle = '#d8d0e0';
  ctx.fillRect(11, 6, 10, 16);
  ctx.fillRect(9, 8, 14, 12);

  // Head - slightly bulbous
  ctx.fillStyle = '#d8d0e0';
  ctx.fillRect(10, 0, 12, 8);
  ctx.fillRect(8, 2, 16, 5);
  ctx.fillRect(12, 0, 8, 2);

  // Purple top of head and "horns"
  ctx.fillStyle = '#9878b8';
  ctx.fillRect(10, 0, 12, 3);
  ctx.fillRect(8, 1, 4, 3);
  ctx.fillRect(20, 1, 4, 3);

  // Tube connecting head to back of neck
  ctx.fillStyle = '#9878b8';
  ctx.fillRect(18, 4, 3, 2);
  ctx.fillRect(20, 5, 3, 3);
  ctx.fillRect(21, 7, 2, 3);
  ctx.fillRect(19, 9, 3, 2);

  // Purple markings on body
  ctx.fillStyle = '#9878b8';
  ctx.fillRect(9, 8, 3, 4);
  ctx.fillRect(20, 8, 3, 4);

  // Chest/belly area
  ctx.fillStyle = '#d8d0e0';
  ctx.fillRect(12, 10, 8, 8);

  // Purple midsection
  ctx.fillStyle = '#b098c8';
  ctx.fillRect(12, 16, 8, 4);

  // Arms - thin and long
  ctx.fillStyle = '#d8d0e0';
  ctx.fillRect(4, 8, 6, 4);
  ctx.fillRect(22, 8, 6, 4);
  ctx.fillRect(2, 10, 5, 4);
  ctx.fillRect(25, 10, 5, 4);
  // Hands - three fingers (ball-like)
  ctx.fillStyle = '#d8d0e0';
  ctx.fillRect(1, 13, 5, 4);
  ctx.fillRect(26, 13, 5, 4);
  // Finger details
  ctx.fillStyle = '#b098c8';
  ctx.fillRect(1, 15, 2, 2);
  ctx.fillRect(4, 15, 2, 2);
  ctx.fillRect(27, 15, 2, 2);
  ctx.fillRect(30, 15, 2, 2);

  // Legs - powerful thighs
  ctx.fillStyle = '#d8d0e0';
  ctx.fillRect(9, 20, 6, 6);
  ctx.fillRect(17, 20, 6, 6);
  // Feet
  ctx.fillStyle = '#b098c8';
  ctx.fillRect(8, 26, 7, 4);
  ctx.fillRect(17, 26, 7, 4);
  // Toes
  ctx.fillStyle = '#d8d0e0';
  ctx.fillRect(8, 28, 3, 2);
  ctx.fillRect(12, 28, 3, 2);
  ctx.fillRect(17, 28, 3, 2);
  ctx.fillRect(21, 28, 3, 2);

  // Long purple tail
  ctx.fillStyle = '#9878b8';
  ctx.fillRect(19, 18, 4, 3);
  ctx.fillRect(22, 16, 4, 3);
  ctx.fillRect(25, 14, 4, 3);
  ctx.fillRect(27, 12, 3, 4);
  ctx.fillRect(28, 10, 3, 3);
  // Tail tip - thicker
  ctx.fillStyle = '#b098c8';
  ctx.fillRect(29, 8, 3, 4);
  ctx.fillRect(28, 7, 4, 3);

  if (!isBack) {
    // Fierce piercing eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 3, 4, 3);
    ctx.fillRect(18, 3, 4, 3);
    ctx.fillStyle = '#9878b8';
    ctx.fillRect(10, 3, 3, 2);
    ctx.fillRect(18, 3, 3, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 3, 1, 1);
    ctx.fillRect(18, 3, 1, 1);
    // Stern mouth line
    ctx.fillStyle = '#b098c8';
    ctx.fillRect(13, 6, 6, 1);
  } else {
    // Back: tube more visible, tail curving away
    ctx.fillStyle = '#9878b8';
    // Tube on back of neck - prominent
    ctx.fillRect(13, 4, 6, 3);
    ctx.fillRect(12, 6, 8, 2);
    // Back musculature
    ctx.fillStyle = '#c0b8d0';
    ctx.fillRect(12, 8, 8, 4);
    // Tail curving from back
    ctx.fillStyle = '#9878b8';
    ctx.fillRect(13, 20, 6, 3);
    ctx.fillRect(11, 22, 4, 3);
    ctx.fillRect(9, 24, 4, 3);
    ctx.fillRect(7, 26, 4, 3);
    // Tail tip
    ctx.fillStyle = '#b098c8';
    ctx.fillRect(5, 27, 4, 3);
  }
};
