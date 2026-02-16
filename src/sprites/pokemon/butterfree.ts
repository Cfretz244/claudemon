import { CustomSpriteDrawFn } from '../types';

export const butterfree: CustomSpriteDrawFn = (ctx, isBack) => {
  // Butterfree - butterfly with large purple-white wings

  // Left wing (upper)
  ctx.fillStyle = '#e0d0f0';
  ctx.fillRect(1, 4, 12, 10);
  ctx.fillRect(0, 6, 13, 7);
  // Left wing purple accent
  ctx.fillStyle = '#a080c0';
  ctx.fillRect(2, 5, 4, 4);
  ctx.fillRect(1, 7, 3, 3);

  // Right wing (upper)
  ctx.fillStyle = '#e0d0f0';
  ctx.fillRect(19, 4, 12, 10);
  ctx.fillRect(19, 6, 13, 7);
  // Right wing purple accent
  ctx.fillStyle = '#a080c0';
  ctx.fillRect(26, 5, 4, 4);
  ctx.fillRect(28, 7, 3, 3);

  // Left lower wing
  ctx.fillStyle = '#e0d0f0';
  ctx.fillRect(2, 16, 10, 8);
  ctx.fillRect(1, 18, 10, 5);
  ctx.fillStyle = '#a080c0';
  ctx.fillRect(3, 18, 4, 4);

  // Right lower wing
  ctx.fillStyle = '#e0d0f0';
  ctx.fillRect(20, 16, 10, 8);
  ctx.fillRect(21, 18, 10, 5);
  ctx.fillStyle = '#a080c0';
  ctx.fillRect(25, 18, 4, 4);

  // Body - small dark center
  ctx.fillStyle = '#403060';
  ctx.fillRect(14, 8, 4, 14);
  ctx.fillRect(13, 10, 6, 10);

  // Head
  ctx.fillStyle = '#403060';
  ctx.fillRect(12, 4, 8, 6);
  ctx.fillRect(11, 5, 10, 4);

  // Antennae
  ctx.fillStyle = '#302020';
  ctx.fillRect(12, 1, 1, 4);
  ctx.fillRect(19, 1, 1, 4);
  ctx.fillRect(11, 0, 2, 2);
  ctx.fillRect(19, 0, 2, 2);

  if (!isBack) {
    // Red compound eyes
    ctx.fillStyle = '#e03030';
    ctx.fillRect(12, 5, 3, 3);
    ctx.fillRect(17, 5, 3, 3);
    // Eye highlight
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(12, 5, 1, 1);
    ctx.fillRect(17, 5, 1, 1);
    // Tiny mouth
    ctx.fillStyle = '#604080';
    ctx.fillRect(14, 8, 4, 1);
  } else {
    // Back: just body and wings, more wing detail
    ctx.fillStyle = '#a080c0';
    ctx.fillRect(5, 8, 3, 3);
    ctx.fillRect(24, 8, 3, 3);
    ctx.fillStyle = '#d0c0e8';
    ctx.fillRect(3, 10, 4, 2);
    ctx.fillRect(25, 10, 4, 2);
  }

  // Feet/lower body
  ctx.fillStyle = '#403060';
  ctx.fillRect(13, 22, 2, 4);
  ctx.fillRect(17, 22, 2, 4);

  // Wing edge dark outlines (subtle)
  ctx.fillStyle = '#8060a0';
  ctx.fillRect(0, 13, 13, 1);
  ctx.fillRect(19, 13, 13, 1);
};
