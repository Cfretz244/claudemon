import { CustomSpriteDrawFn } from '../types';

export const gloom: CustomSpriteDrawFn = (ctx, isBack) => {
  // Gloom - blue body, wilting red flower on head, drool drops

  // Wilting red flower on head
  ctx.fillStyle = '#c04040';
  ctx.fillRect(6, 2, 6, 5);
  ctx.fillRect(12, 1, 6, 5);
  ctx.fillRect(18, 2, 6, 5);
  ctx.fillRect(10, 0, 4, 3);
  ctx.fillRect(18, 0, 4, 3);
  // Flower center
  ctx.fillStyle = '#d87040';
  ctx.fillRect(12, 3, 8, 4);
  ctx.fillRect(14, 2, 4, 2);

  // Flower stem/connection
  ctx.fillStyle = '#5070a0';
  ctx.fillRect(13, 6, 6, 3);

  // Body - blue
  ctx.fillStyle = '#5070a0';
  ctx.fillRect(8, 9, 16, 14);
  ctx.fillRect(6, 11, 20, 10);
  ctx.fillRect(10, 8, 12, 2);

  if (!isBack) {
    // Eyes - droopy
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 13, 3, 3);
    ctx.fillRect(19, 13, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 13, 2, 2);
    ctx.fillRect(19, 13, 2, 2);
    // Mouth - open, drooling
    ctx.fillStyle = '#302020';
    ctx.fillRect(13, 18, 6, 2);
    // Drool drops
    ctx.fillStyle = '#88c8e8';
    ctx.fillRect(13, 20, 2, 3);
    ctx.fillRect(17, 20, 2, 4);
    ctx.fillRect(15, 20, 2, 2);
  } else {
    // Back: flower and body
    ctx.fillStyle = '#406090';
    ctx.fillRect(11, 11, 10, 6);
  }

  // Small feet
  ctx.fillStyle = '#406090';
  ctx.fillRect(9, 23, 4, 4);
  ctx.fillRect(19, 23, 4, 4);

  // Arms/hands
  ctx.fillStyle = '#5070a0';
  ctx.fillRect(4, 14, 3, 5);
  ctx.fillRect(25, 14, 3, 5);
};
