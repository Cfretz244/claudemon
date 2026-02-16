import { CustomSpriteDrawFn } from '../types';

export const articuno: CustomSpriteDrawFn = (ctx, isBack) => {
  // Body - elegant icy blue
  ctx.fillStyle = '#5898e0';
  ctx.fillRect(10, 8, 12, 14);
  ctx.fillRect(8, 10, 16, 10);

  // Head
  ctx.fillStyle = '#5898e0';
  ctx.fillRect(11, 2, 10, 8);
  ctx.fillRect(9, 4, 14, 6);

  // Head crest - three elegant feathers
  ctx.fillStyle = '#88b8e8';
  ctx.fillRect(13, 0, 2, 4);
  ctx.fillRect(16, 0, 2, 3);
  ctx.fillRect(19, 0, 2, 4);
  ctx.fillRect(12, 1, 2, 2);
  ctx.fillRect(20, 1, 2, 2);

  // Beak
  ctx.fillStyle = '#a0a0a8';
  ctx.fillRect(8, 6, 3, 2);
  ctx.fillRect(6, 7, 3, 1);

  // Chest highlight
  ctx.fillStyle = '#88b8e8';
  ctx.fillRect(12, 12, 8, 6);
  ctx.fillRect(13, 10, 6, 3);

  // Left wing - spread wide
  ctx.fillStyle = '#5898e0';
  ctx.fillRect(0, 6, 10, 10);
  ctx.fillRect(0, 4, 6, 4);
  ctx.fillStyle = '#88b8e8';
  ctx.fillRect(1, 8, 8, 6);
  ctx.fillRect(0, 12, 6, 4);
  // Wing ice tips
  ctx.fillStyle = '#c0d8f0';
  ctx.fillRect(0, 4, 3, 2);
  ctx.fillRect(0, 8, 2, 2);
  ctx.fillRect(0, 12, 2, 2);
  ctx.fillRect(0, 15, 3, 2);

  // Right wing - spread wide
  ctx.fillStyle = '#5898e0';
  ctx.fillRect(22, 6, 10, 10);
  ctx.fillRect(26, 4, 6, 4);
  ctx.fillStyle = '#88b8e8';
  ctx.fillRect(23, 8, 8, 6);
  ctx.fillRect(26, 12, 6, 4);
  // Wing ice tips
  ctx.fillStyle = '#c0d8f0';
  ctx.fillRect(29, 4, 3, 2);
  ctx.fillRect(30, 8, 2, 2);
  ctx.fillRect(30, 12, 2, 2);
  ctx.fillRect(29, 15, 3, 2);

  // Long ribbon-like tail streamers
  ctx.fillStyle = '#88b8e8';
  ctx.fillRect(12, 22, 3, 4);
  ctx.fillRect(10, 25, 3, 4);
  ctx.fillRect(8, 28, 3, 4);
  ctx.fillRect(17, 22, 3, 4);
  ctx.fillRect(19, 25, 3, 4);
  ctx.fillRect(21, 28, 3, 4);
  // Streamer shimmer
  ctx.fillStyle = '#c0d8f0';
  ctx.fillRect(10, 26, 2, 2);
  ctx.fillRect(21, 29, 2, 2);

  // Legs
  ctx.fillStyle = '#a0a0a8';
  ctx.fillRect(12, 20, 3, 4);
  ctx.fillRect(17, 20, 3, 4);

  if (!isBack) {
    // Majestic eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(11, 4, 3, 3);
    ctx.fillRect(18, 4, 3, 3);
    ctx.fillStyle = '#c03030';
    ctx.fillRect(11, 4, 2, 2);
    ctx.fillRect(18, 4, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 4, 1, 1);
    ctx.fillRect(18, 4, 1, 1);
  } else {
    // Back: wings spread wide, tail flowing
    ctx.fillStyle = '#88b8e8';
    ctx.fillRect(0, 4, 12, 12);
    ctx.fillRect(20, 4, 12, 12);
    ctx.fillStyle = '#c0d8f0';
    ctx.fillRect(2, 6, 8, 8);
    ctx.fillRect(22, 6, 8, 8);
    // Back tail streamers
    ctx.fillStyle = '#88b8e8';
    ctx.fillRect(14, 20, 4, 6);
    ctx.fillRect(12, 24, 3, 4);
    ctx.fillRect(17, 24, 3, 4);
    ctx.fillRect(10, 28, 3, 4);
    ctx.fillRect(19, 28, 3, 4);
  }
};
