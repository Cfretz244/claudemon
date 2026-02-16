import { CustomSpriteDrawFn } from '../types';

export const electrode: CustomSpriteDrawFn = (ctx, isBack) => {
  // Electrode - INVERTED Pokeball: white top, red bottom, grinning

  // Red bottom half
  ctx.fillStyle = '#e03030';
  ctx.fillRect(7, 16, 18, 8);
  ctx.fillRect(5, 18, 22, 6);
  ctx.fillRect(9, 24, 14, 2);

  // White top half
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(7, 7, 18, 9);
  ctx.fillRect(5, 9, 22, 7);
  ctx.fillRect(9, 5, 14, 4);
  ctx.fillRect(11, 4, 10, 2);

  // Center dividing line
  ctx.fillStyle = '#302020';
  ctx.fillRect(5, 15, 22, 2);

  // Center button
  ctx.fillStyle = '#302020';
  ctx.fillRect(14, 14, 4, 4);
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(15, 15, 2, 2);

  // Highlight on white
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(10, 6, 4, 2);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 10, 3, 3);
    ctx.fillRect(19, 10, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 10, 2, 2);
    ctx.fillRect(19, 10, 2, 2);
    // Wide grinning mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 19, 12, 2);
    ctx.fillRect(9, 18, 1, 2);
    ctx.fillRect(22, 18, 1, 2);
    // Teeth/white inside mouth
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(12, 19, 2, 1);
    ctx.fillRect(18, 19, 2, 1);
  } else {
    // Back shading
    ctx.fillStyle = '#d8d8d8';
    ctx.fillRect(11, 8, 10, 5);
    ctx.fillStyle = '#c02828';
    ctx.fillRect(11, 19, 10, 4);
  }
};
