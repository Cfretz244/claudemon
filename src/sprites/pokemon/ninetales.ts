import { CustomSpriteDrawFn } from '../types';

export const ninetales: CustomSpriteDrawFn = (ctx, isBack) => {
  // Ninetales - elegant cream/gold fox, 9 flowing tails (fan), slender

  // Nine flowing tails (fan shape behind body)
  ctx.fillStyle = '#e8d090';
  ctx.fillRect(18, 2, 3, 6);
  ctx.fillRect(21, 1, 3, 6);
  ctx.fillRect(24, 2, 3, 6);
  ctx.fillRect(27, 4, 3, 5);
  ctx.fillRect(16, 4, 3, 5);
  ctx.fillRect(19, 8, 10, 4);
  ctx.fillRect(20, 6, 8, 3);
  // Tail tips - lighter
  ctx.fillStyle = '#f0e0b0';
  ctx.fillRect(18, 1, 2, 2);
  ctx.fillRect(22, 0, 2, 2);
  ctx.fillRect(25, 1, 2, 2);
  ctx.fillRect(28, 3, 2, 2);
  ctx.fillRect(16, 3, 2, 2);

  // Slender body
  ctx.fillStyle = '#e8d090';
  ctx.fillRect(8, 16, 14, 8);
  ctx.fillRect(6, 18, 18, 4);

  // Head
  ctx.fillStyle = '#e8d090';
  ctx.fillRect(5, 8, 14, 10);
  ctx.fillRect(3, 10, 18, 6);

  // Elegant pointed ears
  ctx.fillStyle = '#e8d090';
  ctx.fillRect(3, 3, 4, 6);
  ctx.fillRect(16, 3, 4, 6);
  // Inner ear
  ctx.fillStyle = '#c0a060';
  ctx.fillRect(4, 5, 2, 3);
  ctx.fillRect(17, 5, 2, 3);

  // Forehead mane
  ctx.fillStyle = '#f0e0b0';
  ctx.fillRect(7, 7, 10, 3);
  ctx.fillRect(9, 6, 6, 2);

  if (!isBack) {
    // Eyes - red, elegant
    ctx.fillStyle = '#c03030';
    ctx.fillRect(6, 11, 4, 3);
    ctx.fillRect(14, 11, 4, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6, 11, 2, 2);
    ctx.fillRect(14, 11, 2, 2);
    // Nose
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 14, 3, 2);
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 16, 4, 1);
  } else {
    // Back: flowing mane and tails
    ctx.fillStyle = '#c0a060';
    ctx.fillRect(8, 10, 8, 4);
  }

  // Slender legs
  ctx.fillStyle = '#e8d090';
  ctx.fillRect(8, 24, 4, 5);
  ctx.fillRect(17, 24, 4, 5);
  // Paws
  ctx.fillStyle = '#c0a060';
  ctx.fillRect(7, 28, 5, 2);
  ctx.fillRect(16, 28, 5, 2);
};
