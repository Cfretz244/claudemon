import { CustomSpriteDrawFn } from '../types';

/**
 * Ninetales — the audit note was "the nine tails should take up more space".
 * The nine tails are now nine separate, countable plumes (1 px dark gaps
 * between them) fanned across the top and down the right, filling roughly
 * half the 32x32 box; the fox itself sits low-left.
 */
export const ninetales: CustomSpriteDrawFn = (ctx, isBack) => {
  const GOLD = '#e0c070';       // species spriteColor
  const GOLD_DARK = '#a8874a';
  const CREAM = '#f8e8a0';      // species spriteColor2
  const TIP = '#fffae0';

  // Nine plumes: [x, y, w, h] strand, then [tx, ty, tw, th] pale tip.
  const tails: [number[], number[]][] = [
    [[8, 6, 3, 9], [8, 3, 3, 3]],
    [[12, 3, 3, 12], [12, 0, 3, 3]],
    [[16, 2, 3, 13], [16, 0, 3, 2]],
    [[20, 3, 3, 12], [20, 0, 3, 3]],
    [[24, 6, 3, 9], [24, 3, 3, 3]],
    [[25, 10, 6, 4], [29, 9, 3, 3]],
    [[25, 15, 6, 4], [29, 15, 3, 3]],
    [[24, 20, 6, 4], [28, 21, 4, 3]],
    [[21, 24, 6, 4], [25, 26, 4, 3]],
  ];
  ctx.fillStyle = '#c8a860';
  ctx.fillRect(11, 13, 16, 11);  // the clump the plumes grow out of
  ctx.fillStyle = GOLD;
  for (const [s] of tails) ctx.fillRect(s[0], s[1], s[2], s[3]);
  ctx.fillStyle = TIP;
  for (const [, t] of tails) ctx.fillRect(t[0], t[1], t[2], t[3]);
  // Seams: one per gap, so you can count nine
  ctx.fillStyle = GOLD_DARK;
  ctx.fillRect(11, 6, 1, 12);
  ctx.fillRect(15, 3, 1, 15);
  ctx.fillRect(19, 3, 1, 15);
  ctx.fillRect(23, 6, 1, 12);
  ctx.fillRect(27, 14, 5, 1);
  ctx.fillRect(26, 19, 5, 1);
  ctx.fillRect(24, 23, 5, 1);

  if (!isBack) {
    // Body, low-left so the plumes own the rest of the frame
    ctx.fillStyle = GOLD;
    ctx.fillRect(5, 18, 13, 8);
    ctx.fillRect(3, 20, 16, 5);
    // Head
    ctx.fillRect(3, 9, 12, 11);
    ctx.fillRect(2, 11, 14, 7);
    // Ears
    ctx.fillRect(2, 4, 4, 6);
    ctx.fillRect(11, 4, 4, 6);
    ctx.fillStyle = GOLD_DARK;
    ctx.fillRect(3, 6, 2, 3);
    ctx.fillRect(12, 6, 2, 3);
    // Crown mane
    ctx.fillStyle = CREAM;
    ctx.fillRect(4, 7, 9, 4);
    ctx.fillRect(6, 5, 5, 3);
    ctx.fillRect(5, 22, 12, 4);
    // Red eyes with a glint
    ctx.fillStyle = '#c03040';
    ctx.fillRect(4, 12, 4, 3);
    ctx.fillRect(10, 12, 4, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(4, 12, 2, 1);
    ctx.fillRect(10, 12, 2, 1);
    // Muzzle
    ctx.fillStyle = CREAM;
    ctx.fillRect(5, 16, 8, 4);
    ctx.fillStyle = '#302028';
    ctx.fillRect(7, 16, 3, 2);
    ctx.fillRect(8, 18, 3, 1);
    // Legs
    ctx.fillStyle = GOLD;
    ctx.fillRect(4, 25, 4, 6);
    ctx.fillRect(13, 25, 4, 6);
    ctx.fillStyle = CREAM;
    ctx.fillRect(4, 29, 4, 2);
    ctx.fillRect(13, 29, 4, 2);
  } else {
    // Back: haunches and the mane from behind; the plumes still dominate
    ctx.fillStyle = GOLD;
    ctx.fillRect(4, 16, 15, 11);
    ctx.fillRect(2, 19, 18, 7);
    ctx.fillRect(3, 7, 12, 10);
    ctx.fillRect(2, 3, 4, 6);
    ctx.fillRect(12, 3, 4, 6);
    ctx.fillStyle = CREAM;
    ctx.fillRect(4, 6, 9, 5);
    ctx.fillStyle = GOLD_DARK;
    ctx.fillRect(6, 17, 11, 2);
    ctx.fillRect(10, 19, 2, 7);
    ctx.fillStyle = GOLD;
    ctx.fillRect(4, 26, 4, 5);
    ctx.fillRect(14, 26, 4, 5);
    ctx.fillStyle = CREAM;
    ctx.fillRect(4, 29, 4, 2);
    ctx.fillRect(14, 29, 4, 2);
  }
};
