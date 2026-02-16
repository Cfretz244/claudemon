import { CustomSpriteDrawFn } from '../types';

export const machop: CustomSpriteDrawFn = (ctx, isBack) => {
  // Machop - small gray humanoid, 3 ridges on head, muscular for size

  // Body
  ctx.fillStyle = '#8090a0';
  ctx.fillRect(9, 12, 14, 12);
  ctx.fillRect(7, 14, 18, 8);

  // Head
  ctx.fillStyle = '#8090a0';
  ctx.fillRect(9, 4, 14, 10);
  ctx.fillRect(7, 6, 18, 6);

  // Three ridges on top of head
  ctx.fillStyle = '#607080';
  ctx.fillRect(11, 2, 3, 4);
  ctx.fillRect(15, 1, 3, 5);
  ctx.fillRect(19, 2, 3, 4);

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
    // Back ridge line
    ctx.fillStyle = '#607080';
    ctx.fillRect(14, 6, 4, 10);
  }

  // Muscular arms
  ctx.fillStyle = '#8090a0';
  ctx.fillRect(4, 13, 5, 7);
  ctx.fillRect(23, 13, 5, 7);
  // Bicep highlights
  ctx.fillStyle = '#90a0b0';
  ctx.fillRect(5, 14, 3, 3);
  ctx.fillRect(24, 14, 3, 3);

  // Legs
  ctx.fillStyle = '#8090a0';
  ctx.fillRect(9, 24, 5, 4);
  ctx.fillRect(18, 24, 5, 4);
  // Feet
  ctx.fillStyle = '#607080';
  ctx.fillRect(8, 27, 6, 3);
  ctx.fillRect(17, 27, 6, 3);

  // Tail
  ctx.fillStyle = '#8090a0';
  ctx.fillRect(24, 20, 3, 3);
  ctx.fillRect(26, 18, 3, 3);
};
