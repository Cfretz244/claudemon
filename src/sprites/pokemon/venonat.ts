import { CustomSpriteDrawFn } from '../types';

export const venonat: CustomSpriteDrawFn = (ctx, isBack) => {
  // Venonat - round purple fuzzy body, big red compound eyes, antennae

  // Round fuzzy body
  ctx.fillStyle = '#8058a0';
  ctx.fillRect(6, 12, 20, 16);
  ctx.fillRect(4, 14, 24, 12);
  ctx.fillRect(8, 10, 16, 2);

  // Fuzzy texture tufts
  ctx.fillStyle = '#9068b0';
  ctx.fillRect(7, 13, 3, 2);
  ctx.fillRect(15, 11, 4, 2);
  ctx.fillRect(22, 15, 3, 2);
  ctx.fillRect(8, 22, 3, 2);
  ctx.fillRect(20, 22, 3, 2);

  // Antennae
  ctx.fillStyle = '#8058a0';
  ctx.fillRect(10, 5, 2, 6);
  ctx.fillRect(20, 5, 2, 6);
  // Antenna tips
  ctx.fillStyle = '#9068b0';
  ctx.fillRect(9, 3, 4, 3);
  ctx.fillRect(19, 3, 4, 3);

  // Small feet
  ctx.fillStyle = '#604080';
  ctx.fillRect(6, 27, 5, 3);
  ctx.fillRect(21, 27, 5, 3);

  // Small hands
  ctx.fillStyle = '#604080';
  ctx.fillRect(2, 18, 4, 4);
  ctx.fillRect(26, 18, 4, 4);

  if (!isBack) {
    // Big red compound eyes
    ctx.fillStyle = '#e03030';
    ctx.fillRect(7, 12, 8, 7);
    ctx.fillRect(17, 12, 8, 7);
    // Eye shine
    ctx.fillStyle = '#f06060';
    ctx.fillRect(8, 13, 3, 3);
    ctx.fillRect(18, 13, 3, 3);
    // Eye dark pupil center
    ctx.fillStyle = '#302020';
    ctx.fillRect(12, 15, 2, 2);
    ctx.fillRect(22, 15, 2, 2);
    // Eye highlight
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(8, 13, 2, 2);
    ctx.fillRect(18, 13, 2, 2);
  } else {
    // Back fuzzy markings
    ctx.fillStyle = '#604080';
    ctx.fillRect(10, 14, 12, 8);
    ctx.fillStyle = '#9068b0';
    ctx.fillRect(12, 16, 3, 2);
    ctx.fillRect(17, 18, 3, 2);
  }
};
