import { CustomSpriteDrawFn } from '../types';

/**
 * Gyarados — full redo ("the gyarados we have at home"): a serpent coiled up
 * from the bottom of the frame into a big head top-left, with the gold crest
 * fins, gold barbels, a cream-segmented belly along the coil and a gaping
 * mouth full of fangs.
 */
export const gyarados: CustomSpriteDrawFn = (ctx, isBack) => {
  const BLUE = '#4888d8';       // species spriteColor
  const BLUE_DARK = '#2a5aa0';
  const BLUE_LIGHT = '#78b0f0';
  const GOLD = '#f0d870';       // species spriteColor2
  const GOLD_DARK = '#b8a038';
  const CREAM = '#f0e8d0';

  // The coil: a bottom loop, a column up the right, and the neck back to the left
  ctx.fillStyle = BLUE;
  ctx.fillRect(3, 24, 26, 6);       // bottom loop
  ctx.fillRect(1, 21, 6, 6);        // left of the loop
  ctx.fillRect(25, 20, 6, 7);       // right of the loop
  ctx.fillRect(24, 13, 7, 9);       // rising column
  ctx.fillRect(13, 10, 14, 7);      // back across to the neck
  ctx.fillRect(10, 8, 8, 8);        // neck
  ctx.fillStyle = BLUE_DARK;
  ctx.fillRect(3, 23, 26, 2);
  ctx.fillRect(13, 9, 14, 2);
  ctx.fillRect(24, 12, 7, 2);

  // Cream belly segments along the underside of the coil
  ctx.fillStyle = CREAM;
  for (let x = 4; x < 28; x += 4) ctx.fillRect(x, 27, 3, 3);
  ctx.fillRect(27, 16, 3, 3);
  ctx.fillRect(27, 20, 3, 3);

  // Gold dorsal spines along the back of the coil
  ctx.fillStyle = GOLD;
  ctx.fillRect(15, 6, 3, 4);
  ctx.fillRect(20, 6, 3, 5);
  ctx.fillRect(25, 8, 3, 5);
  ctx.fillStyle = GOLD_DARK;
  ctx.fillRect(15, 9, 3, 1);
  ctx.fillRect(20, 10, 3, 1);
  ctx.fillRect(25, 12, 3, 1);

  // Head
  ctx.fillStyle = BLUE;
  ctx.fillRect(3, 1, 13, 12);
  ctx.fillRect(1, 3, 15, 8);
  ctx.fillStyle = BLUE_LIGHT;
  ctx.fillRect(4, 2, 8, 2);

  // Gold crest fins either side of the head
  ctx.fillStyle = GOLD;
  ctx.fillRect(0, 0, 5, 5);
  ctx.fillRect(13, 0, 5, 6);
  ctx.fillStyle = GOLD_DARK;
  ctx.fillRect(1, 2, 3, 1);
  ctx.fillRect(14, 2, 3, 1);
  ctx.fillRect(14, 4, 3, 1);

  if (!isBack) {
    // Gaping mouth with fangs
    ctx.fillStyle = '#6c1420';
    ctx.fillRect(1, 8, 14, 7);
    ctx.fillRect(0, 10, 3, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(2, 8, 2, 3);
    ctx.fillRect(6, 8, 2, 3);
    ctx.fillRect(10, 8, 2, 3);
    ctx.fillRect(13, 8, 2, 2);
    ctx.fillRect(3, 13, 2, 2);
    ctx.fillRect(7, 13, 2, 2);
    ctx.fillRect(11, 13, 2, 2);
    // Angry eye
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6, 3, 5, 4);
    ctx.fillStyle = '#281820';
    ctx.fillRect(8, 4, 3, 3);
    ctx.fillStyle = '#e03030';
    ctx.fillRect(9, 5, 1, 1);
    ctx.fillStyle = BLUE_DARK;
    ctx.fillRect(5, 2, 6, 1);
    // Gold barbels off the jaw
    ctx.fillStyle = GOLD;
    ctx.fillRect(1, 15, 3, 5);
    ctx.fillRect(5, 15, 3, 4);
    ctx.fillStyle = GOLD_DARK;
    ctx.fillRect(1, 18, 3, 2);
    ctx.fillRect(5, 17, 3, 2);
  } else {
    // Back: the coil from behind, scaled spine, head turned away
    ctx.fillStyle = BLUE_DARK;
    ctx.fillRect(4, 4, 11, 8);
    ctx.fillRect(14, 11, 13, 4);
    ctx.fillRect(4, 25, 24, 3);
    ctx.fillStyle = BLUE_LIGHT;
    ctx.fillRect(6, 6, 7, 3);
    ctx.fillStyle = GOLD_DARK;
    ctx.fillRect(1, 1, 4, 4);
    ctx.fillRect(13, 1, 4, 4);
  }
};
