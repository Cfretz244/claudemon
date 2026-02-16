import { CustomSpriteDrawFn } from '../types';

export const nidoking: CustomSpriteDrawFn = (ctx, isBack) => {
  // Nidoking - large purple bipedal, big horn, armored chest, thick tail

  // Thick tail
  ctx.fillStyle = '#8040a0';
  ctx.fillRect(24, 18, 6, 4);
  ctx.fillRect(26, 16, 4, 3);
  ctx.fillRect(28, 14, 3, 3);

  // Body
  ctx.fillStyle = '#8040a0';
  ctx.fillRect(8, 12, 18, 14);
  ctx.fillRect(6, 14, 22, 10);

  // Armored chest
  ctx.fillStyle = '#a068c0';
  ctx.fillRect(10, 14, 14, 8);
  ctx.fillRect(12, 13, 10, 10);

  // Head
  ctx.fillStyle = '#8040a0';
  ctx.fillRect(9, 4, 14, 10);
  ctx.fillRect(7, 6, 18, 6);

  // Big horn
  ctx.fillStyle = '#d0c8b0';
  ctx.fillRect(14, 0, 4, 5);
  ctx.fillRect(15, -2, 2, 3);

  // Ears
  ctx.fillStyle = '#8040a0';
  ctx.fillRect(6, 3, 4, 5);
  ctx.fillRect(22, 3, 4, 5);

  // Back spines
  ctx.fillStyle = '#6030a0';
  ctx.fillRect(22, 12, 3, 2);
  ctx.fillRect(24, 14, 2, 2);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 7, 4, 3);
    ctx.fillRect(18, 7, 4, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 7, 2, 2);
    ctx.fillRect(18, 7, 2, 2);
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(13, 11, 6, 1);
  } else {
    // Back view: spines on back, no face
    ctx.fillStyle = '#6030a0';
    ctx.fillRect(12, 6, 8, 4);
    ctx.fillRect(10, 12, 3, 3);
    ctx.fillRect(15, 11, 3, 3);
    ctx.fillRect(20, 12, 3, 3);
  }

  // Arms
  ctx.fillStyle = '#8040a0';
  ctx.fillRect(4, 14, 4, 6);
  ctx.fillRect(24, 14, 4, 6);

  // Powerful legs
  ctx.fillStyle = '#8040a0';
  ctx.fillRect(9, 26, 6, 4);
  ctx.fillRect(17, 26, 6, 4);
  // Feet
  ctx.fillStyle = '#6030a0';
  ctx.fillRect(8, 29, 7, 3);
  ctx.fillRect(16, 29, 7, 3);
};
