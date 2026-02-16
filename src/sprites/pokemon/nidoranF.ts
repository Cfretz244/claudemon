import { CustomSpriteDrawFn } from '../types';

export const nidoranF: CustomSpriteDrawFn = (ctx, isBack) => {
  // Body - small blue-ish Pokemon
  ctx.fillStyle = '#7088b8';
  ctx.fillRect(8, 14, 16, 10);
  ctx.fillRect(6, 16, 20, 6);

  // Head
  ctx.fillStyle = '#7088b8';
  ctx.fillRect(6, 8, 14, 8);
  ctx.fillRect(8, 6, 10, 4);

  // Cream belly
  ctx.fillStyle = '#d0d8e8';
  ctx.fillRect(10, 18, 10, 4);

  // Small horn on forehead
  ctx.fillStyle = '#e0d0c0';
  ctx.fillRect(12, 4, 3, 4);
  ctx.fillRect(13, 2, 2, 3);

  // Ears - large, pointed
  ctx.fillStyle = '#7088b8';
  ctx.fillRect(6, 2, 4, 7);
  ctx.fillRect(17, 2, 4, 7);
  // Inner ear
  ctx.fillStyle = '#8098c8';
  ctx.fillRect(7, 3, 2, 5);
  ctx.fillRect(18, 3, 2, 5);

  // Small back spines
  ctx.fillStyle = '#5870a0';
  ctx.fillRect(20, 12, 3, 2);
  ctx.fillRect(22, 14, 3, 2);

  if (!isBack) {
    // Eyes - cute round
    ctx.fillStyle = '#302020';
    ctx.fillRect(8, 9, 3, 3);
    ctx.fillRect(15, 9, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(8, 9, 2, 2);
    ctx.fillRect(15, 9, 2, 2);
    // Whiskers
    ctx.fillStyle = '#5870a0';
    ctx.fillRect(3, 12, 4, 1);
    ctx.fillRect(4, 14, 3, 1);
    ctx.fillRect(20, 12, 4, 1);
    ctx.fillRect(20, 14, 3, 1);
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(12, 14, 3, 1);
  } else {
    // Back spots
    ctx.fillStyle = '#5870a0';
    ctx.fillRect(10, 15, 3, 3);
    ctx.fillRect(17, 15, 3, 3);
    ctx.fillRect(13, 19, 3, 3);
  }

  // Feet
  ctx.fillStyle = '#5870a0';
  ctx.fillRect(8, 24, 5, 3);
  ctx.fillRect(19, 24, 5, 3);

  // Short tail
  ctx.fillStyle = '#7088b8';
  ctx.fillRect(24, 18, 3, 3);
  ctx.fillRect(26, 17, 2, 2);
};
