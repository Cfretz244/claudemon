import { CustomSpriteDrawFn } from '../types';

export const pidgey: CustomSpriteDrawFn = (ctx, isBack) => {
  // Pidgey - small brown bird

  // Body
  ctx.fillStyle = '#a08050';
  ctx.fillRect(9, 14, 14, 10);
  ctx.fillRect(7, 16, 18, 7);

  // Cream breast/belly
  ctx.fillStyle = '#e8d8b0';
  ctx.fillRect(11, 17, 10, 7);
  ctx.fillRect(9, 19, 14, 4);

  // Head
  ctx.fillStyle = '#a08050';
  ctx.fillRect(10, 6, 12, 9);
  ctx.fillRect(8, 8, 16, 6);

  // Crest feathers on top
  ctx.fillStyle = '#a08050';
  ctx.fillRect(12, 4, 4, 3);
  ctx.fillRect(13, 3, 3, 2);
  ctx.fillStyle = '#806030';
  ctx.fillRect(14, 3, 2, 2);

  // Wing (folded at side)
  ctx.fillStyle = '#806030';
  ctx.fillRect(6, 15, 4, 7);
  ctx.fillRect(22, 15, 4, 7);
  ctx.fillRect(5, 17, 3, 4);
  ctx.fillRect(24, 17, 3, 4);

  // Tail feathers
  ctx.fillStyle = '#806030';
  ctx.fillRect(20, 22, 6, 3);
  ctx.fillRect(22, 21, 4, 2);
  ctx.fillStyle = '#a08050';
  ctx.fillRect(21, 22, 4, 2);

  if (!isBack) {
    // Beak
    ctx.fillStyle = '#d8a850';
    ctx.fillRect(8, 10, 4, 2);
    ctx.fillRect(7, 11, 3, 1);
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(11, 8, 3, 3);
    // Eye highlight
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 8, 1, 1);
    // Cheek marking
    ctx.fillStyle = '#806030';
    ctx.fillRect(9, 12, 4, 2);
  } else {
    // Back: brown back, visible tail
    ctx.fillStyle = '#806030';
    ctx.fillRect(11, 8, 10, 6);
    ctx.fillRect(12, 7, 8, 2);
    // Tail more prominent
    ctx.fillStyle = '#a08050';
    ctx.fillRect(18, 22, 8, 4);
    ctx.fillRect(20, 21, 6, 2);
  }

  // Feet
  ctx.fillStyle = '#d8a850';
  ctx.fillRect(11, 24, 3, 4);
  ctx.fillRect(18, 24, 3, 4);
  ctx.fillRect(10, 27, 5, 1);
  ctx.fillRect(17, 27, 5, 1);
};
