import { CustomSpriteDrawFn } from '../types';

export const wigglytuff: CustomSpriteDrawFn = (ctx, isBack) => {
  // Wigglytuff - larger pink, rabbit-like ears, very big eyes, rounder body

  // Large round body
  ctx.fillStyle = '#f898a8';
  ctx.fillRect(6, 12, 20, 16);
  ctx.fillRect(4, 14, 24, 12);
  ctx.fillRect(8, 10, 16, 3);
  ctx.fillRect(8, 28, 16, 2);

  // Head (merged with body, round)
  ctx.fillStyle = '#f898a8';
  ctx.fillRect(7, 6, 18, 8);
  ctx.fillRect(5, 8, 22, 4);

  // Rabbit-like ears - tall
  ctx.fillStyle = '#f898a8';
  ctx.fillRect(7, 0, 5, 7);
  ctx.fillRect(20, 0, 5, 7);
  // Inner ear
  ctx.fillStyle = '#e07888';
  ctx.fillRect(8, 1, 3, 4);
  ctx.fillRect(21, 1, 3, 4);

  // White belly
  ctx.fillStyle = '#f8d0d8';
  ctx.fillRect(10, 18, 12, 8);
  ctx.fillRect(12, 16, 8, 2);

  if (!isBack) {
    // Very big eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(8, 8, 6, 5);
    ctx.fillRect(18, 8, 6, 5);
    // Blue-green iris
    ctx.fillStyle = '#50b0a0';
    ctx.fillRect(9, 8, 4, 3);
    ctx.fillRect(19, 8, 4, 3);
    // Eye highlight
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(9, 8, 2, 2);
    ctx.fillRect(19, 8, 2, 2);
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(13, 14, 6, 1);
  } else {
    // Back view: ears and round body
    ctx.fillStyle = '#e07888';
    ctx.fillRect(11, 8, 10, 6);
  }

  // Tiny feet
  ctx.fillStyle = '#e07888';
  ctx.fillRect(9, 29, 5, 3);
  ctx.fillRect(18, 29, 5, 3);

  // Small arms
  ctx.fillStyle = '#f898a8';
  ctx.fillRect(3, 16, 3, 5);
  ctx.fillRect(26, 16, 3, 5);
};
