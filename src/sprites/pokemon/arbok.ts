import { CustomSpriteDrawFn } from '../types';

export const arbok: CustomSpriteDrawFn = (ctx, isBack) => {
  // Coiled lower body
  ctx.fillStyle = '#a058a0';
  ctx.fillRect(4, 22, 24, 8);
  ctx.fillRect(2, 24, 28, 4);

  // Middle body
  ctx.fillStyle = '#a058a0';
  ctx.fillRect(10, 16, 14, 8);

  // Expanded cobra hood
  ctx.fillStyle = '#a058a0';
  ctx.fillRect(4, 4, 24, 14);
  ctx.fillRect(2, 6, 28, 10);

  // Head on top of hood
  ctx.fillStyle = '#a058a0';
  ctx.fillRect(10, 0, 12, 6);
  ctx.fillRect(8, 2, 16, 3);

  // Hood pattern - face-like markings
  ctx.fillStyle = '#d8b030';
  ctx.fillRect(8, 8, 4, 4);
  ctx.fillRect(20, 8, 4, 4);
  ctx.fillRect(12, 12, 8, 3);
  ctx.fillRect(14, 10, 4, 2);

  // Dark hood outline
  ctx.fillStyle = '#804080';
  ctx.fillRect(4, 6, 2, 10);
  ctx.fillRect(26, 6, 2, 10);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(12, 1, 3, 3);
    ctx.fillRect(19, 1, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(12, 1, 2, 2);
    ctx.fillRect(19, 1, 2, 2);
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(14, 4, 4, 1);
    // Tongue
    ctx.fillStyle = '#d04040';
    ctx.fillRect(15, 5, 2, 2);
    ctx.fillRect(14, 7, 1, 1);
    ctx.fillRect(17, 7, 1, 1);
  } else {
    // Back of hood - dark coloring
    ctx.fillStyle = '#804080';
    ctx.fillRect(6, 5, 20, 12);
    ctx.fillStyle = '#a058a0';
    ctx.fillRect(8, 6, 16, 10);
    // Back diamond pattern
    ctx.fillStyle = '#804080';
    ctx.fillRect(14, 8, 4, 4);
    ctx.fillRect(15, 7, 2, 6);
  }

  // Belly on coils
  ctx.fillStyle = '#d8b030';
  ctx.fillRect(12, 24, 8, 3);
};
