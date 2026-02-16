import { CustomSpriteDrawFn } from '../types';

export const nidoranM: CustomSpriteDrawFn = (ctx, isBack) => {
  // Nidoran Male - small purple Pokemon with horn, big ears, spines

  // Body
  ctx.fillStyle = '#a050c0';
  ctx.fillRect(10, 16, 14, 10);
  ctx.fillRect(8, 18, 18, 6);

  // Head
  ctx.fillStyle = '#a050c0';
  ctx.fillRect(10, 10, 12, 8);
  ctx.fillRect(8, 12, 16, 4);

  // Big ears
  ctx.fillStyle = '#a050c0';
  ctx.fillRect(6, 4, 4, 8);
  ctx.fillRect(22, 4, 4, 8);
  // Inner ear
  ctx.fillStyle = '#c080d8';
  ctx.fillRect(7, 6, 2, 4);
  ctx.fillRect(23, 6, 2, 4);

  // Horn on forehead
  ctx.fillStyle = '#d0c8b0';
  ctx.fillRect(14, 4, 4, 6);
  ctx.fillRect(15, 2, 2, 3);

  // Spines on back
  ctx.fillStyle = '#8040a0';
  ctx.fillRect(12, 15, 2, 2);
  ctx.fillRect(16, 14, 2, 2);
  ctx.fillRect(20, 15, 2, 2);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(11, 12, 3, 3);
    ctx.fillRect(18, 12, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 12, 2, 2);
    ctx.fillRect(18, 12, 2, 2);
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(14, 16, 4, 1);
  } else {
    // Back markings
    ctx.fillStyle = '#8040a0';
    ctx.fillRect(12, 12, 8, 4);
    ctx.fillRect(14, 16, 2, 2);
    ctx.fillRect(18, 16, 2, 2);
  }

  // Legs
  ctx.fillStyle = '#a050c0';
  ctx.fillRect(9, 26, 4, 4);
  ctx.fillRect(19, 26, 4, 4);
  // Feet
  ctx.fillStyle = '#8040a0';
  ctx.fillRect(8, 29, 5, 2);
  ctx.fillRect(18, 29, 5, 2);
};
