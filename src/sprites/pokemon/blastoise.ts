import { CustomSpriteDrawFn } from '../types';

/**
 * Blastoise — the audit note was "cannons should be bigger", so the two water
 * cannons are now 10x11 muzzles (was 4x8) that break the silhouette on both
 * sides and read as barrels at 1x: dark sleeve, grey barrel, black bore.
 */
export const blastoise: CustomSpriteDrawFn = (ctx, isBack) => {
  const SHELL = '#6878b8';      // species spriteColor
  const SHELL_DARK = '#48588c';
  const SHELL_LIGHT = '#8898d0';
  const CREAM = '#f0d890';      // species spriteColor2
  const CREAM_DARK = '#c0a050';
  const GUN = '#b0b8c8';
  const GUN_DARK = '#68708a';
  const BORE = '#181c26';

  if (!isBack) {
    // Head
    ctx.fillStyle = SHELL;
    ctx.fillRect(10, 2, 12, 11);
    ctx.fillRect(8, 4, 16, 8);
    // Torso
    ctx.fillRect(7, 12, 18, 15);
    ctx.fillRect(5, 15, 22, 11);
    // Arms
    ctx.fillRect(3, 17, 5, 7);
    ctx.fillRect(24, 17, 5, 7);

    // Shell rim peeking either side of the belly
    ctx.fillStyle = SHELL_DARK;
    ctx.fillRect(5, 14, 22, 2);
    ctx.fillRect(5, 24, 22, 2);

    // Cream belly plate
    ctx.fillStyle = CREAM;
    ctx.fillRect(9, 16, 14, 9);
    ctx.fillStyle = CREAM_DARK;
    ctx.fillRect(9, 20, 14, 1);
    ctx.fillRect(15, 16, 2, 9);

    // Legs
    ctx.fillStyle = SHELL_DARK;
    ctx.fillRect(7, 26, 7, 5);
    ctx.fillRect(18, 26, 7, 5);
    ctx.fillStyle = CREAM_DARK;
    ctx.fillRect(7, 29, 7, 2);
    ctx.fillRect(18, 29, 7, 2);

    // THE CANNONS — big barrels aimed at the viewer
    ctx.fillStyle = GUN_DARK;
    ctx.fillRect(0, 7, 10, 12);
    ctx.fillRect(22, 7, 10, 12);
    ctx.fillStyle = GUN;
    ctx.fillRect(1, 8, 8, 10);
    ctx.fillRect(23, 8, 8, 10);
    ctx.fillStyle = BORE;
    ctx.fillRect(2, 10, 6, 6);
    ctx.fillRect(24, 10, 6, 6);
    ctx.fillStyle = GUN;
    ctx.fillRect(3, 11, 2, 2);
    ctx.fillRect(25, 11, 2, 2);

    // Face
    ctx.fillStyle = '#201828';
    ctx.fillRect(11, 5, 4, 4);
    ctx.fillRect(17, 5, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 5, 2, 2);
    ctx.fillRect(17, 5, 2, 2);
    ctx.fillStyle = SHELL_LIGHT;
    ctx.fillRect(13, 11, 6, 2);
    ctx.fillStyle = '#201828';
    ctx.fillRect(14, 10, 4, 1);
  } else {
    // Back: the shell fills the frame, cannons rear up over the shoulders
    ctx.fillStyle = SHELL;
    ctx.fillRect(11, 2, 10, 8);
    ctx.fillRect(5, 9, 22, 18);
    ctx.fillStyle = SHELL_DARK;
    ctx.fillRect(4, 12, 24, 13);

    // Shell plating
    ctx.fillStyle = CREAM_DARK;
    ctx.fillRect(6, 10, 20, 16);
    ctx.fillStyle = CREAM;
    ctx.fillRect(7, 11, 18, 14);
    ctx.fillStyle = CREAM_DARK;
    ctx.fillRect(15, 11, 2, 14);
    ctx.fillRect(7, 17, 18, 2);

    // Legs
    ctx.fillStyle = SHELL_DARK;
    ctx.fillRect(6, 26, 7, 5);
    ctx.fillRect(19, 26, 7, 5);

    // THE CANNONS — tall barrels over the shoulders, bores pointing up
    ctx.fillStyle = GUN_DARK;
    ctx.fillRect(0, 3, 9, 14);
    ctx.fillRect(23, 3, 9, 14);
    ctx.fillStyle = GUN;
    ctx.fillRect(1, 4, 7, 12);
    ctx.fillRect(24, 4, 7, 12);
    ctx.fillStyle = BORE;
    ctx.fillRect(2, 3, 5, 4);
    ctx.fillRect(25, 3, 5, 4);
    ctx.fillStyle = GUN_DARK;
    ctx.fillRect(1, 9, 7, 2);
    ctx.fillRect(24, 9, 7, 2);
  }
};
