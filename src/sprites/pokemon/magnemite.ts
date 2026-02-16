import { CustomSpriteDrawFn } from '../types';

export const magnemite: CustomSpriteDrawFn = (ctx, isBack) => {
  // Top screw
  ctx.fillStyle = '#888888';
  ctx.fillRect(14, 2, 4, 3);
  ctx.fillStyle = '#a0a0a0';
  ctx.fillRect(15, 1, 2, 2);

  // Main spherical body
  ctx.fillStyle = '#c0c0c0';
  ctx.fillRect(9, 6, 14, 14);
  ctx.fillRect(7, 8, 18, 10);
  ctx.fillRect(11, 5, 10, 16);

  // Body highlight
  ctx.fillStyle = '#d8d8d8';
  ctx.fillRect(11, 8, 6, 6);

  // Bottom screw
  ctx.fillStyle = '#888888';
  ctx.fillRect(14, 21, 4, 3);
  ctx.fillStyle = '#a0a0a0';
  ctx.fillRect(15, 23, 2, 2);

  // Left magnet (U-shape)
  ctx.fillStyle = '#7088a8';
  ctx.fillRect(0, 8, 6, 3);
  ctx.fillRect(0, 15, 6, 3);
  ctx.fillRect(0, 8, 3, 10);
  // Magnet tips
  ctx.fillStyle = '#e03030';
  ctx.fillRect(3, 8, 3, 3);
  ctx.fillStyle = '#3060c0';
  ctx.fillRect(3, 15, 3, 3);

  // Right magnet (U-shape)
  ctx.fillStyle = '#7088a8';
  ctx.fillRect(26, 8, 6, 3);
  ctx.fillRect(26, 15, 6, 3);
  ctx.fillRect(29, 8, 3, 10);
  // Magnet tips
  ctx.fillStyle = '#e03030';
  ctx.fillRect(26, 8, 3, 3);
  ctx.fillStyle = '#3060c0';
  ctx.fillRect(26, 15, 3, 3);

  if (!isBack) {
    // Single eye
    ctx.fillStyle = '#302020';
    ctx.fillRect(13, 11, 6, 5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(14, 11, 4, 3);
    ctx.fillStyle = '#302020';
    ctx.fillRect(15, 12, 2, 2);
  } else {
    // Back - darker center circle
    ctx.fillStyle = '#a8a8a8';
    ctx.fillRect(11, 9, 10, 8);
    ctx.fillStyle = '#888888';
    ctx.fillRect(13, 11, 6, 4);
  }
};
