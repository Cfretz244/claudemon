import { CustomSpriteDrawFn } from '../types';

export const kadabra: CustomSpriteDrawFn = (ctx, isBack) => {
  // Kadabra - yellow fox with mustache, holding spoon

  // Tail
  ctx.fillStyle = '#b09030';
  ctx.fillRect(23, 18, 4, 3);
  ctx.fillRect(25, 15, 4, 4);
  ctx.fillRect(27, 12, 3, 4);

  // Body
  ctx.fillStyle = '#d8b030';
  ctx.fillRect(9, 14, 14, 10);
  ctx.fillRect(7, 16, 18, 6);

  // Brown armor segments
  ctx.fillStyle = '#b09030';
  ctx.fillRect(10, 16, 12, 3);

  // Head
  ctx.fillStyle = '#d8b030';
  ctx.fillRect(8, 2, 14, 13);
  ctx.fillRect(6, 4, 18, 9);

  // Pointed ears
  ctx.fillStyle = '#d8b030';
  ctx.fillRect(5, 0, 4, 6);
  ctx.fillRect(21, 0, 4, 6);
  ctx.fillStyle = '#b09030';
  ctx.fillRect(6, 1, 2, 4);
  ctx.fillRect(22, 1, 2, 4);

  // Star on forehead
  ctx.fillStyle = '#c03030';
  ctx.fillRect(13, 3, 4, 2);
  ctx.fillRect(14, 2, 2, 4);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(9, 7, 4, 3);
    ctx.fillRect(17, 7, 4, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(9, 7, 2, 2);
    ctx.fillRect(17, 7, 2, 2);
    // Mustache
    ctx.fillStyle = '#b09030';
    ctx.fillRect(5, 11, 5, 2);
    ctx.fillRect(20, 11, 5, 2);
    ctx.fillRect(4, 12, 3, 2);
    ctx.fillRect(23, 12, 3, 2);
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(13, 12, 4, 1);
  } else {
    // Back markings
    ctx.fillStyle = '#b09030';
    ctx.fillRect(10, 6, 10, 6);
    ctx.fillRect(11, 16, 8, 4);
  }

  // Left arm
  ctx.fillStyle = '#d8b030';
  ctx.fillRect(4, 16, 4, 5);

  // Right arm holding spoon
  ctx.fillStyle = '#d8b030';
  ctx.fillRect(22, 14, 4, 5);
  // Spoon
  ctx.fillStyle = '#c0c0c0';
  ctx.fillRect(26, 10, 2, 8);
  ctx.fillRect(25, 8, 4, 3);

  // Feet
  ctx.fillStyle = '#b09030';
  ctx.fillRect(9, 24, 5, 3);
  ctx.fillRect(17, 24, 5, 3);
};
