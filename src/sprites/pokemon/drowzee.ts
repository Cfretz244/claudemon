import { CustomSpriteDrawFn } from '../types';

export const drowzee: CustomSpriteDrawFn = (ctx, isBack) => {
  // Lower body - darker brown
  ctx.fillStyle = '#b08838';
  ctx.fillRect(8, 18, 16, 10);
  ctx.fillRect(6, 20, 20, 6);

  // Upper body - yellow
  ctx.fillStyle = '#d8b060';
  ctx.fillRect(8, 8, 16, 12);
  ctx.fillRect(6, 10, 20, 8);

  // Head
  ctx.fillStyle = '#d8b060';
  ctx.fillRect(8, 2, 16, 10);
  ctx.fillRect(6, 4, 20, 6);

  // Trunk-like nose
  ctx.fillStyle = '#d8b060';
  ctx.fillRect(6, 6, 4, 8);
  ctx.fillRect(4, 8, 4, 6);
  ctx.fillRect(2, 10, 4, 4);
  ctx.fillStyle = '#b08838';
  ctx.fillRect(2, 12, 3, 2);

  // Arms
  ctx.fillStyle = '#d8b060';
  ctx.fillRect(4, 12, 4, 6);
  ctx.fillRect(24, 12, 4, 6);

  // Hands
  ctx.fillStyle = '#b08838';
  ctx.fillRect(3, 16, 4, 3);
  ctx.fillRect(25, 16, 4, 3);

  // Feet
  ctx.fillStyle = '#b08838';
  ctx.fillRect(8, 26, 6, 4);
  ctx.fillRect(18, 26, 6, 4);

  // Belly pattern - wavy line between colors
  ctx.fillStyle = '#d8b060';
  ctx.fillRect(8, 17, 4, 2);
  ctx.fillRect(12, 18, 4, 2);
  ctx.fillRect(16, 17, 4, 2);
  ctx.fillRect(20, 18, 4, 2);

  if (!isBack) {
    // Eyes - sleepy/half-closed
    ctx.fillStyle = '#302020';
    ctx.fillRect(12, 4, 4, 2);
    ctx.fillRect(20, 4, 4, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(12, 5, 3, 1);
    ctx.fillRect(20, 5, 3, 1);
    // Nose tip
    ctx.fillStyle = '#302020';
    ctx.fillRect(3, 10, 2, 2);
  } else {
    // Back shading
    ctx.fillStyle = '#c8a050';
    ctx.fillRect(10, 6, 12, 6);
    ctx.fillStyle = '#a07828';
    ctx.fillRect(10, 20, 12, 4);
  }
};
