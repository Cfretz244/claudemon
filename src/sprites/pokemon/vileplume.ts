import { CustomSpriteDrawFn } from '../types';

export const vileplume: CustomSpriteDrawFn = (ctx, isBack) => {
  // Vileplume - blue body beneath massive red flower with white spots

  // Massive flower - fills top half
  ctx.fillStyle = '#c03838';
  ctx.fillRect(2, 2, 28, 12);
  ctx.fillRect(0, 4, 32, 8);
  ctx.fillRect(4, 0, 24, 3);
  ctx.fillRect(4, 13, 24, 3);

  // Flower petal edges (5 petals shape)
  ctx.fillRect(0, 6, 3, 4);
  ctx.fillRect(29, 6, 3, 4);
  ctx.fillRect(6, 0, 6, 2);
  ctx.fillRect(20, 0, 6, 2);

  // White spots on flower
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(4, 4, 3, 3);
  ctx.fillRect(12, 3, 3, 3);
  ctx.fillRect(25, 4, 3, 3);
  ctx.fillRect(8, 8, 3, 3);
  ctx.fillRect(18, 2, 3, 3);
  ctx.fillRect(21, 8, 3, 3);

  // Flower center
  ctx.fillStyle = '#d87040';
  ctx.fillRect(12, 6, 8, 6);
  ctx.fillRect(14, 5, 4, 2);

  // Body - blue, under flower
  ctx.fillStyle = '#4868a0';
  ctx.fillRect(10, 14, 12, 12);
  ctx.fillRect(8, 16, 16, 8);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(11, 17, 3, 3);
    ctx.fillRect(18, 17, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 17, 2, 2);
    ctx.fillRect(18, 17, 2, 2);
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(13, 22, 6, 1);
  } else {
    // Back: flower dominates, body below
    ctx.fillStyle = '#385898';
    ctx.fillRect(12, 16, 8, 6);
  }

  // Feet
  ctx.fillStyle = '#385898';
  ctx.fillRect(9, 26, 5, 4);
  ctx.fillRect(18, 26, 5, 4);

  // Arms (small, mostly hidden by flower)
  ctx.fillStyle = '#4868a0';
  ctx.fillRect(6, 18, 3, 4);
  ctx.fillRect(23, 18, 3, 4);
};
