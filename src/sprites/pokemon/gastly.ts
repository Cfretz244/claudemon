import { CustomSpriteDrawFn } from '../types';

export const gastly: CustomSpriteDrawFn = (ctx, isBack) => {
  // Outer gas/haze cloud - irregular purple mist
  ctx.fillStyle = '#8060a0';
  ctx.fillRect(2, 4, 6, 6);
  ctx.fillRect(0, 8, 8, 8);
  ctx.fillRect(2, 16, 6, 6);
  ctx.fillRect(4, 20, 8, 6);
  ctx.fillRect(24, 4, 6, 6);
  ctx.fillRect(24, 8, 8, 8);
  ctx.fillRect(24, 16, 6, 6);
  ctx.fillRect(20, 20, 8, 6);
  ctx.fillRect(6, 22, 20, 6);
  ctx.fillRect(4, 2, 8, 4);
  ctx.fillRect(20, 2, 8, 4);
  ctx.fillRect(10, 24, 12, 4);

  // Lighter gas wisps
  ctx.fillStyle = '#9878b8';
  ctx.fillRect(0, 10, 4, 4);
  ctx.fillRect(28, 10, 4, 4);
  ctx.fillRect(6, 24, 4, 3);
  ctx.fillRect(22, 24, 4, 3);
  ctx.fillRect(4, 2, 4, 3);
  ctx.fillRect(24, 2, 4, 3);

  // Central dark sphere
  ctx.fillStyle = '#302030';
  ctx.fillRect(8, 6, 16, 16);
  ctx.fillRect(6, 8, 20, 12);
  ctx.fillRect(10, 4, 12, 18);

  if (!isBack) {
    // Big white eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(9, 9, 5, 5);
    ctx.fillRect(18, 9, 5, 5);
    // Small pupils
    ctx.fillStyle = '#302020';
    ctx.fillRect(12, 11, 2, 3);
    ctx.fillRect(21, 11, 2, 3);
    // Mouth - mischievous grin
    ctx.fillStyle = '#8060a0';
    ctx.fillRect(12, 16, 8, 2);
    ctx.fillRect(11, 17, 2, 1);
    ctx.fillRect(19, 17, 2, 1);
  } else {
    // Back - just the dark sphere with shading
    ctx.fillStyle = '#201820';
    ctx.fillRect(10, 8, 12, 10);
    ctx.fillRect(12, 6, 8, 14);
  }
};
