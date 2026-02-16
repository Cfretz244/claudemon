import { CustomSpriteDrawFn } from '../types';

export const flareon: CustomSpriteDrawFn = (ctx, isBack) => {
  // Flareon - orange fluffy, big cream mane around neck, bushy tail

  // Big cream mane/ruff
  ctx.fillStyle = '#f0d898';
  ctx.fillRect(6, 10, 18, 8);
  ctx.fillRect(4, 12, 22, 4);
  ctx.fillRect(8, 8, 14, 4);
  ctx.fillRect(10, 6, 10, 4);

  // Body
  ctx.fillStyle = '#e08838';
  ctx.fillRect(10, 16, 12, 8);
  ctx.fillRect(8, 18, 16, 4);

  // Head
  ctx.fillRect(10, 2, 12, 10);
  ctx.fillRect(8, 4, 16, 6);

  // Fluffy ears
  ctx.fillStyle = '#e08838';
  ctx.fillRect(6, 0, 5, 6);
  ctx.fillRect(21, 0, 5, 6);
  // Inner ears
  ctx.fillStyle = '#d07030';
  ctx.fillRect(8, 2, 2, 3);
  ctx.fillRect(22, 2, 2, 3);

  // Big bushy tail - flame-like
  ctx.fillStyle = '#f0d898';
  ctx.fillRect(22, 12, 6, 6);
  ctx.fillRect(24, 8, 5, 10);
  ctx.fillRect(26, 6, 4, 12);
  ctx.fillRect(28, 8, 3, 8);
  // Orange tail tip
  ctx.fillStyle = '#e08838';
  ctx.fillRect(28, 6, 3, 4);
  ctx.fillRect(30, 8, 2, 4);

  // Legs
  ctx.fillStyle = '#e08838';
  ctx.fillRect(10, 24, 4, 5);
  ctx.fillRect(18, 24, 4, 5);
  // Paws
  ctx.fillStyle = '#d07030';
  ctx.fillRect(9, 28, 5, 3);
  ctx.fillRect(17, 28, 5, 3);

  // Forehead tuft
  ctx.fillStyle = '#f0d898';
  ctx.fillRect(14, 0, 4, 4);
  ctx.fillRect(13, 2, 6, 2);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(11, 5, 3, 3);
    ctx.fillRect(18, 5, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 5, 2, 2);
    ctx.fillRect(18, 5, 2, 2);
    // Nose
    ctx.fillStyle = '#302020';
    ctx.fillRect(15, 8, 2, 2);
  } else {
    // Back - mane detail
    ctx.fillStyle = '#e0c888';
    ctx.fillRect(10, 10, 10, 6);
    ctx.fillStyle = '#d0a828';
    ctx.fillRect(12, 12, 6, 4);
  }
};
