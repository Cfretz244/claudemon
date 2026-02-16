import { CustomSpriteDrawFn } from '../types';

export const pidgeot: CustomSpriteDrawFn = (ctx, isBack) => {
  // Pidgeot - large majestic bird with dramatic red/yellow crest

  // Large body
  ctx.fillStyle = '#a08050';
  ctx.fillRect(7, 14, 18, 12);
  ctx.fillRect(5, 16, 22, 8);

  // Cream breast/belly
  ctx.fillStyle = '#e8d8b0';
  ctx.fillRect(9, 16, 14, 10);
  ctx.fillRect(7, 18, 18, 6);

  // Head
  ctx.fillStyle = '#a08050';
  ctx.fillRect(7, 5, 14, 10);
  ctx.fillRect(5, 7, 18, 7);

  // Dramatic long crest - red base flowing to yellow tips
  ctx.fillStyle = '#d06060';
  ctx.fillRect(11, 2, 8, 4);
  ctx.fillRect(17, 1, 8, 4);
  ctx.fillRect(23, 0, 6, 3);
  ctx.fillStyle = '#d8b030';
  ctx.fillRect(26, 0, 5, 3);
  ctx.fillRect(28, 1, 4, 2);
  ctx.fillStyle = '#d06060';
  ctx.fillRect(13, 3, 6, 3);
  ctx.fillRect(19, 2, 5, 2);
  ctx.fillStyle = '#c04848';
  ctx.fillRect(15, 2, 4, 2);
  // Yellow tip accents
  ctx.fillStyle = '#d8b030';
  ctx.fillRect(24, 0, 4, 2);
  ctx.fillRect(29, 0, 3, 2);

  // Wings spread out (larger, more dramatic)
  ctx.fillStyle = '#806030';
  ctx.fillRect(2, 12, 6, 10);
  ctx.fillRect(24, 12, 6, 10);
  ctx.fillRect(0, 14, 5, 7);
  ctx.fillRect(27, 14, 5, 7);
  // Wing tips - cream colored
  ctx.fillStyle = '#e8d8b0';
  ctx.fillRect(0, 19, 4, 3);
  ctx.fillRect(28, 19, 4, 3);
  // Wing dark accent
  ctx.fillStyle = '#604020';
  ctx.fillRect(1, 15, 3, 2);
  ctx.fillRect(28, 15, 3, 2);

  // Tail feathers (magnificent, long)
  ctx.fillStyle = '#806030';
  ctx.fillRect(17, 25, 10, 3);
  ctx.fillRect(19, 24, 8, 2);
  ctx.fillRect(21, 27, 6, 3);
  ctx.fillRect(23, 29, 4, 2);
  // Cream tail accent
  ctx.fillStyle = '#e8d8b0';
  ctx.fillRect(18, 26, 8, 2);
  ctx.fillRect(22, 28, 4, 2);

  if (!isBack) {
    // Beak - larger, hooked
    ctx.fillStyle = '#d8a850';
    ctx.fillRect(4, 8, 5, 3);
    ctx.fillRect(3, 9, 4, 2);
    ctx.fillRect(2, 10, 3, 1);
    // Eyes - fierce
    ctx.fillStyle = '#302020';
    ctx.fillRect(8, 7, 5, 4);
    // Eye highlight
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(8, 7, 2, 2);
    // Red eye ring
    ctx.fillStyle = '#d06060';
    ctx.fillRect(8, 6, 5, 1);
    ctx.fillRect(8, 11, 5, 1);
    // Dark face marking
    ctx.fillStyle = '#604020';
    ctx.fillRect(6, 12, 8, 2);
  } else {
    // Back: magnificent crest flowing, spread wings
    ctx.fillStyle = '#d06060';
    ctx.fillRect(11, 3, 10, 5);
    ctx.fillRect(19, 2, 10, 4);
    ctx.fillStyle = '#d8b030';
    ctx.fillRect(27, 1, 5, 3);
    ctx.fillRect(25, 0, 4, 2);
    // Back plumage
    ctx.fillStyle = '#806030';
    ctx.fillRect(9, 8, 14, 6);
    ctx.fillRect(11, 7, 10, 2);
    // Spread wing detail
    ctx.fillStyle = '#a08050';
    ctx.fillRect(1, 16, 5, 4);
    ctx.fillRect(26, 16, 5, 4);
  }

  // Talons
  ctx.fillStyle = '#d8a850';
  ctx.fillRect(9, 26, 4, 4);
  ctx.fillRect(19, 26, 4, 4);
  ctx.fillRect(8, 29, 6, 1);
  ctx.fillRect(18, 29, 6, 1);
};
