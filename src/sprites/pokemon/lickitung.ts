import { CustomSpriteDrawFn } from '../types';

/**
 * Lickitung — the audit note was "needs more tongue". The old sprite had a
 * 5 px stub; the tongue is now a ~30 px ribbon that drops from the mouth,
 * sweeps left, runs down the side and loops across the bottom of the frame,
 * tip curling back up. It is the biggest single shape in the sprite.
 */
export const lickitung: CustomSpriteDrawFn = (ctx, isBack) => {
  const PINK = '#f898b0';       // species spriteColor
  const PINK_DARK = '#c06880';
  const CREAM = '#f0d8e0';      // species spriteColor2
  const TONGUE = '#c83058';
  const TONGUE_EDGE = '#82123a';
  const TONGUE_LIGHT = '#ec6084';

  // Body
  ctx.fillStyle = PINK;
  ctx.fillRect(9, 13, 17, 14);
  ctx.fillRect(7, 16, 21, 10);
  // Head
  ctx.fillRect(10, 3, 15, 12);
  ctx.fillRect(8, 6, 19, 8);
  // Arms
  ctx.fillRect(4, 16, 6, 5);
  ctx.fillRect(25, 16, 6, 5);
  // Legs
  ctx.fillStyle = PINK_DARK;
  ctx.fillRect(10, 26, 6, 5);
  ctx.fillRect(19, 26, 6, 5);
  // Cream belly
  ctx.fillStyle = CREAM;
  ctx.fillRect(12, 17, 11, 8);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#281820';
    ctx.fillRect(11, 6, 4, 4);
    ctx.fillRect(20, 6, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 6, 2, 2);
    ctx.fillRect(20, 6, 2, 2);
    // Mouth the tongue comes out of
    ctx.fillStyle = '#281820';
    ctx.fillRect(13, 11, 9, 3);

    // THE TONGUE: a ribbon out of the mouth, down the left, across the
    // bottom and curling back up. Drawn outline-first so it stays legible
    // against the pink body at 1x.
    const ribbon: [number, number, number, number][] = [
      [12, 12, 7, 10],  // straight down out of the mouth
      [7, 19, 12, 7],   // swinging left
      [2, 24, 17, 6],   // lolling along the bottom, tip to the right
    ];
    ctx.fillStyle = TONGUE_EDGE;
    for (const [x, y, w, h] of ribbon) ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
    ctx.fillStyle = TONGUE;
    for (const [x, y, w, h] of ribbon) ctx.fillRect(x, y, w, h);
    ctx.fillStyle = TONGUE_LIGHT;
    ctx.fillRect(14, 13, 3, 7);
    ctx.fillRect(9, 20, 8, 3);
    ctx.fillRect(4, 25, 13, 3);
    ctx.fillStyle = TONGUE_EDGE;
    ctx.fillRect(1, 23, 2, 2);
    ctx.fillRect(1, 29, 2, 2);
    ctx.fillRect(19, 23, 2, 2);
    ctx.fillRect(19, 29, 2, 2);
  } else {
    // Back: no tongue, the dorsal knobbly hide and the tail
    ctx.fillStyle = PINK_DARK;
    ctx.fillRect(12, 6, 11, 7);
    ctx.fillRect(11, 17, 13, 2);
    ctx.fillRect(16, 19, 3, 7);
    ctx.fillStyle = PINK;
    ctx.fillRect(26, 18, 4, 4);
    ctx.fillRect(28, 14, 4, 5);
    ctx.fillStyle = CREAM;
    ctx.fillRect(28, 11, 4, 4);
  }
};
