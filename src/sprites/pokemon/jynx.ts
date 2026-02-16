import { CustomSpriteDrawFn } from '../types';

export const jynx: CustomSpriteDrawFn = (ctx, isBack) => {
  // Jynx - purple body, blonde hair, red dress-like lower body

  // Red dress lower body
  ctx.fillStyle = '#d04060';
  ctx.fillRect(8, 18, 16, 10);
  ctx.fillRect(6, 20, 20, 8);
  ctx.fillRect(5, 24, 22, 6);

  // Purple body/torso
  ctx.fillStyle = '#8050a0';
  ctx.fillRect(10, 12, 12, 8);
  ctx.fillRect(9, 14, 14, 4);

  // Purple face
  ctx.fillRect(11, 6, 10, 8);
  ctx.fillRect(10, 8, 12, 4);

  // Blonde hair - big and flowing
  ctx.fillStyle = '#d8c030';
  ctx.fillRect(8, 0, 16, 10);
  ctx.fillRect(6, 2, 20, 6);
  ctx.fillRect(5, 4, 4, 8);
  ctx.fillRect(23, 4, 4, 8);
  // Hair flowing down sides
  ctx.fillRect(4, 8, 4, 6);
  ctx.fillRect(24, 8, 4, 6);

  // Arms
  ctx.fillStyle = '#8050a0';
  ctx.fillRect(5, 14, 5, 3);
  ctx.fillRect(22, 14, 5, 3);
  // Hands
  ctx.fillRect(3, 13, 4, 4);
  ctx.fillRect(25, 13, 4, 4);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(13, 8, 2, 2);
    ctx.fillRect(19, 8, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(13, 8, 1, 1);
    ctx.fillRect(19, 8, 1, 1);
    // Lips/mouth
    ctx.fillStyle = '#d04060';
    ctx.fillRect(14, 11, 4, 2);
  } else {
    // Back - hair covers most of it
    ctx.fillStyle = '#c8b028';
    ctx.fillRect(8, 2, 16, 14);
    ctx.fillRect(6, 6, 20, 8);
  }
};
