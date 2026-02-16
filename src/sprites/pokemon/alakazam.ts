import { CustomSpriteDrawFn } from '../types';

export const alakazam: CustomSpriteDrawFn = (ctx, isBack) => {
  // Alakazam - yellow, TWO spoons, long mustache, big head, thin body

  // Thin body
  ctx.fillStyle = '#d8b030';
  ctx.fillRect(11, 16, 10, 10);
  ctx.fillRect(13, 18, 6, 6);

  // Brown armor on torso
  ctx.fillStyle = '#b09030';
  ctx.fillRect(12, 18, 8, 3);

  // Big head
  ctx.fillStyle = '#d8b030';
  ctx.fillRect(6, 2, 20, 14);
  ctx.fillRect(4, 4, 24, 10);

  // Pointed ears
  ctx.fillStyle = '#d8b030';
  ctx.fillRect(3, 0, 4, 5);
  ctx.fillRect(25, 0, 4, 5);
  ctx.fillStyle = '#b09030';
  ctx.fillRect(4, 1, 2, 3);
  ctx.fillRect(26, 1, 2, 3);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(9, 6, 4, 4);
    ctx.fillRect(19, 6, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(9, 6, 2, 2);
    ctx.fillRect(19, 6, 2, 2);
    // Long mustache
    ctx.fillStyle = '#b09030';
    ctx.fillRect(3, 12, 7, 2);
    ctx.fillRect(22, 12, 7, 2);
    ctx.fillRect(1, 13, 5, 3);
    ctx.fillRect(26, 13, 5, 3);
    ctx.fillRect(0, 15, 3, 2);
    ctx.fillRect(29, 15, 3, 2);
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(14, 13, 4, 1);
  } else {
    // Back - big head shape
    ctx.fillStyle = '#b09030';
    ctx.fillRect(8, 5, 16, 8);
    ctx.fillRect(13, 18, 6, 4);
  }

  // Left arm with spoon
  ctx.fillStyle = '#d8b030';
  ctx.fillRect(4, 17, 4, 4);
  ctx.fillStyle = '#c0c0c0';
  ctx.fillRect(2, 12, 2, 8);
  ctx.fillRect(1, 10, 4, 3);

  // Right arm with spoon
  ctx.fillStyle = '#d8b030';
  ctx.fillRect(24, 17, 4, 4);
  ctx.fillStyle = '#c0c0c0';
  ctx.fillRect(28, 12, 2, 8);
  ctx.fillRect(27, 10, 4, 3);

  // Feet
  ctx.fillStyle = '#b09030';
  ctx.fillRect(11, 26, 4, 3);
  ctx.fillRect(17, 26, 4, 3);
};
