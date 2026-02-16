import { CustomSpriteDrawFn } from '../types';

export const exeggutor: CustomSpriteDrawFn = (ctx, isBack) => {
  // Exeggutor - tall palm tree trunk body, 3 coconut heads on top

  // Trunk body - tall brown
  ctx.fillStyle = '#a08050';
  ctx.fillRect(12, 12, 8, 16);
  ctx.fillRect(11, 14, 10, 12);
  ctx.fillRect(10, 20, 12, 6);

  // Trunk texture
  ctx.fillStyle = '#907040';
  ctx.fillRect(12, 16, 8, 2);
  ctx.fillRect(12, 22, 8, 2);

  // Feet
  ctx.fillStyle = '#907040';
  ctx.fillRect(9, 26, 5, 3);
  ctx.fillRect(18, 26, 5, 3);

  // Palm leaves on top
  ctx.fillStyle = '#78a830';
  ctx.fillRect(2, 1, 6, 3);
  ctx.fillRect(0, 3, 4, 2);
  ctx.fillRect(24, 1, 6, 3);
  ctx.fillRect(28, 3, 4, 2);
  ctx.fillRect(12, 0, 8, 2);
  ctx.fillRect(10, 1, 4, 2);
  ctx.fillRect(18, 1, 4, 2);

  // Three coconut heads
  // Left head
  ctx.fillStyle = '#78a830';
  ctx.fillRect(3, 4, 8, 8);
  ctx.fillRect(4, 3, 6, 10);
  // Center head
  ctx.fillRect(11, 3, 10, 9);
  ctx.fillRect(12, 2, 8, 11);
  // Right head
  ctx.fillRect(21, 5, 8, 8);
  ctx.fillRect(22, 4, 6, 10);

  if (!isBack) {
    // Left head face
    ctx.fillStyle = '#302020';
    ctx.fillRect(5, 7, 2, 2);
    ctx.fillRect(8, 7, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(5, 7, 1, 1);
    ctx.fillRect(8, 7, 1, 1);
    // Center head face
    ctx.fillStyle = '#302020';
    ctx.fillRect(13, 6, 2, 2);
    ctx.fillRect(17, 6, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(13, 6, 1, 1);
    ctx.fillRect(17, 6, 1, 1);
    // Right head face
    ctx.fillStyle = '#302020';
    ctx.fillRect(23, 8, 2, 2);
    ctx.fillRect(26, 8, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(23, 8, 1, 1);
    ctx.fillRect(26, 8, 1, 1);
  } else {
    // Back shading on heads
    ctx.fillStyle = '#689020';
    ctx.fillRect(5, 6, 4, 4);
    ctx.fillRect(13, 5, 6, 4);
    ctx.fillRect(23, 7, 4, 4);
  }
};
