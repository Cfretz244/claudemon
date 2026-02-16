import { CustomSpriteDrawFn } from '../types';

export const cubone: CustomSpriteDrawFn = (ctx, isBack) => {
  // Cubone - small brown body, white skull helmet, holding bone club

  // Body
  ctx.fillStyle = '#b09050';
  ctx.fillRect(10, 16, 12, 10);
  ctx.fillRect(8, 18, 16, 6);

  // Belly lighter
  ctx.fillStyle = '#c8a868';
  ctx.fillRect(12, 18, 8, 6);

  // Skull helmet
  ctx.fillStyle = '#e8e0d0';
  ctx.fillRect(8, 6, 16, 12);
  ctx.fillRect(6, 8, 20, 8);
  ctx.fillRect(10, 5, 12, 2);

  // Skull ridges
  ctx.fillStyle = '#d0c8b8';
  ctx.fillRect(10, 5, 4, 3);
  ctx.fillRect(18, 5, 4, 3);

  // Arms
  ctx.fillStyle = '#b09050';
  ctx.fillRect(6, 18, 4, 3);
  ctx.fillRect(22, 17, 4, 3);

  // Bone club (held in right hand)
  ctx.fillStyle = '#e8e0d0';
  ctx.fillRect(24, 10, 3, 10);
  // Bone knobs
  ctx.fillRect(23, 9, 5, 3);
  ctx.fillRect(23, 19, 5, 3);

  // Feet
  ctx.fillStyle = '#b09050';
  ctx.fillRect(10, 26, 4, 3);
  ctx.fillRect(18, 26, 4, 3);

  if (!isBack) {
    // Eye holes in skull
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 10, 4, 4);
    ctx.fillRect(18, 10, 4, 4);
    // Eyes inside
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 11, 2, 2);
    ctx.fillRect(19, 11, 2, 2);
    // Mouth/teeth
    ctx.fillStyle = '#d0c8b8';
    ctx.fillRect(12, 15, 8, 2);
    ctx.fillStyle = '#302020';
    ctx.fillRect(14, 15, 1, 2);
    ctx.fillRect(17, 15, 1, 2);
  } else {
    // Back of skull
    ctx.fillStyle = '#d0c8b8';
    ctx.fillRect(10, 8, 12, 8);
  }
};
