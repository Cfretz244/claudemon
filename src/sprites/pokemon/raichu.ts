import { CustomSpriteDrawFn } from '../types';

export const raichu: CustomSpriteDrawFn = (ctx, isBack) => {
  // Body - larger than Pikachu, orange-brown
  ctx.fillStyle = '#d08030';
  ctx.fillRect(8, 12, 16, 12);
  ctx.fillRect(6, 14, 20, 8);

  // Head
  ctx.fillStyle = '#d08030';
  ctx.fillRect(7, 6, 18, 10);
  ctx.fillRect(9, 4, 14, 4);

  // White belly
  ctx.fillStyle = '#f8f0d0';
  ctx.fillRect(10, 16, 12, 6);

  // Ears - bigger, rounder than Pikachu
  ctx.fillStyle = '#d08030';
  ctx.fillRect(5, 0, 6, 8);
  ctx.fillRect(21, 0, 6, 8);
  // Brown ear tips
  ctx.fillStyle = '#905020';
  ctx.fillRect(5, 0, 6, 3);
  ctx.fillRect(21, 0, 6, 3);
  // Inner ear
  ctx.fillStyle = '#f8d868';
  ctx.fillRect(7, 3, 2, 4);
  ctx.fillRect(23, 3, 2, 4);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 8, 4, 4);
    ctx.fillRect(18, 8, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 8, 2, 2);
    ctx.fillRect(18, 8, 2, 2);
    // Yellow cheek patches
    ctx.fillStyle = '#f8d030';
    ctx.fillRect(6, 12, 4, 3);
    ctx.fillRect(22, 12, 4, 3);
    // Nose/mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(15, 12, 2, 1);
  } else {
    // Back darker stripe
    ctx.fillStyle = '#b06820';
    ctx.fillRect(10, 10, 12, 10);
    ctx.fillStyle = '#905020';
    ctx.fillRect(12, 12, 8, 6);
  }

  // Arms
  ctx.fillStyle = '#d08030';
  ctx.fillRect(4, 16, 4, 4);
  ctx.fillRect(24, 16, 4, 4);

  // Feet - brown
  ctx.fillStyle = '#905020';
  ctx.fillRect(8, 24, 6, 4);
  ctx.fillRect(18, 24, 6, 4);

  // Long thin tail with lightning bolt tip
  ctx.fillStyle = '#905020';
  ctx.fillRect(26, 18, 2, 2);
  ctx.fillRect(28, 16, 2, 2);
  ctx.fillRect(30, 14, 2, 2);
  // Lightning bolt tip
  ctx.fillStyle = '#f8d030';
  ctx.fillRect(28, 10, 4, 5);
  ctx.fillRect(26, 12, 3, 3);
};
