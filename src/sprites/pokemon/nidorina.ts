import { CustomSpriteDrawFn } from '../types';

export const nidorina: CustomSpriteDrawFn = (ctx, isBack) => {
  // Body - medium aqua/blue, larger than nidoranF
  ctx.fillStyle = '#5080a0';
  ctx.fillRect(6, 12, 20, 12);
  ctx.fillRect(4, 14, 24, 8);

  // Head
  ctx.fillStyle = '#5080a0';
  ctx.fillRect(4, 6, 16, 8);
  ctx.fillRect(6, 4, 12, 4);

  // Cream belly
  ctx.fillStyle = '#c0d0d8';
  ctx.fillRect(8, 16, 14, 6);

  // Horn on forehead - larger than nidoranF
  ctx.fillStyle = '#e0d0c0';
  ctx.fillRect(11, 2, 4, 4);
  ctx.fillRect(12, 0, 3, 3);

  // Ears - pointed
  ctx.fillStyle = '#5080a0';
  ctx.fillRect(5, 0, 4, 6);
  ctx.fillRect(17, 0, 4, 6);
  // Inner ear
  ctx.fillStyle = '#6898b8';
  ctx.fillRect(6, 1, 2, 4);
  ctx.fillRect(18, 1, 2, 4);

  // Larger spines on back
  ctx.fillStyle = '#406888';
  ctx.fillRect(22, 10, 4, 3);
  ctx.fillRect(24, 13, 4, 3);
  ctx.fillRect(22, 16, 4, 3);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(6, 8, 4, 3);
    ctx.fillRect(14, 8, 4, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6, 8, 2, 2);
    ctx.fillRect(14, 8, 2, 2);
    // Whiskers
    ctx.fillStyle = '#406888';
    ctx.fillRect(1, 10, 4, 1);
    ctx.fillRect(2, 12, 3, 1);
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 12, 4, 1);
  } else {
    // Back spines more visible
    ctx.fillStyle = '#406888';
    ctx.fillRect(8, 12, 4, 3);
    ctx.fillRect(14, 12, 4, 3);
    ctx.fillRect(20, 12, 4, 3);
    ctx.fillRect(11, 16, 4, 3);
    ctx.fillRect(17, 16, 4, 3);
    // Dark back
    ctx.fillStyle = '#406888';
    ctx.fillRect(8, 13, 16, 8);
    ctx.fillStyle = '#5080a0';
    ctx.fillRect(10, 14, 12, 6);
  }

  // Feet
  ctx.fillStyle = '#406888';
  ctx.fillRect(6, 24, 6, 4);
  ctx.fillRect(20, 24, 6, 4);

  // Tail
  ctx.fillStyle = '#5080a0';
  ctx.fillRect(24, 20, 4, 3);
  ctx.fillRect(26, 18, 3, 3);
};
