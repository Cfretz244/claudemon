import { CustomSpriteDrawFn } from '../types';

export const hitmonlee: CustomSpriteDrawFn = (ctx, isBack) => {
  // Hitmonlee - brown body, very long extending legs, small upper body

  // Small upper body/head
  ctx.fillStyle = '#b09060';
  ctx.fillRect(12, 4, 8, 8);
  ctx.fillRect(10, 6, 12, 6);

  // Torso - narrow
  ctx.fillStyle = '#b09060';
  ctx.fillRect(12, 12, 8, 6);
  ctx.fillRect(11, 14, 10, 3);

  // Arms
  ctx.fillStyle = '#b09060';
  ctx.fillRect(6, 12, 5, 3);
  ctx.fillRect(21, 12, 5, 3);
  // Fists
  ctx.fillStyle = '#c0a070';
  ctx.fillRect(4, 12, 3, 3);
  ctx.fillRect(25, 12, 3, 3);

  // Very long legs
  ctx.fillStyle = '#b09060';
  // Left leg
  ctx.fillRect(10, 17, 4, 4);
  ctx.fillRect(9, 21, 4, 4);
  ctx.fillRect(8, 25, 4, 4);
  // Right leg - extended in kick pose
  ctx.fillRect(18, 17, 4, 4);
  ctx.fillRect(20, 21, 4, 4);
  ctx.fillRect(22, 25, 4, 4);

  // Feet - springy pad
  ctx.fillStyle = '#c0a070';
  ctx.fillRect(6, 28, 6, 3);
  ctx.fillRect(22, 28, 6, 3);

  // Leg joints
  ctx.fillStyle = '#987848';
  ctx.fillRect(10, 20, 3, 2);
  ctx.fillRect(20, 20, 3, 2);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(13, 7, 2, 2);
    ctx.fillRect(17, 7, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(13, 7, 1, 1);
    ctx.fillRect(17, 7, 1, 1);
    // Forehead crease
    ctx.fillStyle = '#987848';
    ctx.fillRect(12, 5, 8, 1);
  } else {
    // Back shading
    ctx.fillStyle = '#987848';
    ctx.fillRect(13, 7, 6, 4);
    ctx.fillRect(13, 13, 6, 3);
  }
};
