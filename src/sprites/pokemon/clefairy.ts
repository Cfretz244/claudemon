import { CustomSpriteDrawFn } from '../types';

export const clefairy: CustomSpriteDrawFn = (ctx, isBack) => {
  // Clefairy - pink round body, small fairy wings, curled tail, cute

  // Curled tail
  ctx.fillStyle = '#c08090';
  ctx.fillRect(24, 16, 4, 3);
  ctx.fillRect(26, 14, 3, 3);
  ctx.fillRect(25, 12, 2, 3);

  // Body - round
  ctx.fillStyle = '#f0a0b0';
  ctx.fillRect(9, 14, 16, 12);
  ctx.fillRect(7, 16, 20, 8);
  ctx.fillRect(11, 13, 12, 2);

  // Head
  ctx.fillStyle = '#f0a0b0';
  ctx.fillRect(8, 6, 16, 10);
  ctx.fillRect(6, 8, 20, 6);

  // Ears - pointed with brown tips
  ctx.fillStyle = '#f0a0b0';
  ctx.fillRect(6, 2, 4, 6);
  ctx.fillRect(22, 2, 4, 6);
  // Dark ear tips
  ctx.fillStyle = '#906060';
  ctx.fillRect(6, 2, 4, 2);
  ctx.fillRect(22, 2, 4, 2);

  // Small fairy wings on back
  ctx.fillStyle = '#c08090';
  ctx.fillRect(4, 14, 4, 4);
  ctx.fillRect(3, 15, 2, 2);
  ctx.fillRect(24, 14, 4, 4);
  ctx.fillRect(27, 15, 2, 2);

  if (!isBack) {
    // Eyes - big and cute
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 8, 4, 4);
    ctx.fillRect(18, 8, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 8, 2, 2);
    ctx.fillRect(18, 8, 2, 2);
    // Mouth - small smile
    ctx.fillStyle = '#302020';
    ctx.fillRect(14, 13, 4, 1);
    // Blush
    ctx.fillStyle = '#e07080';
    ctx.fillRect(7, 11, 3, 2);
    ctx.fillRect(22, 11, 3, 2);
  } else {
    // Back: wings visible, back of head
    ctx.fillStyle = '#c08090';
    ctx.fillRect(12, 8, 8, 4);
  }

  // Small feet
  ctx.fillStyle = '#c08090';
  ctx.fillRect(10, 26, 4, 3);
  ctx.fillRect(18, 26, 4, 3);

  // Arms/hands
  ctx.fillStyle = '#f0a0b0';
  ctx.fillRect(5, 18, 3, 4);
  ctx.fillRect(24, 18, 3, 4);
};
