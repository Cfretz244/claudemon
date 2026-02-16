import { CustomSpriteDrawFn } from '../types';

export const dugtrio: CustomSpriteDrawFn = (ctx, isBack) => {
  // Dugtrio - three Diglett heads side by side poking from ground

  // Ground / dirt
  ctx.fillStyle = '#705838';
  ctx.fillRect(0, 22, 32, 10);
  ctx.fillRect(1, 20, 30, 2);
  // Ground texture
  ctx.fillStyle = '#604828';
  ctx.fillRect(2, 26, 5, 2);
  ctx.fillRect(14, 28, 6, 2);
  ctx.fillRect(24, 25, 5, 2);

  // Dirt mound
  ctx.fillStyle = '#806840';
  ctx.fillRect(2, 19, 28, 4);
  ctx.fillRect(0, 21, 32, 2);

  // Left head
  ctx.fillStyle = '#8b6840';
  ctx.fillRect(1, 10, 10, 10);
  ctx.fillRect(3, 8, 6, 3);

  // Center head (taller)
  ctx.fillStyle = '#8b6840';
  ctx.fillRect(11, 6, 10, 14);
  ctx.fillRect(13, 4, 6, 3);

  // Right head
  ctx.fillStyle = '#8b6840';
  ctx.fillRect(21, 10, 10, 10);
  ctx.fillRect(23, 8, 6, 3);

  if (!isBack) {
    // Left head eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(3, 11, 2, 2);
    ctx.fillRect(7, 11, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(3, 11, 1, 1);
    ctx.fillRect(7, 11, 1, 1);
    // Left nose
    ctx.fillStyle = '#e0a0a0';
    ctx.fillRect(5, 14, 2, 2);

    // Center head eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(13, 8, 2, 2);
    ctx.fillRect(18, 8, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(13, 8, 1, 1);
    ctx.fillRect(18, 8, 1, 1);
    // Center nose
    ctx.fillStyle = '#e0a0a0';
    ctx.fillRect(15, 11, 2, 2);

    // Right head eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(23, 11, 2, 2);
    ctx.fillRect(27, 11, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(23, 11, 1, 1);
    ctx.fillRect(27, 11, 1, 1);
    // Right nose
    ctx.fillStyle = '#e0a0a0';
    ctx.fillRect(25, 14, 2, 2);
  } else {
    // Back - three brown bumps
    ctx.fillStyle = '#7a5830';
    ctx.fillRect(3, 11, 6, 6);
    ctx.fillRect(13, 7, 6, 8);
    ctx.fillRect(23, 11, 6, 6);
  }
};
