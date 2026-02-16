import { CustomSpriteDrawFn } from '../types';

export const rapidash: CustomSpriteDrawFn = (ctx, isBack) => {
  // Rapidash - white horse, larger flames, unicorn horn

  // Flaming tail - bigger flames
  ctx.fillStyle = '#f08030';
  ctx.fillRect(24, 10, 5, 8);
  ctx.fillRect(26, 8, 4, 4);
  ctx.fillStyle = '#f8d030';
  ctx.fillRect(25, 6, 5, 5);
  ctx.fillRect(27, 4, 4, 4);
  ctx.fillRect(28, 2, 3, 3);

  // Horse body - larger
  ctx.fillStyle = '#f0e8e0';
  ctx.fillRect(7, 12, 19, 10);
  ctx.fillRect(5, 14, 21, 6);

  // Neck - longer
  ctx.fillStyle = '#f0e8e0';
  ctx.fillRect(4, 6, 8, 10);
  ctx.fillRect(6, 4, 6, 4);

  // Head
  ctx.fillStyle = '#f0e8e0';
  ctx.fillRect(0, 5, 10, 8);
  ctx.fillRect(2, 3, 8, 4);

  // Unicorn horn
  ctx.fillStyle = '#c0c0c0';
  ctx.fillRect(5, 0, 3, 5);
  ctx.fillRect(6, 0, 2, 2);
  ctx.fillStyle = '#d8d8d8';
  ctx.fillRect(6, 1, 1, 3);

  // Flaming mane - larger
  ctx.fillStyle = '#f08030';
  ctx.fillRect(8, 0, 8, 10);
  ctx.fillRect(6, 2, 6, 6);
  ctx.fillRect(12, 4, 4, 8);
  ctx.fillStyle = '#f8d030';
  ctx.fillRect(9, 1, 5, 6);
  ctx.fillRect(7, 3, 4, 4);
  ctx.fillRect(13, 5, 3, 5);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(2, 7, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(2, 7, 2, 2);
    // Nostril
    ctx.fillStyle = '#302020';
    ctx.fillRect(0, 10, 2, 1);
  } else {
    // Back - large mane flames
    ctx.fillStyle = '#f08030';
    ctx.fillRect(7, 2, 8, 12);
    ctx.fillStyle = '#f8d030';
    ctx.fillRect(9, 3, 5, 8);
    ctx.fillStyle = '#e0d8d0';
    ctx.fillRect(10, 14, 12, 6);
  }

  // Front legs
  ctx.fillStyle = '#f0e8e0';
  ctx.fillRect(7, 22, 4, 7);
  ctx.fillRect(12, 22, 4, 7);
  // Hooves
  ctx.fillStyle = '#a09080';
  ctx.fillRect(7, 28, 4, 3);
  ctx.fillRect(12, 28, 4, 3);

  // Back legs
  ctx.fillStyle = '#f0e8e0';
  ctx.fillRect(19, 22, 4, 7);
  ctx.fillRect(23, 22, 3, 5);
  ctx.fillStyle = '#a09080';
  ctx.fillRect(19, 28, 4, 3);
};
