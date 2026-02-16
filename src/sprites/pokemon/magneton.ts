import { CustomSpriteDrawFn } from '../types';

export const magneton: CustomSpriteDrawFn = (ctx, isBack) => {
  // Top Magnemite body
  ctx.fillStyle = '#c0c0c0';
  ctx.fillRect(11, 0, 10, 10);
  ctx.fillRect(9, 2, 14, 6);
  // Top screw
  ctx.fillStyle = '#888888';
  ctx.fillRect(15, 0, 2, 1);
  // Top magnets
  ctx.fillStyle = '#7088a8';
  ctx.fillRect(6, 3, 4, 2);
  ctx.fillRect(22, 3, 4, 2);
  ctx.fillStyle = '#e03030';
  ctx.fillRect(6, 3, 2, 2);
  ctx.fillStyle = '#3060c0';
  ctx.fillRect(24, 3, 2, 2);

  // Bottom-left Magnemite body
  ctx.fillStyle = '#c0c0c0';
  ctx.fillRect(2, 14, 10, 10);
  ctx.fillRect(0, 16, 14, 6);
  // Left screw
  ctx.fillStyle = '#888888';
  ctx.fillRect(6, 13, 2, 1);
  // Left magnets
  ctx.fillStyle = '#7088a8';
  ctx.fillRect(0, 12, 2, 5);
  ctx.fillRect(13, 16, 2, 4);

  // Bottom-right Magnemite body
  ctx.fillStyle = '#c0c0c0';
  ctx.fillRect(18, 14, 10, 10);
  ctx.fillRect(16, 16, 14, 6);
  // Right screw
  ctx.fillStyle = '#888888';
  ctx.fillRect(22, 13, 2, 1);
  // Right magnets
  ctx.fillStyle = '#7088a8';
  ctx.fillRect(28, 12, 2, 5);
  ctx.fillRect(16, 16, 2, 4);

  // Bottom screws
  ctx.fillStyle = '#888888';
  ctx.fillRect(6, 24, 2, 2);
  ctx.fillRect(22, 24, 2, 2);

  if (!isBack) {
    // Top eye
    ctx.fillStyle = '#302020';
    ctx.fillRect(14, 4, 4, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(14, 4, 3, 2);
    ctx.fillStyle = '#302020';
    ctx.fillRect(15, 4, 1, 1);
    // Bottom-left eye
    ctx.fillStyle = '#302020';
    ctx.fillRect(5, 18, 4, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(5, 18, 3, 2);
    // Bottom-right eye
    ctx.fillStyle = '#302020';
    ctx.fillRect(21, 18, 4, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(21, 18, 3, 2);
  } else {
    // Back shading on all three
    ctx.fillStyle = '#a8a8a8';
    ctx.fillRect(12, 3, 8, 5);
    ctx.fillRect(3, 16, 8, 6);
    ctx.fillRect(19, 16, 8, 6);
  }
};
