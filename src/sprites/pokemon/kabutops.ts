import { CustomSpriteDrawFn } from '../types';

export const kabutops: CustomSpriteDrawFn = (ctx, isBack) => {
  // Dome head
  ctx.fillStyle = '#908050';
  ctx.fillRect(9, 1, 14, 10);
  ctx.fillRect(7, 3, 18, 6);
  ctx.fillRect(11, 0, 10, 2);

  // Head ridge
  ctx.fillStyle = '#786840';
  ctx.fillRect(14, 0, 4, 8);

  // Head highlight
  ctx.fillStyle = '#a89868';
  ctx.fillRect(9, 2, 5, 3);

  // Body - torso
  ctx.fillStyle = '#908050';
  ctx.fillRect(10, 10, 12, 10);
  ctx.fillRect(12, 9, 8, 2);

  // Belly
  ctx.fillStyle = '#c0a870';
  ctx.fillRect(12, 12, 8, 7);

  // Scythe arms - left
  ctx.fillStyle = '#a09860';
  ctx.fillRect(2, 8, 8, 4);
  ctx.fillRect(0, 6, 6, 4);
  // Left scythe blade
  ctx.fillStyle = '#b8b070';
  ctx.fillRect(0, 5, 4, 3);
  ctx.fillRect(0, 4, 2, 2);

  // Scythe arms - right
  ctx.fillStyle = '#a09860';
  ctx.fillRect(22, 8, 8, 4);
  ctx.fillRect(26, 6, 6, 4);
  // Right scythe blade
  ctx.fillStyle = '#b8b070';
  ctx.fillRect(28, 5, 4, 3);
  ctx.fillRect(30, 4, 2, 2);

  // Legs
  ctx.fillStyle = '#908050';
  ctx.fillRect(10, 20, 5, 8);
  ctx.fillRect(17, 20, 5, 8);

  // Feet
  ctx.fillStyle = '#786840';
  ctx.fillRect(9, 27, 7, 3);
  ctx.fillRect(16, 27, 7, 3);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#c03030';
    ctx.fillRect(10, 4, 4, 3);
    ctx.fillRect(18, 4, 4, 3);
    ctx.fillStyle = '#302020';
    ctx.fillRect(12, 5, 2, 2);
    ctx.fillRect(20, 5, 2, 2);
    // Mouth
    ctx.fillStyle = '#786840';
    ctx.fillRect(13, 8, 6, 2);
  } else {
    // Back: dome and spine ridge
    ctx.fillStyle = '#786840';
    ctx.fillRect(14, 0, 4, 20);
    ctx.fillStyle = '#a09860';
    ctx.fillRect(13, 10, 6, 2);
  }
};
