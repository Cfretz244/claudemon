import { CustomSpriteDrawFn } from '../types';

export const gengar: CustomSpriteDrawFn = (ctx, isBack) => {
  // Round body
  ctx.fillStyle = '#504080';
  ctx.fillRect(4, 10, 24, 16);
  ctx.fillRect(2, 14, 28, 10);
  ctx.fillRect(6, 8, 20, 18);

  // Head
  ctx.fillStyle = '#504080';
  ctx.fillRect(6, 2, 20, 14);
  ctx.fillRect(4, 4, 24, 10);
  ctx.fillRect(8, 0, 16, 14);

  // Ear spikes
  ctx.fillStyle = '#504080';
  ctx.fillRect(2, 0, 6, 6);
  ctx.fillRect(4, 0, 4, 4);
  ctx.fillRect(24, 0, 6, 6);
  ctx.fillRect(24, 0, 4, 4);

  // Arms
  ctx.fillStyle = '#504080';
  ctx.fillRect(0, 14, 5, 6);
  ctx.fillRect(27, 14, 5, 6);

  // Legs
  ctx.fillStyle = '#504080';
  ctx.fillRect(6, 26, 8, 4);
  ctx.fillRect(18, 26, 8, 4);

  // Darker belly
  ctx.fillStyle = '#403068';
  ctx.fillRect(10, 18, 12, 8);

  if (!isBack) {
    // Eyes - red menacing
    ctx.fillStyle = '#e03030';
    ctx.fillRect(8, 5, 5, 4);
    ctx.fillRect(19, 5, 5, 4);
    ctx.fillStyle = '#302020';
    ctx.fillRect(11, 6, 2, 2);
    ctx.fillRect(22, 6, 2, 2);
    // White highlight
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(8, 5, 2, 2);
    ctx.fillRect(19, 5, 2, 2);
    // Wide grinning mouth with teeth
    ctx.fillStyle = '#302020';
    ctx.fillRect(6, 11, 20, 4);
    ctx.fillStyle = '#f0f0f0';
    // Top teeth
    ctx.fillRect(8, 11, 3, 2);
    ctx.fillRect(13, 11, 2, 2);
    ctx.fillRect(17, 11, 2, 2);
    ctx.fillRect(21, 11, 3, 2);
    // Bottom teeth
    ctx.fillRect(10, 13, 2, 2);
    ctx.fillRect(15, 13, 2, 2);
    ctx.fillRect(20, 13, 2, 2);
  } else {
    // Back shading
    ctx.fillStyle = '#403068';
    ctx.fillRect(8, 4, 16, 12);
    ctx.fillStyle = '#383060';
    ctx.fillRect(10, 6, 12, 8);
    // Back ear tips
    ctx.fillStyle = '#403068';
    ctx.fillRect(3, 1, 4, 3);
    ctx.fillRect(25, 1, 4, 3);
  }
};
