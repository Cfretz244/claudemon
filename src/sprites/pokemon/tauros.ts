import { CustomSpriteDrawFn } from '../types';

export const tauros: CustomSpriteDrawFn = (ctx, isBack) => {
  // Tauros - brown bull with three tails, curved horns, shaggy mane

  // Body - large and stocky
  ctx.fillStyle = '#a08050';
  ctx.fillRect(6, 12, 18, 10);
  ctx.fillRect(4, 14, 22, 6);

  // Head
  ctx.fillRect(2, 6, 12, 8);
  ctx.fillRect(4, 4, 8, 10);

  // Curved horns
  ctx.fillStyle = '#d8d0c0';
  ctx.fillRect(2, 2, 3, 5);
  ctx.fillRect(0, 0, 3, 4);
  ctx.fillRect(11, 2, 3, 5);
  ctx.fillRect(13, 0, 3, 4);

  // Shaggy mane
  ctx.fillStyle = '#806838';
  ctx.fillRect(12, 8, 6, 8);
  ctx.fillRect(10, 10, 8, 6);
  ctx.fillRect(14, 6, 4, 4);

  // Three tails
  ctx.fillStyle = '#806838';
  ctx.fillRect(24, 10, 4, 2);
  ctx.fillRect(26, 8, 4, 2);
  ctx.fillRect(28, 6, 3, 2);
  // Second tail
  ctx.fillRect(24, 13, 4, 2);
  ctx.fillRect(27, 12, 3, 2);
  // Third tail
  ctx.fillRect(24, 16, 4, 2);
  ctx.fillRect(26, 17, 4, 2);
  ctx.fillRect(28, 18, 3, 2);

  // Legs
  ctx.fillStyle = '#a08050';
  ctx.fillRect(6, 22, 4, 6);
  ctx.fillRect(14, 22, 4, 6);
  ctx.fillRect(20, 22, 4, 6);
  // Hooves
  ctx.fillStyle = '#806838';
  ctx.fillRect(6, 27, 4, 3);
  ctx.fillRect(14, 27, 4, 3);
  ctx.fillRect(20, 27, 4, 3);

  // Snout
  ctx.fillStyle = '#c0a870';
  ctx.fillRect(2, 10, 4, 3);

  if (!isBack) {
    // Eyes - fierce
    ctx.fillStyle = '#302020';
    ctx.fillRect(4, 7, 2, 2);
    ctx.fillRect(10, 7, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(4, 7, 1, 1);
    ctx.fillRect(10, 7, 1, 1);
    // Nostrils
    ctx.fillStyle = '#302020';
    ctx.fillRect(3, 11, 1, 1);
    ctx.fillRect(5, 11, 1, 1);
  } else {
    // Back view - mane prominent
    ctx.fillStyle = '#806838';
    ctx.fillRect(8, 10, 12, 6);
    ctx.fillStyle = '#907848';
    ctx.fillRect(10, 12, 8, 4);
  }
};
