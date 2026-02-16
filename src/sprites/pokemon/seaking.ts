import { CustomSpriteDrawFn } from '../types';

export const seaking: CustomSpriteDrawFn = (ctx, isBack) => {
  // Seaking - large orange/white fish with horn and fancy fins

  // Body - large oval fish shape
  ctx.fillStyle = '#e08848';
  ctx.fillRect(8, 10, 16, 14);
  ctx.fillRect(6, 12, 20, 10);
  ctx.fillRect(10, 8, 12, 2);

  // White belly
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(8, 18, 16, 6);
  ctx.fillRect(10, 16, 12, 2);

  // Horn on forehead
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(14, 2, 4, 8);
  ctx.fillRect(15, 0, 2, 4);
  ctx.fillStyle = '#e08848';
  ctx.fillRect(13, 6, 6, 4);

  // Flowing top fin
  ctx.fillStyle = '#d06838';
  ctx.fillRect(4, 8, 6, 3);
  ctx.fillRect(2, 6, 5, 3);
  ctx.fillRect(1, 4, 4, 3);

  // Tail fin - fancy and flowing
  ctx.fillStyle = '#d06838';
  ctx.fillRect(24, 10, 4, 3);
  ctx.fillRect(26, 6, 4, 5);
  ctx.fillRect(26, 17, 4, 5);
  ctx.fillRect(28, 8, 3, 3);
  ctx.fillRect(28, 18, 3, 3);

  // Bottom fin
  ctx.fillStyle = '#d06838';
  ctx.fillRect(10, 24, 6, 3);
  ctx.fillRect(8, 26, 4, 3);

  // Side fin
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(18, 16, 5, 2);
  ctx.fillRect(20, 14, 4, 2);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 11, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 11, 2, 2);
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(7, 16, 3, 1);
  } else {
    // Back pattern
    ctx.fillStyle = '#d07838';
    ctx.fillRect(10, 12, 12, 8);
    ctx.fillStyle = '#c06828';
    ctx.fillRect(12, 14, 8, 4);
  }
};
