import { CustomSpriteDrawFn } from '../types';

export const krabby: CustomSpriteDrawFn = (ctx, isBack) => {
  // Body - small round crab
  ctx.fillStyle = '#d06030';
  ctx.fillRect(10, 14, 12, 10);
  ctx.fillRect(8, 16, 16, 6);

  // Head
  ctx.fillStyle = '#d06030';
  ctx.fillRect(10, 8, 12, 8);
  ctx.fillRect(8, 10, 16, 4);

  // Crown bumps
  ctx.fillStyle = '#d06030';
  ctx.fillRect(12, 6, 3, 3);
  ctx.fillRect(17, 6, 3, 3);

  // Lighter belly
  ctx.fillStyle = '#e8a070';
  ctx.fillRect(12, 18, 8, 4);

  // Left arm
  ctx.fillStyle = '#d06030';
  ctx.fillRect(2, 10, 8, 3);
  ctx.fillRect(4, 8, 4, 2);

  // Left pincer (big)
  ctx.fillStyle = '#d06030';
  ctx.fillRect(0, 4, 7, 7);
  ctx.fillRect(0, 6, 8, 4);
  // Pincer gap
  ctx.fillStyle = '#e8a070';
  ctx.fillRect(1, 7, 5, 1);

  // Right arm
  ctx.fillStyle = '#d06030';
  ctx.fillRect(22, 10, 8, 3);
  ctx.fillRect(24, 8, 4, 2);

  // Right pincer (big)
  ctx.fillStyle = '#d06030';
  ctx.fillRect(25, 4, 7, 7);
  ctx.fillRect(24, 6, 8, 4);
  // Pincer gap
  ctx.fillStyle = '#e8a070';
  ctx.fillRect(26, 7, 5, 1);

  // Legs - three on each side
  ctx.fillStyle = '#b04820';
  ctx.fillRect(6, 20, 3, 6);
  ctx.fillRect(4, 24, 3, 4);
  ctx.fillRect(8, 22, 3, 5);
  ctx.fillRect(21, 22, 3, 5);
  ctx.fillRect(23, 20, 3, 6);
  ctx.fillRect(25, 24, 3, 4);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(12, 10, 3, 3);
    ctx.fillRect(17, 10, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(12, 10, 2, 2);
    ctx.fillRect(17, 10, 2, 2);
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(14, 14, 4, 1);
  } else {
    // Back shell shading
    ctx.fillStyle = '#b85028';
    ctx.fillRect(12, 10, 8, 8);
    ctx.fillStyle = '#c05828';
    ctx.fillRect(13, 12, 6, 4);
  }
};
