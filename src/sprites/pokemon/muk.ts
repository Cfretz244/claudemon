import { CustomSpriteDrawFn } from '../types';

export const muk: CustomSpriteDrawFn = (ctx, isBack) => {
  // Wide sludge base
  ctx.fillStyle = '#704890';
  ctx.fillRect(0, 24, 32, 8);
  ctx.fillRect(2, 20, 28, 6);

  // Large main body
  ctx.fillStyle = '#704890';
  ctx.fillRect(4, 6, 24, 18);
  ctx.fillRect(2, 10, 28, 14);
  ctx.fillRect(6, 4, 20, 20);

  // Darker sludge drip details
  ctx.fillStyle = '#583878';
  ctx.fillRect(6, 8, 8, 6);
  ctx.fillRect(20, 12, 6, 5);
  ctx.fillRect(10, 20, 12, 4);
  ctx.fillRect(14, 16, 4, 6);

  // Lighter sludge patches
  ctx.fillStyle = '#8060a8';
  ctx.fillRect(16, 8, 6, 4);
  ctx.fillRect(8, 18, 4, 3);

  // Arm sludge - left
  ctx.fillStyle = '#704890';
  ctx.fillRect(0, 10, 5, 8);
  ctx.fillRect(0, 12, 3, 6);
  // Arm sludge - right
  ctx.fillRect(27, 10, 5, 8);
  ctx.fillRect(29, 12, 3, 6);

  // Dripping from arms
  ctx.fillStyle = '#583878';
  ctx.fillRect(0, 18, 3, 4);
  ctx.fillRect(29, 18, 3, 4);

  if (!isBack) {
    // Eyes - angry beady
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 6, 4, 4);
    ctx.fillRect(20, 6, 4, 4);
    ctx.fillStyle = '#302020';
    ctx.fillRect(12, 7, 2, 2);
    ctx.fillRect(22, 7, 2, 2);
    // Angry brow
    ctx.fillStyle = '#583878';
    ctx.fillRect(9, 5, 5, 2);
    ctx.fillRect(19, 5, 5, 2);
    // Wide grinning mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(8, 12, 16, 4);
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(10, 12, 3, 2);
    ctx.fillRect(19, 12, 3, 2);
    ctx.fillStyle = '#704890';
    ctx.fillRect(10, 14, 12, 1);
  } else {
    // Back detail
    ctx.fillStyle = '#583878';
    ctx.fillRect(8, 8, 16, 10);
    ctx.fillStyle = '#704890';
    ctx.fillRect(10, 10, 12, 6);
    ctx.fillStyle = '#583878';
    ctx.fillRect(12, 12, 8, 2);
  }
};
