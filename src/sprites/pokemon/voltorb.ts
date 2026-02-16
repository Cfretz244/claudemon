import { CustomSpriteDrawFn } from '../types';

export const voltorb: CustomSpriteDrawFn = (ctx, isBack) => {
  // Voltorb - Pokeball-like sphere, red top, white bottom

  // White bottom half
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(8, 16, 16, 8);
  ctx.fillRect(6, 18, 20, 6);
  ctx.fillRect(10, 24, 12, 2);

  // Red top half
  ctx.fillStyle = '#e03030';
  ctx.fillRect(8, 8, 16, 8);
  ctx.fillRect(6, 10, 20, 6);
  ctx.fillRect(10, 6, 12, 4);
  ctx.fillRect(12, 5, 8, 2);

  // Center dividing line (black band)
  ctx.fillStyle = '#302020';
  ctx.fillRect(6, 15, 20, 2);
  ctx.fillRect(8, 15, 16, 2);

  // Center button
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(14, 14, 4, 4);
  ctx.fillStyle = '#302020';
  ctx.fillRect(14, 14, 4, 4);
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(15, 15, 2, 2);

  // Highlight on red
  ctx.fillStyle = '#f04848';
  ctx.fillRect(11, 7, 3, 2);

  if (!isBack) {
    // Angry eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(11, 11, 3, 3);
    ctx.fillRect(18, 11, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 11, 2, 2);
    ctx.fillRect(18, 11, 2, 2);
    // Angry eyebrows
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 9, 4, 1);
    ctx.fillRect(18, 9, 4, 1);
  } else {
    // Back - just the sphere shape
    ctx.fillStyle = '#c02828';
    ctx.fillRect(12, 8, 8, 4);
    ctx.fillStyle = '#d8d8d8';
    ctx.fillRect(12, 18, 8, 4);
  }
};
