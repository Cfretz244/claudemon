import { CustomSpriteDrawFn } from '../types';

export const doduo: CustomSpriteDrawFn = (ctx, isBack) => {
  // Round body
  ctx.fillStyle = '#b09060';
  ctx.fillRect(8, 20, 16, 8);
  ctx.fillRect(6, 22, 20, 4);

  // Belly
  ctx.fillStyle = '#d0b880';
  ctx.fillRect(10, 22, 12, 4);

  // Legs
  ctx.fillStyle = '#b09060';
  ctx.fillRect(10, 28, 3, 3);
  ctx.fillRect(19, 28, 3, 3);
  // Feet
  ctx.fillStyle = '#d0a050';
  ctx.fillRect(8, 30, 4, 2);
  ctx.fillRect(18, 30, 4, 2);

  // Left neck
  ctx.fillStyle = '#b09060';
  ctx.fillRect(8, 8, 4, 14);
  ctx.fillRect(7, 10, 6, 10);

  // Right neck
  ctx.fillStyle = '#b09060';
  ctx.fillRect(20, 8, 4, 14);
  ctx.fillRect(19, 10, 6, 10);

  // Left head
  ctx.fillStyle = '#b09060';
  ctx.fillRect(5, 2, 10, 8);
  ctx.fillRect(4, 4, 12, 5);

  // Right head
  ctx.fillStyle = '#b09060';
  ctx.fillRect(17, 2, 10, 8);
  ctx.fillRect(16, 4, 12, 5);

  // Beaks
  ctx.fillStyle = '#d0a050';
  ctx.fillRect(3, 6, 3, 2);
  ctx.fillRect(26, 6, 3, 2);

  // Head crests
  ctx.fillStyle = '#302020';
  ctx.fillRect(8, 0, 4, 3);
  ctx.fillRect(20, 0, 4, 3);

  if (!isBack) {
    // Left eye
    ctx.fillStyle = '#302020';
    ctx.fillRect(7, 4, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 4, 2, 2);
    // Right eye
    ctx.fillStyle = '#302020';
    ctx.fillRect(22, 4, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(22, 4, 2, 2);
  } else {
    // Back head shading
    ctx.fillStyle = '#987848';
    ctx.fillRect(6, 4, 8, 4);
    ctx.fillRect(18, 4, 8, 4);
    // Back neck shading
    ctx.fillStyle = '#987848';
    ctx.fillRect(9, 12, 2, 6);
    ctx.fillRect(21, 12, 2, 6);
  }
};
