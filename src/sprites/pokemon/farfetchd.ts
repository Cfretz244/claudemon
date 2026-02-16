import { CustomSpriteDrawFn } from '../types';

export const farfetchd: CustomSpriteDrawFn = (ctx, isBack) => {
  // Body - brown duck
  ctx.fillStyle = '#a08050';
  ctx.fillRect(8, 14, 14, 10);
  ctx.fillRect(6, 16, 18, 6);

  // Belly
  ctx.fillStyle = '#d0b878';
  ctx.fillRect(10, 18, 10, 5);

  // Head
  ctx.fillStyle = '#a08050';
  ctx.fillRect(10, 4, 12, 12);
  ctx.fillRect(8, 6, 16, 8);

  // Head crest / V-shaped marking
  ctx.fillStyle = '#806038';
  ctx.fillRect(13, 2, 3, 4);
  ctx.fillRect(12, 3, 2, 2);
  ctx.fillRect(16, 3, 2, 2);

  // Beak
  ctx.fillStyle = '#d0a050';
  ctx.fillRect(6, 8, 5, 3);
  ctx.fillRect(4, 9, 3, 2);

  // Wing
  ctx.fillStyle = '#806038';
  ctx.fillRect(18, 14, 6, 6);
  ctx.fillRect(20, 12, 4, 8);

  // Tail feathers
  ctx.fillStyle = '#a08050';
  ctx.fillRect(22, 20, 4, 3);
  ctx.fillRect(24, 18, 3, 4);

  // Feet
  ctx.fillStyle = '#d0a050';
  ctx.fillRect(10, 24, 4, 4);
  ctx.fillRect(16, 24, 4, 4);
  ctx.fillRect(8, 26, 3, 2);
  ctx.fillRect(19, 26, 3, 2);

  // Leek held in wing
  ctx.fillStyle = '#58a830';
  ctx.fillRect(2, 2, 2, 14);
  ctx.fillRect(1, 1, 4, 3);
  // Leek stem
  ctx.fillStyle = '#c8b868';
  ctx.fillRect(2, 14, 2, 8);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(11, 7, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 7, 2, 2);
    // Eyebrow marking
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 5, 5, 1);
  } else {
    // Back wing detail
    ctx.fillStyle = '#806038';
    ctx.fillRect(10, 14, 12, 6);
    ctx.fillStyle = '#a08050';
    ctx.fillRect(12, 16, 8, 3);
  }
};
