import { CustomSpriteDrawFn } from '../types';

export const nidorino: CustomSpriteDrawFn = (ctx, isBack) => {
  // Nidorino - medium purple, larger horn, prominent back spines

  // Body
  ctx.fillStyle = '#9048b0';
  ctx.fillRect(8, 16, 18, 10);
  ctx.fillRect(6, 18, 22, 6);

  // Head
  ctx.fillStyle = '#9048b0';
  ctx.fillRect(8, 10, 14, 8);
  ctx.fillRect(6, 12, 18, 4);

  // Big ears
  ctx.fillStyle = '#9048b0';
  ctx.fillRect(5, 4, 5, 8);
  ctx.fillRect(22, 4, 5, 8);
  // Inner ear
  ctx.fillStyle = '#b078c8';
  ctx.fillRect(6, 6, 3, 4);
  ctx.fillRect(23, 6, 3, 4);

  // Larger horn
  ctx.fillStyle = '#d0c8b0';
  ctx.fillRect(13, 2, 5, 8);
  ctx.fillRect(14, 0, 3, 3);
  ctx.fillRect(15, -1, 1, 2);

  // Prominent back spines
  ctx.fillStyle = '#7038a0';
  ctx.fillRect(10, 14, 3, 3);
  ctx.fillRect(15, 13, 3, 3);
  ctx.fillRect(20, 14, 3, 3);
  ctx.fillRect(24, 16, 2, 2);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(9, 12, 4, 3);
    ctx.fillRect(18, 12, 4, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(9, 12, 2, 2);
    ctx.fillRect(18, 12, 2, 2);
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(13, 16, 5, 1);
  } else {
    // Back view: spines more visible
    ctx.fillStyle = '#7038a0';
    ctx.fillRect(10, 12, 12, 4);
    ctx.fillRect(12, 16, 2, 2);
    ctx.fillRect(16, 15, 2, 3);
    ctx.fillRect(20, 16, 2, 2);
  }

  // Legs
  ctx.fillStyle = '#9048b0';
  ctx.fillRect(8, 26, 5, 4);
  ctx.fillRect(19, 26, 5, 4);
  // Feet
  ctx.fillStyle = '#7038a0';
  ctx.fillRect(7, 29, 6, 2);
  ctx.fillRect(18, 29, 6, 2);
};
