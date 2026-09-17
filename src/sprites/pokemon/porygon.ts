import { CustomSpriteDrawFn } from '../types';

/**
 * Porygon — full redo ("cursed abomination"): a low-poly duck built entirely
 * from stair-stepped facets. Pink head/back/legs, light-blue chest plate,
 * beak and flat tail fin, one flat black eye.
 */
export const porygon: CustomSpriteDrawFn = (ctx, isBack) => {
  const PINK = '#f0a8b0';       // species spriteColor
  const PINK_DARK = '#c07080';
  const PINK_LIGHT = '#ffd0d8';
  const BLUE = '#58a8d8';       // species spriteColor2
  const BLUE_DARK = '#2f6c9c';
  const BLUE_LIGHT = '#90d0f0';

  if (!isBack) {
    // Flat tail fin — a stepped blue wedge off the back
    ctx.fillStyle = BLUE;
    ctx.fillRect(24, 13, 4, 4);
    ctx.fillRect(26, 11, 4, 5);
    ctx.fillRect(28, 9, 4, 5);
    ctx.fillStyle = BLUE_DARK;
    ctx.fillRect(26, 15, 4, 1);
    ctx.fillRect(28, 13, 4, 1);

    // Body: stepped facets, widest at the middle
    ctx.fillStyle = PINK;
    ctx.fillRect(11, 12, 12, 2);
    ctx.fillRect(9, 14, 16, 2);
    ctx.fillRect(7, 16, 19, 6);
    ctx.fillRect(9, 22, 15, 2);
    ctx.fillRect(11, 24, 11, 2);
    ctx.fillStyle = PINK_DARK;      // the shadowed facet along the back
    ctx.fillRect(15, 12, 8, 2);
    ctx.fillRect(19, 14, 6, 2);

    // Blue chest plate, a faceted shield
    ctx.fillStyle = BLUE;
    ctx.fillRect(9, 17, 8, 2);
    ctx.fillRect(7, 19, 11, 4);
    ctx.fillRect(9, 23, 8, 2);
    ctx.fillStyle = BLUE_LIGHT;
    ctx.fillRect(8, 19, 4, 2);

    // Neck and head
    ctx.fillStyle = PINK;
    ctx.fillRect(8, 8, 8, 6);
    ctx.fillRect(6, 4, 12, 6);
    ctx.fillRect(8, 2, 8, 2);
    ctx.fillStyle = PINK_LIGHT;
    ctx.fillRect(8, 3, 6, 2);
    ctx.fillStyle = PINK_DARK;
    ctx.fillRect(14, 8, 4, 5);

    // Beak
    ctx.fillStyle = BLUE;
    ctx.fillRect(2, 6, 5, 4);
    ctx.fillRect(0, 7, 3, 3);
    ctx.fillStyle = BLUE_DARK;
    ctx.fillRect(0, 9, 6, 1);

    // Flat black eye
    ctx.fillStyle = '#20202c';
    ctx.fillRect(8, 5, 4, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(8, 5, 2, 1);

    // Flat feet
    ctx.fillStyle = PINK;
    ctx.fillRect(10, 26, 4, 3);
    ctx.fillRect(18, 26, 4, 3);
    ctx.fillStyle = BLUE;
    ctx.fillRect(7, 29, 8, 2);
    ctx.fillRect(17, 29, 8, 2);
    ctx.fillStyle = BLUE_DARK;
    ctx.fillRect(7, 30, 8, 1);
    ctx.fillRect(17, 30, 8, 1);
  } else {
    // Back: the same faceted duck seen from behind — pink back, blue tail
    ctx.fillStyle = BLUE;
    ctx.fillRect(2, 13, 4, 4);
    ctx.fillRect(0, 11, 4, 5);
    ctx.fillStyle = BLUE_DARK;
    ctx.fillRect(2, 15, 4, 1);

    ctx.fillStyle = PINK;
    ctx.fillRect(11, 12, 12, 2);
    ctx.fillRect(8, 14, 17, 2);
    ctx.fillRect(6, 16, 20, 6);
    ctx.fillRect(8, 22, 16, 2);
    ctx.fillRect(11, 24, 11, 2);
    ctx.fillStyle = PINK_DARK;
    ctx.fillRect(10, 17, 12, 5);
    ctx.fillStyle = PINK_LIGHT;
    ctx.fillRect(12, 18, 6, 2);

    // Back of the head
    ctx.fillStyle = PINK;
    ctx.fillRect(12, 8, 8, 6);
    ctx.fillRect(10, 4, 12, 6);
    ctx.fillRect(12, 2, 8, 2);
    ctx.fillStyle = PINK_DARK;
    ctx.fillRect(12, 6, 8, 3);

    // Feet
    ctx.fillStyle = PINK;
    ctx.fillRect(10, 26, 4, 3);
    ctx.fillRect(18, 26, 4, 3);
    ctx.fillStyle = BLUE;
    ctx.fillRect(7, 29, 8, 2);
    ctx.fillRect(17, 29, 8, 2);
  }
};
