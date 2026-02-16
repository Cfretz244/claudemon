import { CustomSpriteDrawFn } from '../types';

export const pidgeotto: CustomSpriteDrawFn = (ctx, isBack) => {
  // Pidgeotto - medium brown bird with red crest

  // Body
  ctx.fillStyle = '#a08050';
  ctx.fillRect(8, 14, 16, 12);
  ctx.fillRect(6, 16, 20, 8);

  // Cream breast/belly
  ctx.fillStyle = '#e8d8b0';
  ctx.fillRect(10, 17, 12, 9);
  ctx.fillRect(8, 19, 16, 5);

  // Head
  ctx.fillStyle = '#a08050';
  ctx.fillRect(8, 5, 14, 10);
  ctx.fillRect(6, 7, 18, 7);

  // Pink/red crest feathers flowing back
  ctx.fillStyle = '#d06060';
  ctx.fillRect(12, 2, 6, 4);
  ctx.fillRect(16, 1, 6, 3);
  ctx.fillRect(20, 0, 5, 3);
  ctx.fillRect(23, 1, 4, 2);
  ctx.fillStyle = '#c04848';
  ctx.fillRect(14, 2, 4, 2);
  ctx.fillRect(19, 1, 3, 2);

  // Wings (folded, larger than Pidgey)
  ctx.fillStyle = '#806030';
  ctx.fillRect(4, 14, 5, 9);
  ctx.fillRect(23, 14, 5, 9);
  ctx.fillRect(3, 16, 4, 6);
  ctx.fillRect(25, 16, 4, 6);
  // Wing tips
  ctx.fillStyle = '#e8d8b0';
  ctx.fillRect(3, 21, 3, 2);
  ctx.fillRect(26, 21, 3, 2);

  // Tail feathers (longer than Pidgey)
  ctx.fillStyle = '#806030';
  ctx.fillRect(19, 24, 8, 4);
  ctx.fillRect(21, 23, 6, 2);
  ctx.fillRect(23, 27, 4, 2);
  ctx.fillStyle = '#e8d8b0';
  ctx.fillRect(20, 25, 6, 2);

  if (!isBack) {
    // Beak
    ctx.fillStyle = '#d8a850';
    ctx.fillRect(6, 9, 4, 3);
    ctx.fillRect(5, 10, 3, 2);
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(9, 7, 4, 4);
    // Eye highlight
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(9, 7, 2, 2);
    // Dark marking around eye
    ctx.fillStyle = '#806030';
    ctx.fillRect(7, 11, 6, 2);
    // Brow line
    ctx.fillStyle = '#806030';
    ctx.fillRect(8, 6, 6, 1);
  } else {
    // Back: prominent crest flowing back, wing details
    ctx.fillStyle = '#d06060';
    ctx.fillRect(12, 3, 8, 4);
    ctx.fillRect(18, 2, 8, 3);
    ctx.fillRect(24, 1, 5, 3);
    // Back markings
    ctx.fillStyle = '#806030';
    ctx.fillRect(10, 8, 12, 6);
    ctx.fillRect(12, 7, 8, 2);
    // Longer tail
    ctx.fillStyle = '#a08050';
    ctx.fillRect(17, 24, 10, 5);
    ctx.fillRect(19, 23, 8, 2);
  }

  // Feet (talons)
  ctx.fillStyle = '#d8a850';
  ctx.fillRect(10, 26, 4, 4);
  ctx.fillRect(18, 26, 4, 4);
  ctx.fillRect(9, 29, 6, 1);
  ctx.fillRect(17, 29, 6, 1);
};
