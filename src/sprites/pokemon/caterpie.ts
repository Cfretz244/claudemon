import { CustomSpriteDrawFn } from '../types';

export const caterpie: CustomSpriteDrawFn = (ctx, isBack) => {
  // Caterpie - green worm with segmented body and red antenna

  // Tail segment (bottom)
  ctx.fillStyle = '#78c850';
  ctx.fillRect(12, 26, 8, 4);
  ctx.fillRect(10, 27, 12, 2);

  // Middle-lower segment
  ctx.fillStyle = '#78c850';
  ctx.fillRect(10, 22, 12, 5);
  ctx.fillRect(8, 23, 16, 3);

  // Segment line
  ctx.fillStyle = '#58a830';
  ctx.fillRect(9, 22, 14, 1);

  // Middle segment
  ctx.fillStyle = '#78c850';
  ctx.fillRect(10, 17, 12, 6);
  ctx.fillRect(8, 18, 16, 4);

  // Segment line
  ctx.fillStyle = '#58a830';
  ctx.fillRect(9, 17, 14, 1);

  // Upper body segment
  ctx.fillStyle = '#78c850';
  ctx.fillRect(10, 12, 12, 6);
  ctx.fillRect(8, 13, 16, 4);

  // Segment line
  ctx.fillStyle = '#58a830';
  ctx.fillRect(9, 12, 14, 1);

  // Head
  ctx.fillStyle = '#78c850';
  ctx.fillRect(9, 6, 14, 7);
  ctx.fillRect(7, 7, 18, 5);

  // Yellow underbelly circles on segments
  ctx.fillStyle = '#c8e870';
  ctx.fillRect(13, 24, 6, 2);
  ctx.fillRect(13, 19, 6, 2);
  ctx.fillRect(13, 14, 6, 2);

  // Red antenna
  ctx.fillStyle = '#e03030';
  ctx.fillRect(11, 3, 2, 4);
  ctx.fillRect(19, 3, 2, 4);
  ctx.fillRect(10, 2, 2, 2);
  ctx.fillRect(20, 2, 2, 2);

  if (!isBack) {
    // Eyes - big round
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 7, 4, 4);
    ctx.fillRect(18, 7, 4, 4);
    // Eye highlights
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 7, 2, 2);
    ctx.fillRect(18, 7, 2, 2);
    // Yellow ring around eyes
    ctx.fillStyle = '#d8d030';
    ctx.fillRect(9, 7, 1, 4);
    ctx.fillRect(14, 7, 1, 4);
    ctx.fillRect(17, 7, 1, 4);
    ctx.fillRect(22, 7, 1, 4);
  } else {
    // Back view: no face, just top of head and antenna
    ctx.fillStyle = '#58a830';
    ctx.fillRect(11, 7, 10, 3);
    // Tail tip
    ctx.fillStyle = '#58a830';
    ctx.fillRect(14, 29, 4, 2);
  }

  // Small feet on sides
  ctx.fillStyle = '#58a830';
  ctx.fillRect(7, 24, 3, 2);
  ctx.fillRect(22, 24, 3, 2);
  ctx.fillRect(7, 19, 3, 2);
  ctx.fillRect(22, 19, 3, 2);
};
