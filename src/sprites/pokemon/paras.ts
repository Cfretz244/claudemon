import { CustomSpriteDrawFn } from '../types';

export const paras: CustomSpriteDrawFn = (ctx, isBack) => {
  // Paras - orange bug body with two mushrooms on back

  // Body - orange crab/bug
  ctx.fillStyle = '#e08040';
  ctx.fillRect(8, 18, 16, 8);
  ctx.fillRect(6, 20, 20, 6);

  // Legs - six small legs
  ctx.fillStyle = '#c06830';
  ctx.fillRect(4, 24, 3, 4);
  ctx.fillRect(7, 26, 3, 3);
  ctx.fillRect(22, 24, 3, 4);
  ctx.fillRect(22, 26, 3, 3);
  ctx.fillRect(2, 22, 4, 3);
  ctx.fillRect(26, 22, 4, 3);

  // Pincers / front claws
  ctx.fillStyle = '#c06830';
  ctx.fillRect(5, 18, 4, 3);
  ctx.fillRect(23, 18, 4, 3);

  // Mushroom 1 (left) - red cap
  ctx.fillStyle = '#c03030';
  ctx.fillRect(6, 8, 10, 6);
  ctx.fillRect(8, 6, 6, 2);
  // Mushroom 1 spots
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(8, 9, 2, 2);
  ctx.fillRect(12, 10, 2, 2);
  // Mushroom 1 stem
  ctx.fillStyle = '#e08040';
  ctx.fillRect(10, 14, 3, 4);

  // Mushroom 2 (right) - red cap
  ctx.fillStyle = '#c03030';
  ctx.fillRect(16, 6, 10, 6);
  ctx.fillRect(18, 4, 6, 2);
  // Mushroom 2 spots
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(18, 7, 2, 2);
  ctx.fillRect(22, 8, 2, 2);
  // Mushroom 2 stem
  ctx.fillStyle = '#e08040';
  ctx.fillRect(20, 12, 3, 6);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 19, 3, 3);
    ctx.fillRect(19, 19, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 19, 2, 2);
    ctx.fillRect(19, 19, 2, 2);
  } else {
    // Back view - mushroom caps more prominent
    ctx.fillStyle = '#c03030';
    ctx.fillRect(5, 7, 12, 8);
    ctx.fillRect(15, 5, 12, 8);
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(8, 9, 3, 3);
    ctx.fillRect(19, 7, 3, 3);
  }
};
