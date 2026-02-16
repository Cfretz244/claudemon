import { CustomSpriteDrawFn } from '../types';

export const pinsir: CustomSpriteDrawFn = (ctx, isBack) => {
  // Pinsir - brown beetle with large horned pincers on head

  // Body - stocky
  ctx.fillStyle = '#a08050';
  ctx.fillRect(9, 14, 14, 12);
  ctx.fillRect(7, 16, 18, 8);

  // Head
  ctx.fillRect(10, 8, 12, 8);
  ctx.fillRect(8, 10, 16, 4);

  // Large pincers on top of head
  ctx.fillStyle = '#907040';
  // Left pincer
  ctx.fillRect(6, 2, 4, 8);
  ctx.fillRect(4, 0, 4, 4);
  ctx.fillRect(8, 4, 4, 4);
  // Pincer teeth
  ctx.fillStyle = '#b09060';
  ctx.fillRect(9, 2, 2, 3);
  ctx.fillRect(7, 0, 2, 2);

  // Right pincer
  ctx.fillStyle = '#907040';
  ctx.fillRect(22, 2, 4, 8);
  ctx.fillRect(24, 0, 4, 4);
  ctx.fillRect(20, 4, 4, 4);
  // Pincer teeth
  ctx.fillStyle = '#b09060';
  ctx.fillRect(21, 2, 2, 3);
  ctx.fillRect(23, 0, 2, 2);

  // Arms
  ctx.fillStyle = '#a08050';
  ctx.fillRect(4, 16, 5, 3);
  ctx.fillRect(23, 16, 5, 3);
  // Claws
  ctx.fillStyle = '#907040';
  ctx.fillRect(2, 15, 4, 4);
  ctx.fillRect(26, 15, 4, 4);

  // Legs
  ctx.fillStyle = '#a08050';
  ctx.fillRect(10, 26, 4, 4);
  ctx.fillRect(18, 26, 4, 4);
  // Feet
  ctx.fillStyle = '#907040';
  ctx.fillRect(9, 29, 6, 2);
  ctx.fillRect(17, 29, 6, 2);

  if (!isBack) {
    // Eyes - small fierce
    ctx.fillStyle = '#302020';
    ctx.fillRect(12, 10, 3, 2);
    ctx.fillRect(19, 10, 3, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(12, 10, 1, 1);
    ctx.fillRect(19, 10, 1, 1);
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(14, 13, 4, 1);
    ctx.fillRect(13, 14, 6, 1);
  } else {
    // Back segments
    ctx.fillStyle = '#907040';
    ctx.fillRect(12, 16, 8, 6);
    ctx.fillRect(11, 18, 10, 2);
  }
};
