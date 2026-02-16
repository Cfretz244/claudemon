import { CustomSpriteDrawFn } from '../types';

export const weedle: CustomSpriteDrawFn = (ctx, isBack) => {
  // Weedle - brown segmented worm with horn

  // Tail segment (bottom)
  ctx.fillStyle = '#c08030';
  ctx.fillRect(12, 26, 8, 4);
  ctx.fillRect(10, 27, 12, 2);

  // Stinger on tail
  ctx.fillStyle = '#d8a850';
  ctx.fillRect(14, 29, 4, 2);
  ctx.fillRect(15, 31, 2, 1);

  // Middle-lower segment
  ctx.fillStyle = '#c08030';
  ctx.fillRect(10, 22, 12, 5);
  ctx.fillRect(8, 23, 16, 3);

  // Segment line
  ctx.fillStyle = '#986020';
  ctx.fillRect(9, 22, 14, 1);

  // Middle segment
  ctx.fillStyle = '#c08030';
  ctx.fillRect(10, 17, 12, 6);
  ctx.fillRect(8, 18, 16, 4);

  // Segment line
  ctx.fillStyle = '#986020';
  ctx.fillRect(9, 17, 14, 1);

  // Upper body segment
  ctx.fillStyle = '#c08030';
  ctx.fillRect(10, 12, 12, 6);
  ctx.fillRect(8, 13, 16, 4);

  // Segment line
  ctx.fillStyle = '#986020';
  ctx.fillRect(9, 12, 14, 1);

  // Head
  ctx.fillStyle = '#c08030';
  ctx.fillRect(9, 6, 14, 7);
  ctx.fillRect(7, 7, 18, 5);

  // Horn on head
  ctx.fillStyle = '#d8a850';
  ctx.fillRect(14, 2, 4, 5);
  ctx.fillRect(15, 0, 2, 3);

  // Light underbelly
  ctx.fillStyle = '#e8c878';
  ctx.fillRect(13, 24, 6, 2);
  ctx.fillRect(13, 19, 6, 2);
  ctx.fillRect(13, 14, 6, 2);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 8, 3, 3);
    ctx.fillRect(19, 8, 3, 3);
    // Eye highlights
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 8, 1, 1);
    ctx.fillRect(19, 8, 1, 1);
    // Pink nose
    ctx.fillStyle = '#e08888';
    ctx.fillRect(14, 10, 4, 3);
    ctx.fillRect(13, 11, 6, 1);
  } else {
    // Back: no face, show horn and back markings
    ctx.fillStyle = '#986020';
    ctx.fillRect(12, 8, 8, 2);
    ctx.fillRect(13, 7, 6, 1);
  }

  // Small feet on sides
  ctx.fillStyle = '#986020';
  ctx.fillRect(7, 24, 3, 2);
  ctx.fillRect(22, 24, 3, 2);
  ctx.fillRect(7, 19, 3, 2);
  ctx.fillRect(22, 19, 3, 2);
};
