import { CustomSpriteDrawFn } from '../types';

export const magikarp: CustomSpriteDrawFn = (ctx, isBack) => {
  // Magikarp - red/gold fish, big dumb round eyes, whiskers, simple

  // Body - round fish
  ctx.fillStyle = '#d06830';
  ctx.fillRect(8, 10, 14, 12);
  ctx.fillRect(6, 12, 18, 8);
  ctx.fillRect(10, 8, 10, 2);

  // Yellow/gold belly
  ctx.fillStyle = '#d8b048';
  ctx.fillRect(8, 18, 14, 4);
  ctx.fillRect(10, 16, 10, 2);

  // Tail fin
  ctx.fillStyle = '#d06830';
  ctx.fillRect(22, 10, 4, 3);
  ctx.fillRect(24, 8, 4, 4);
  ctx.fillRect(24, 16, 4, 4);
  ctx.fillRect(22, 18, 4, 3);
  ctx.fillRect(26, 6, 4, 6);
  ctx.fillRect(26, 17, 4, 6);

  // Dorsal fin (top)
  ctx.fillStyle = '#d8b048';
  ctx.fillRect(12, 6, 4, 4);
  ctx.fillRect(14, 4, 3, 4);

  // Pectoral fin
  ctx.fillStyle = '#d8b048';
  ctx.fillRect(6, 16, 4, 3);
  ctx.fillRect(4, 17, 3, 3);

  // Scales pattern
  ctx.fillStyle = '#c05828';
  ctx.fillRect(10, 12, 2, 2);
  ctx.fillRect(14, 12, 2, 2);
  ctx.fillRect(18, 12, 2, 2);
  ctx.fillRect(12, 14, 2, 2);
  ctx.fillRect(16, 14, 2, 2);

  // Whiskers
  ctx.fillStyle = '#d8b048';
  ctx.fillRect(4, 12, 4, 1);
  ctx.fillRect(2, 13, 3, 1);
  ctx.fillRect(4, 16, 4, 1);
  ctx.fillRect(2, 15, 3, 1);

  if (!isBack) {
    // Big dumb eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(8, 10, 4, 4);
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 11, 2, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 11, 1, 1);
    // Mouth - open and dumb
    ctx.fillStyle = '#302020';
    ctx.fillRect(6, 14, 3, 2);
  } else {
    // Back scales
    ctx.fillStyle = '#c05828';
    ctx.fillRect(10, 12, 10, 6);
    ctx.fillStyle = '#d06830';
    ctx.fillRect(12, 13, 6, 4);
  }
};
