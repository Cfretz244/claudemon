import { CustomSpriteDrawFn } from '../types';

export const ponyta: CustomSpriteDrawFn = (ctx, isBack) => {
  // Ponyta - cream horse, flaming mane and tail

  // Flaming tail
  ctx.fillStyle = '#f08030';
  ctx.fillRect(24, 12, 4, 6);
  ctx.fillRect(26, 10, 4, 4);
  ctx.fillStyle = '#f8d030';
  ctx.fillRect(25, 8, 4, 4);
  ctx.fillRect(27, 6, 3, 4);

  // Horse body
  ctx.fillStyle = '#f0d898';
  ctx.fillRect(8, 12, 18, 10);
  ctx.fillRect(6, 14, 20, 6);

  // Neck
  ctx.fillStyle = '#f0d898';
  ctx.fillRect(6, 6, 8, 10);
  ctx.fillRect(8, 4, 6, 4);

  // Head
  ctx.fillStyle = '#f0d898';
  ctx.fillRect(2, 4, 10, 8);
  ctx.fillRect(4, 2, 8, 4);
  ctx.fillRect(1, 6, 4, 4);

  // Flaming mane
  ctx.fillStyle = '#f08030';
  ctx.fillRect(8, 0, 6, 8);
  ctx.fillRect(10, 0, 4, 4);
  ctx.fillRect(6, 2, 4, 6);
  ctx.fillStyle = '#f8d030';
  ctx.fillRect(9, 0, 4, 4);
  ctx.fillRect(7, 1, 3, 4);
  ctx.fillRect(11, 6, 4, 4);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(3, 6, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(3, 6, 2, 2);
    // Nostril
    ctx.fillStyle = '#302020';
    ctx.fillRect(1, 9, 2, 1);
  } else {
    // Back view - mane flames visible from behind
    ctx.fillStyle = '#f08030';
    ctx.fillRect(9, 2, 6, 10);
    ctx.fillStyle = '#f8d030';
    ctx.fillRect(10, 3, 4, 6);
    // Darker body
    ctx.fillStyle = '#e0c888';
    ctx.fillRect(10, 14, 12, 6);
  }

  // Front legs
  ctx.fillStyle = '#f0d898';
  ctx.fillRect(8, 22, 4, 6);
  ctx.fillRect(13, 22, 4, 6);
  // Hooves
  ctx.fillStyle = '#c0a070';
  ctx.fillRect(8, 27, 4, 3);
  ctx.fillRect(13, 27, 4, 3);

  // Back legs
  ctx.fillStyle = '#f0d898';
  ctx.fillRect(19, 22, 4, 6);
  ctx.fillRect(23, 22, 3, 5);
  // Hooves
  ctx.fillStyle = '#c0a070';
  ctx.fillRect(19, 27, 4, 3);
};
