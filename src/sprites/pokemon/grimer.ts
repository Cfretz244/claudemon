import { CustomSpriteDrawFn } from '../types';

export const grimer: CustomSpriteDrawFn = (ctx, isBack) => {
  // Sludge base - wide puddle
  ctx.fillStyle = '#8050a0';
  ctx.fillRect(2, 22, 28, 8);
  ctx.fillRect(0, 24, 32, 6);
  ctx.fillRect(4, 20, 24, 4);

  // Main body blob
  ctx.fillStyle = '#8050a0';
  ctx.fillRect(6, 8, 20, 16);
  ctx.fillRect(4, 12, 24, 10);
  ctx.fillRect(8, 6, 16, 18);

  // Darker sludge patches
  ctx.fillStyle = '#684088';
  ctx.fillRect(8, 14, 6, 4);
  ctx.fillRect(18, 18, 5, 3);
  ctx.fillRect(12, 22, 8, 3);

  // Arm-like sludge appendages
  ctx.fillStyle = '#8050a0';
  ctx.fillRect(2, 14, 5, 6);
  ctx.fillRect(0, 16, 4, 4);
  ctx.fillRect(25, 14, 5, 6);
  ctx.fillRect(28, 16, 4, 4);

  if (!isBack) {
    // Eyes - beady white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 8, 4, 4);
    ctx.fillRect(18, 8, 4, 4);
    ctx.fillStyle = '#302020';
    ctx.fillRect(12, 9, 2, 2);
    ctx.fillRect(20, 9, 2, 2);
    // Wide grinning mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 14, 12, 3);
    ctx.fillStyle = '#a060b0';
    ctx.fillRect(11, 15, 10, 1);
    // Teeth hints
    ctx.fillStyle = '#d0d0d0';
    ctx.fillRect(12, 14, 2, 1);
    ctx.fillRect(18, 14, 2, 1);
  } else {
    // Back - dark sludge detail
    ctx.fillStyle = '#684088';
    ctx.fillRect(10, 10, 12, 8);
    ctx.fillStyle = '#704890';
    ctx.fillRect(12, 12, 8, 4);
  }
};
