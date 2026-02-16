import { CustomSpriteDrawFn } from '../types';

export const clefable: CustomSpriteDrawFn = (ctx, isBack) => {
  // Clefable - larger pink fairy, wider wings, star-like ear tips, elegant

  // Curled tail
  ctx.fillStyle = '#b07888';
  ctx.fillRect(25, 14, 4, 3);
  ctx.fillRect(27, 12, 3, 3);
  ctx.fillRect(26, 10, 2, 3);

  // Body - round and larger
  ctx.fillStyle = '#e898a8';
  ctx.fillRect(8, 14, 18, 12);
  ctx.fillRect(6, 16, 22, 8);
  ctx.fillRect(10, 13, 14, 2);

  // Head
  ctx.fillStyle = '#e898a8';
  ctx.fillRect(7, 5, 18, 10);
  ctx.fillRect(5, 7, 22, 6);

  // Star-tipped ears
  ctx.fillStyle = '#e898a8';
  ctx.fillRect(5, 1, 5, 6);
  ctx.fillRect(22, 1, 5, 6);
  // Star tips
  ctx.fillStyle = '#906060';
  ctx.fillRect(4, 0, 3, 2);
  ctx.fillRect(7, 0, 2, 1);
  ctx.fillRect(22, 0, 2, 1);
  ctx.fillRect(25, 0, 3, 2);

  // Wider fairy wings
  ctx.fillStyle = '#b07888';
  ctx.fillRect(2, 12, 5, 6);
  ctx.fillRect(1, 14, 3, 3);
  ctx.fillRect(25, 12, 5, 6);
  ctx.fillRect(28, 14, 3, 3);

  if (!isBack) {
    // Eyes - big and elegant
    ctx.fillStyle = '#302020';
    ctx.fillRect(9, 7, 5, 4);
    ctx.fillRect(18, 7, 5, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(9, 7, 3, 2);
    ctx.fillRect(18, 7, 3, 2);
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(13, 12, 6, 1);
    // Blush
    ctx.fillStyle = '#d07080';
    ctx.fillRect(6, 10, 3, 2);
    ctx.fillRect(23, 10, 3, 2);
  } else {
    // Back: wings visible
    ctx.fillStyle = '#b07888';
    ctx.fillRect(11, 7, 10, 4);
  }

  // Elegant feet
  ctx.fillStyle = '#b07888';
  ctx.fillRect(9, 26, 5, 3);
  ctx.fillRect(18, 26, 5, 3);

  // Arms
  ctx.fillStyle = '#e898a8';
  ctx.fillRect(4, 17, 3, 5);
  ctx.fillRect(25, 17, 3, 5);
};
