import { CustomSpriteDrawFn } from '../types';

export const diglett: CustomSpriteDrawFn = (ctx, isBack) => {
  // Diglett - brown bump poking out of ground, pink nose

  // Ground / dirt
  ctx.fillStyle = '#705838';
  ctx.fillRect(0, 22, 32, 10);
  ctx.fillRect(2, 20, 28, 2);
  // Ground texture
  ctx.fillStyle = '#604828';
  ctx.fillRect(4, 24, 6, 2);
  ctx.fillRect(18, 26, 8, 2);
  ctx.fillRect(1, 28, 4, 2);
  ctx.fillRect(26, 24, 4, 2);

  // Dirt mound around Diglett
  ctx.fillStyle = '#806840';
  ctx.fillRect(6, 19, 20, 4);
  ctx.fillRect(4, 20, 24, 3);

  // Body - brown poking up
  ctx.fillStyle = '#8b6840';
  ctx.fillRect(10, 10, 12, 12);
  ctx.fillRect(12, 8, 8, 3);
  ctx.fillRect(8, 12, 16, 8);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(12, 11, 2, 3);
    ctx.fillRect(19, 11, 2, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(12, 11, 1, 2);
    ctx.fillRect(19, 11, 1, 2);

    // Pink nose
    ctx.fillStyle = '#e0a0a0';
    ctx.fillRect(15, 15, 3, 2);
  } else {
    // Back - just the brown bump
    ctx.fillStyle = '#7a5830';
    ctx.fillRect(12, 10, 8, 8);
  }
};
