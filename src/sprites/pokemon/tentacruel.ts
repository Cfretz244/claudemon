import { CustomSpriteDrawFn } from '../types';

/**
 * Tentacruel — full redo ("not sure much can be done, but it ain't right").
 * Now a rounded blue bell with the two big red gems bulging out of its upper
 * sides, beady eyes and a beak low on the bell, and a curtain of seven
 * varying-length tentacles instead of the old square box on a comb.
 */
export const tentacruel: CustomSpriteDrawFn = (ctx, isBack) => {
  const BELL = '#4898c8';       // species spriteColor
  const BELL_DARK = '#2c6c9c';
  const BELL_LIGHT = '#78bce0';
  const GEM = '#c03848';        // species spriteColor2
  const GEM_DARK = '#82202e';
  const GEM_LIGHT = '#f06878';

  // Tentacles first, so the bell overlaps their tops.
  const tent: [number, number, number][] = [
    [4, 19, 11], [8, 21, 9], [12, 20, 12], [16, 22, 10],
    [20, 20, 11], [24, 21, 8], [28, 19, 10],
  ];
  tent.forEach(([x, y, h], i) => {
    ctx.fillStyle = i % 2 ? BELL_DARK : BELL;
    ctx.fillRect(x, y, 3, h);
    ctx.fillStyle = BELL_DARK;
    ctx.fillRect(x, y + h - 3, 3, 3);
  });

  // Rounded bell
  ctx.fillStyle = BELL;
  ctx.fillRect(13, 1, 7, 2);
  ctx.fillRect(11, 3, 11, 2);
  ctx.fillRect(9, 5, 15, 2);
  ctx.fillRect(7, 7, 19, 10);
  ctx.fillRect(6, 9, 21, 8);
  ctx.fillRect(8, 17, 17, 3);
  ctx.fillRect(10, 20, 13, 2);
  ctx.fillStyle = BELL_LIGHT;
  ctx.fillRect(11, 3, 6, 3);
  ctx.fillRect(9, 6, 4, 3);

  // The two gems, bulging out past the bell's sides
  for (const gx of [1, 23]) {
    ctx.fillStyle = GEM_DARK;
    ctx.fillRect(gx + 1, 5, 6, 11);
    ctx.fillRect(gx, 7, 8, 7);
    ctx.fillStyle = GEM;
    ctx.fillRect(gx + 2, 6, 4, 9);
    ctx.fillRect(gx + 1, 8, 6, 5);
    ctx.fillStyle = GEM_LIGHT;
    ctx.fillRect(gx + 2, 7, 3, 3);
  }

  if (!isBack) {
    // Beady eyes low on the bell, with a glint
    ctx.fillStyle = '#181c28';
    ctx.fillRect(10, 15, 4, 4);
    ctx.fillRect(18, 15, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 16, 2, 1);
    ctx.fillRect(19, 16, 2, 1);
    // Beak
    ctx.fillStyle = BELL_DARK;
    ctx.fillRect(14, 18, 4, 3);
    ctx.fillStyle = '#181c28';
    ctx.fillRect(15, 19, 2, 2);
  } else {
    // Back: a plain shaded dome, gems seen edge-on
    ctx.fillStyle = BELL_DARK;
    ctx.fillRect(9, 6, 14, 13);
    ctx.fillRect(11, 4, 10, 3);
    ctx.fillStyle = BELL;
    ctx.fillRect(11, 7, 10, 9);
    ctx.fillStyle = GEM_DARK;
    ctx.fillRect(7, 9, 3, 5);
    ctx.fillRect(22, 9, 3, 5);
  }
};
