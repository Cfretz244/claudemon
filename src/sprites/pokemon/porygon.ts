import { CustomSpriteDrawFn } from '../types';

export const porygon: CustomSpriteDrawFn = (ctx, isBack) => {
  // Porygon - angular pink/blue geometric body, very angular, digital look

  // Main body - angular blocky shape (pink)
  ctx.fillStyle = '#e888a0';
  ctx.fillRect(8, 8, 14, 14);
  ctx.fillRect(6, 10, 18, 10);
  ctx.fillRect(10, 6, 10, 4);

  // Blue geometric sections
  ctx.fillStyle = '#6888b8';
  ctx.fillRect(8, 16, 14, 6);
  ctx.fillRect(6, 18, 4, 4);
  // Blue belly triangle-ish
  ctx.fillRect(10, 14, 10, 2);

  // Head - angular
  ctx.fillStyle = '#e888a0';
  ctx.fillRect(8, 2, 12, 8);
  ctx.fillRect(6, 4, 14, 4);

  // Beak/snout - angular
  ctx.fillStyle = '#6888b8';
  ctx.fillRect(4, 4, 4, 4);
  ctx.fillRect(2, 5, 4, 2);

  // Angular tail
  ctx.fillStyle = '#6888b8';
  ctx.fillRect(22, 10, 4, 4);
  ctx.fillRect(24, 8, 4, 3);
  ctx.fillRect(26, 10, 4, 3);
  ctx.fillStyle = '#e888a0';
  ctx.fillRect(24, 12, 4, 4);
  ctx.fillRect(26, 14, 3, 2);

  // Angular legs - blocky
  ctx.fillStyle = '#e888a0';
  ctx.fillRect(10, 22, 4, 6);
  ctx.fillRect(18, 22, 4, 6);
  // Feet - flat angular
  ctx.fillStyle = '#6888b8';
  ctx.fillRect(8, 27, 6, 3);
  ctx.fillRect(16, 27, 6, 3);

  // Digital pattern on body
  ctx.fillStyle = '#d07088';
  ctx.fillRect(10, 10, 4, 2);
  ctx.fillRect(16, 10, 4, 2);
  ctx.fillRect(12, 12, 6, 2);

  if (!isBack) {
    // Angular eye
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 4, 4, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 4, 2, 2);
    // Sharp geometric look
    ctx.fillStyle = '#302020';
    ctx.fillRect(16, 5, 3, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(16, 5, 2, 1);
  } else {
    // Back - geometric segments
    ctx.fillStyle = '#d07088';
    ctx.fillRect(10, 8, 10, 8);
    ctx.fillStyle = '#5878a8';
    ctx.fillRect(12, 10, 6, 4);
    ctx.fillRect(10, 16, 10, 4);
  }
};
