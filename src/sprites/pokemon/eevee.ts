import { CustomSpriteDrawFn } from '../types';

export const eevee: CustomSpriteDrawFn = (ctx, isBack) => {
  // Eevee - brown fluffy fox, big cream neck ruff, bushy tail, big ears

  // Cream neck ruff/collar - big and fluffy
  ctx.fillStyle = '#e8d8b8';
  ctx.fillRect(8, 12, 16, 8);
  ctx.fillRect(6, 14, 20, 4);
  ctx.fillRect(10, 10, 12, 4);

  // Body
  ctx.fillStyle = '#b08858';
  ctx.fillRect(10, 18, 12, 8);
  ctx.fillRect(8, 20, 16, 4);

  // Head
  ctx.fillRect(10, 4, 12, 10);
  ctx.fillRect(8, 6, 16, 6);

  // Big ears
  ctx.fillStyle = '#b08858';
  ctx.fillRect(6, 0, 5, 8);
  ctx.fillRect(21, 0, 5, 8);
  // Inner ears
  ctx.fillStyle = '#d0b888';
  ctx.fillRect(8, 2, 2, 4);
  ctx.fillRect(22, 2, 2, 4);

  // Big bushy tail
  ctx.fillStyle = '#e8d8b8';
  ctx.fillRect(22, 14, 6, 4);
  ctx.fillRect(24, 10, 5, 8);
  ctx.fillRect(26, 8, 4, 10);
  ctx.fillRect(28, 10, 3, 6);

  // Legs
  ctx.fillStyle = '#b08858';
  ctx.fillRect(10, 26, 4, 4);
  ctx.fillRect(18, 26, 4, 4);
  // Paws
  ctx.fillStyle = '#986838';
  ctx.fillRect(10, 29, 4, 2);
  ctx.fillRect(18, 29, 4, 2);

  if (!isBack) {
    // Big cute eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(11, 7, 3, 4);
    ctx.fillRect(18, 7, 3, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 7, 2, 2);
    ctx.fillRect(18, 7, 2, 2);
    // Nose
    ctx.fillStyle = '#302020';
    ctx.fillRect(15, 10, 2, 2);
    // Mouth
    ctx.fillRect(14, 12, 1, 1);
    ctx.fillRect(17, 12, 1, 1);
  } else {
    // Back - fluffy texture
    ctx.fillStyle = '#a07848';
    ctx.fillRect(12, 8, 8, 6);
    ctx.fillStyle = '#e0d0a8';
    ctx.fillRect(12, 12, 8, 4);
  }
};
