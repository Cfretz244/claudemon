import { CustomSpriteDrawFn } from '../types';

export const primeape: CustomSpriteDrawFn = (ctx, isBack) => {
  // Primeape - larger angry beige pig-monkey, shackles on wrists/ankles

  // Round body - larger than Mankey
  ctx.fillStyle = '#d8c8b0';
  ctx.fillRect(4, 8, 24, 16);
  ctx.fillRect(6, 6, 20, 4);
  ctx.fillRect(2, 10, 28, 12);

  // Fur tufts on top (more aggressive)
  ctx.fillStyle = '#d8c8b0';
  ctx.fillRect(10, 2, 5, 5);
  ctx.fillRect(17, 2, 5, 5);
  ctx.fillRect(13, 1, 6, 3);

  // Ears
  ctx.fillStyle = '#d8c8b0';
  ctx.fillRect(2, 6, 5, 5);
  ctx.fillRect(25, 6, 5, 5);
  ctx.fillStyle = '#c0a088';
  ctx.fillRect(3, 7, 3, 3);
  ctx.fillRect(26, 7, 3, 3);

  // Pig snout
  ctx.fillStyle = '#c0a088';
  ctx.fillRect(11, 14, 10, 5);
  ctx.fillRect(12, 13, 8, 1);
  // Nostrils
  ctx.fillStyle = '#302020';
  ctx.fillRect(13, 15, 2, 2);
  ctx.fillRect(17, 15, 2, 2);

  // Arms - bulkier
  ctx.fillStyle = '#d8c8b0';
  ctx.fillRect(0, 12, 4, 8);
  ctx.fillRect(28, 12, 4, 8);
  // Fists
  ctx.fillStyle = '#c0a088';
  ctx.fillRect(0, 19, 4, 4);
  ctx.fillRect(28, 19, 4, 4);

  // Shackles on wrists - metal gray
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 18, 4, 2);
  ctx.fillRect(28, 18, 4, 2);

  // Legs
  ctx.fillStyle = '#d8c8b0';
  ctx.fillRect(6, 24, 6, 5);
  ctx.fillRect(20, 24, 6, 5);
  // Feet
  ctx.fillStyle = '#c0a088';
  ctx.fillRect(6, 27, 6, 3);
  ctx.fillRect(20, 27, 6, 3);

  // Shackles on ankles
  ctx.fillStyle = '#808080';
  ctx.fillRect(6, 25, 6, 2);
  ctx.fillRect(20, 25, 6, 2);

  if (!isBack) {
    // Very angry eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(7, 9, 5, 4);
    ctx.fillRect(20, 9, 5, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(8, 9, 3, 2);
    ctx.fillRect(21, 9, 3, 2);
    // Angry brow - thick, angled
    ctx.fillStyle = '#302020';
    ctx.fillRect(6, 8, 7, 2);
    ctx.fillRect(19, 8, 7, 2);
    // Vein mark on forehead
    ctx.fillStyle = '#c03030';
    ctx.fillRect(14, 5, 4, 2);
  } else {
    // Back - fur pattern
    ctx.fillStyle = '#c0b098';
    ctx.fillRect(8, 10, 16, 10);
    ctx.fillRect(10, 8, 12, 4);
  }
};
