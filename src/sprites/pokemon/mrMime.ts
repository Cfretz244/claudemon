import { CustomSpriteDrawFn } from '../types';

/**
 * Mr. Mime — full redo ("cursed"). Now a readable clown-mime: pale pink head
 * with the two blue side tufts, red cheek circles, a white ruffle collar over
 * a white torso, thin arms ending in big white gloves held up in the barrier
 * pose, blue knee patches and big round feet.
 */
export const mrMime: CustomSpriteDrawFn = (ctx, isBack) => {
  const SKIN = '#f898b8';       // species spriteColor
  const SKIN_DARK = '#c06888';
  const WHITE = '#f0d8e0';      // species spriteColor2
  const WHITE_HI = '#ffffff';
  const BLUE = '#6878c0';
  const BLUE_DARK = '#44508c';
  const CHEEK = '#e03848';

  // Blue side tufts
  ctx.fillStyle = BLUE;
  ctx.fillRect(3, 3, 6, 7);
  ctx.fillRect(23, 3, 6, 7);
  ctx.fillStyle = BLUE_DARK;
  ctx.fillRect(3, 8, 6, 2);
  ctx.fillRect(23, 8, 6, 2);

  // Head
  ctx.fillStyle = SKIN;
  ctx.fillRect(10, 1, 12, 13);
  ctx.fillRect(8, 3, 16, 10);

  // Arms
  ctx.fillStyle = SKIN;
  ctx.fillRect(5, 17, 5, 3);
  ctx.fillRect(22, 17, 5, 3);
  // Gloves, held up in the barrier pose: rounded, with finger notches on
  // the outer edge so they read as hands and not as boxes.
  for (const gx of [0, 25]) {
    ctx.fillStyle = WHITE_HI;
    ctx.fillRect(gx + 1, 11, 5, 1);
    ctx.fillRect(gx, 12, 7, 7);
    ctx.fillRect(gx + 1, 19, 5, 1);
    ctx.fillStyle = WHITE;
    ctx.fillRect(gx + 1, 15, 5, 4);
    ctx.fillStyle = SKIN_DARK;
    const outer = gx === 0 ? gx : gx + 6;
    ctx.fillRect(outer, 13, 1, 1);
    ctx.fillRect(outer, 16, 1, 1);
  }

  // Ruffle collar
  ctx.fillStyle = WHITE_HI;
  ctx.fillRect(8, 14, 16, 3);
  ctx.fillStyle = WHITE;
  ctx.fillRect(9, 15, 3, 2);
  ctx.fillRect(14, 15, 4, 2);
  ctx.fillRect(20, 15, 3, 2);

  // Torso: pink shoulders around a round white belly
  ctx.fillStyle = SKIN;
  ctx.fillRect(9, 17, 14, 8);
  ctx.fillStyle = WHITE_HI;
  ctx.fillRect(12, 17, 8, 1);
  ctx.fillRect(11, 18, 10, 5);
  ctx.fillRect(12, 23, 8, 2);
  ctx.fillStyle = WHITE;
  ctx.fillRect(12, 21, 8, 3);

  // Legs with blue knee patches, and big round feet
  ctx.fillStyle = SKIN;
  ctx.fillRect(11, 25, 4, 4);
  ctx.fillRect(17, 25, 4, 4);
  ctx.fillStyle = BLUE;
  ctx.fillRect(11, 25, 4, 2);
  ctx.fillRect(17, 25, 4, 2);
  ctx.fillStyle = SKIN;
  ctx.fillRect(8, 28, 8, 3);
  ctx.fillRect(16, 28, 8, 3);
  ctx.fillStyle = SKIN_DARK;
  ctx.fillRect(8, 30, 8, 1);
  ctx.fillRect(16, 30, 8, 1);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#281824';
    ctx.fillRect(11, 5, 4, 4);
    ctx.fillRect(18, 5, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 5, 2, 2);
    ctx.fillRect(18, 5, 2, 2);
    // Red clown cheeks
    ctx.fillStyle = CHEEK;
    ctx.fillRect(9, 9, 4, 3);
    ctx.fillRect(20, 9, 4, 3);
    // Small mouth
    ctx.fillStyle = '#281824';
    ctx.fillRect(15, 10, 3, 2);
  } else {
    // Back of the head and the shoulders
    ctx.fillStyle = SKIN_DARK;
    ctx.fillRect(11, 4, 11, 8);
    ctx.fillStyle = WHITE;
    ctx.fillRect(12, 18, 8, 6);
    ctx.fillStyle = SKIN_DARK;
    ctx.fillRect(15, 18, 2, 6);
  }
};
