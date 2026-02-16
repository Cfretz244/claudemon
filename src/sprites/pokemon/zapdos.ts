import { CustomSpriteDrawFn } from '../types';

export const zapdos: CustomSpriteDrawFn = (ctx, isBack) => {
  // Body
  ctx.fillStyle = '#d8c030';
  ctx.fillRect(10, 8, 12, 14);
  ctx.fillRect(8, 10, 16, 10);

  // Head
  ctx.fillStyle = '#d8c030';
  ctx.fillRect(11, 2, 10, 8);
  ctx.fillRect(9, 4, 14, 6);

  // Spiky crest on head
  ctx.fillStyle = '#c0a828';
  ctx.fillRect(12, 0, 3, 3);
  ctx.fillRect(15, 0, 2, 4);
  ctx.fillRect(18, 0, 3, 3);
  ctx.fillRect(11, 1, 2, 2);
  ctx.fillRect(20, 1, 2, 2);

  // Sharp beak
  ctx.fillStyle = '#a08820';
  ctx.fillRect(7, 5, 4, 2);
  ctx.fillRect(5, 6, 3, 1);
  ctx.fillStyle = '#302020';
  ctx.fillRect(5, 6, 2, 1);

  // Dark markings
  ctx.fillStyle = '#c0a828';
  ctx.fillRect(12, 10, 8, 4);

  // Left wing - jagged lightning bolt edges
  ctx.fillStyle = '#d8c030';
  ctx.fillRect(0, 6, 10, 6);
  ctx.fillRect(0, 4, 6, 4);
  ctx.fillRect(2, 10, 8, 6);
  // Lightning bolt wing edges - left
  ctx.fillStyle = '#c0a828';
  ctx.fillRect(0, 4, 3, 2);
  ctx.fillRect(0, 8, 2, 3);
  ctx.fillRect(0, 12, 3, 2);
  ctx.fillRect(0, 15, 2, 3);
  // Wing detail
  ctx.fillStyle = '#e8d848';
  ctx.fillRect(3, 6, 5, 4);
  ctx.fillRect(4, 11, 4, 4);

  // Right wing - jagged lightning bolt edges
  ctx.fillStyle = '#d8c030';
  ctx.fillRect(22, 6, 10, 6);
  ctx.fillRect(26, 4, 6, 4);
  ctx.fillRect(22, 10, 8, 6);
  // Lightning bolt wing edges - right
  ctx.fillStyle = '#c0a828';
  ctx.fillRect(29, 4, 3, 2);
  ctx.fillRect(30, 8, 2, 3);
  ctx.fillRect(29, 12, 3, 2);
  ctx.fillRect(30, 15, 2, 3);
  // Wing detail
  ctx.fillStyle = '#e8d848';
  ctx.fillRect(24, 6, 5, 4);
  ctx.fillRect(24, 11, 4, 4);

  // Tail - jagged lightning
  ctx.fillStyle = '#c0a828';
  ctx.fillRect(13, 22, 6, 3);
  ctx.fillRect(15, 24, 4, 3);
  ctx.fillRect(13, 26, 6, 3);
  ctx.fillRect(15, 28, 4, 3);

  // Legs
  ctx.fillStyle = '#a08820';
  ctx.fillRect(11, 20, 3, 4);
  ctx.fillRect(18, 20, 3, 4);
  // Talons
  ctx.fillRect(10, 23, 5, 2);
  ctx.fillRect(17, 23, 5, 2);

  if (!isBack) {
    // Fierce eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(11, 3, 3, 3);
    ctx.fillRect(18, 3, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 3, 2, 2);
    ctx.fillRect(18, 3, 2, 2);
    // Angry brow
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 2, 4, 1);
    ctx.fillRect(18, 2, 4, 1);
  } else {
    // Back: electric wings spread wide
    ctx.fillStyle = '#c0a828';
    ctx.fillRect(0, 4, 13, 14);
    ctx.fillRect(19, 4, 13, 14);
    ctx.fillStyle = '#e8d848';
    ctx.fillRect(2, 6, 9, 10);
    ctx.fillRect(21, 6, 9, 10);
    // Jagged back edges
    ctx.fillStyle = '#c0a828';
    ctx.fillRect(0, 4, 2, 3);
    ctx.fillRect(0, 10, 2, 3);
    ctx.fillRect(0, 15, 2, 3);
    ctx.fillRect(30, 4, 2, 3);
    ctx.fillRect(30, 10, 2, 3);
    ctx.fillRect(30, 15, 2, 3);
  }
};
