import { CustomSpriteDrawFn } from '../types';

/**
 * Magikarp — full redo. The old one's paired pectoral rects read as arms; it
 * is now an unmistakable fish: one body oval seen side-on, the gaping
 * white-lipped mouth at the front, two long drooping gold whiskers, a tall
 * gold dorsal fin, a single low pectoral fin and a big fan tail.
 */
export const magikarp: CustomSpriteDrawFn = (ctx, isBack) => {
  const RED = '#f09838';        // species spriteColor
  const RED_DARK = '#b85c1c';
  const GOLD = '#f0c870';       // species spriteColor2
  const GOLD_DARK = '#b8903c';
  const LIP = '#f8f0e0';

  // Tail fan
  ctx.fillStyle = GOLD;
  ctx.fillRect(26, 3, 6, 10);
  ctx.fillRect(26, 19, 6, 10);
  ctx.fillStyle = GOLD_DARK;
  ctx.fillRect(28, 5, 1, 7);
  ctx.fillRect(28, 20, 1, 7);
  ctx.fillStyle = RED;
  ctx.fillRect(23, 11, 5, 10);

  // Dorsal fin
  ctx.fillStyle = GOLD;
  ctx.fillRect(13, 3, 9, 6);
  ctx.fillRect(15, 1, 5, 3);
  ctx.fillStyle = GOLD_DARK;
  ctx.fillRect(16, 2, 1, 6);
  ctx.fillRect(19, 3, 1, 5);

  // Body oval
  ctx.fillStyle = RED;
  ctx.fillRect(8, 11, 17, 11);
  ctx.fillRect(6, 13, 21, 7);
  ctx.fillRect(10, 9, 13, 3);
  ctx.fillRect(10, 22, 13, 2);
  ctx.fillStyle = GOLD;
  ctx.fillRect(9, 19, 14, 4);
  ctx.fillRect(11, 23, 10, 1);

  // Scale rows
  ctx.fillStyle = RED_DARK;
  ctx.fillRect(12, 12, 2, 2);
  ctx.fillRect(16, 12, 2, 2);
  ctx.fillRect(20, 12, 2, 2);
  ctx.fillRect(14, 15, 2, 2);
  ctx.fillRect(18, 15, 2, 2);
  ctx.fillRect(22, 15, 2, 2);

  // One low pectoral fin (not a pair of arms)
  ctx.fillStyle = GOLD;
  ctx.fillRect(11, 21, 7, 5);
  ctx.fillStyle = GOLD_DARK;
  ctx.fillRect(13, 22, 1, 4);
  ctx.fillRect(15, 22, 1, 4);

  if (!isBack) {
    // Gaping mouth with white lips
    ctx.fillStyle = LIP;
    ctx.fillRect(2, 9, 8, 4);
    ctx.fillRect(2, 18, 8, 4);
    ctx.fillRect(1, 11, 3, 9);
    ctx.fillStyle = '#7c2230';
    ctx.fillRect(4, 13, 6, 5);
    ctx.fillStyle = RED_DARK;
    ctx.fillRect(9, 13, 2, 5);
    // Big dumb eye
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(9, 10, 6, 6);
    ctx.fillStyle = '#281820';
    ctx.fillRect(11, 11, 3, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 11, 1, 1);
    // Two long whiskers drooping off the jaw
    ctx.fillStyle = GOLD;
    ctx.fillRect(3, 21, 5, 2);
    ctx.fillRect(1, 22, 3, 2);
    ctx.fillRect(0, 23, 2, 5);
    ctx.fillRect(6, 22, 2, 4);
    ctx.fillRect(7, 25, 3, 2);
    ctx.fillRect(9, 26, 3, 2);
    ctx.fillStyle = GOLD_DARK;
    ctx.fillRect(0, 26, 2, 2);
    ctx.fillRect(10, 26, 2, 2);
  } else {
    // Back: the same fish from behind — darker back, no face
    ctx.fillStyle = RED_DARK;
    ctx.fillRect(7, 12, 19, 6);
    ctx.fillRect(9, 10, 15, 3);
    ctx.fillStyle = RED;
    ctx.fillRect(9, 13, 15, 3);
    ctx.fillStyle = GOLD_DARK;
    ctx.fillRect(4, 14, 5, 5);
  }
};
