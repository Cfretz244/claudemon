import { CustomSpriteDrawFn } from '../types';

/**
 * Slowpoke — full redo ("wtf is slowpoke at the moment"). The old one hung
 * half off the left edge. Now a centred pink quadruped: big rounded head with
 * a cream muzzle, vacant white eyes with tiny pupils, stubby ears and the
 * long tapering tail out to the right.
 */
export const slowpoke: CustomSpriteDrawFn = (ctx, isBack) => {
  const PINK = '#f898b8';       // species spriteColor
  const PINK_DARK = '#c86888';
  const CREAM = '#f0d8e0';      // species spriteColor2

  // Tail: thick at the rump, tapering up and to the right
  ctx.fillStyle = PINK;
  ctx.fillRect(23, 17, 5, 5);
  ctx.fillRect(26, 14, 4, 5);
  ctx.fillRect(28, 11, 4, 5);
  ctx.fillStyle = '#ffc0d4';
  ctx.fillRect(29, 10, 3, 3);

  // Barrel body
  ctx.fillStyle = PINK;
  ctx.fillRect(7, 16, 18, 11);
  ctx.fillRect(5, 18, 22, 8);

  if (!isBack) {
    // Ears
    ctx.fillStyle = PINK;
    ctx.fillRect(5, 1, 5, 6);
    ctx.fillRect(20, 1, 5, 6);
    ctx.fillStyle = PINK_DARK;
    ctx.fillRect(6, 2, 3, 3);
    ctx.fillRect(21, 2, 3, 3);

    // Big dopey head
    ctx.fillStyle = PINK;
    ctx.fillRect(8, 3, 15, 14);
    ctx.fillRect(6, 6, 19, 10);

    // Cream muzzle
    ctx.fillStyle = CREAM;
    ctx.fillRect(10, 11, 12, 7);
    ctx.fillRect(11, 10, 10, 2);

    // Vacant eyes: a lot of white, a very small pupil
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(9, 6, 5, 5);
    ctx.fillRect(18, 6, 5, 5);
    ctx.fillStyle = '#201820';
    ctx.fillRect(11, 8, 2, 2);
    ctx.fillRect(19, 8, 2, 2);
    // Nostrils + the slack open mouth
    ctx.fillStyle = PINK_DARK;
    ctx.fillRect(13, 12, 2, 1);
    ctx.fillRect(18, 12, 2, 1);
    ctx.fillStyle = '#b05878';
    ctx.fillRect(12, 15, 9, 1);
    ctx.fillRect(12, 14, 1, 2);
    ctx.fillRect(20, 14, 1, 2);

    // Four stubby legs
    ctx.fillStyle = PINK;
    ctx.fillRect(6, 26, 6, 5);
    ctx.fillRect(20, 26, 6, 5);
    ctx.fillStyle = PINK_DARK;
    ctx.fillRect(13, 26, 5, 4);
    ctx.fillStyle = CREAM;
    ctx.fillRect(6, 29, 6, 2);
    ctx.fillRect(20, 29, 6, 2);
  } else {
    // Back: rump, the tail rising away, ears from behind
    ctx.fillStyle = PINK;
    ctx.fillRect(5, 1, 5, 6);
    ctx.fillRect(20, 1, 5, 6);
    ctx.fillRect(8, 3, 15, 14);
    ctx.fillRect(6, 6, 19, 10);
    ctx.fillStyle = PINK_DARK;
    ctx.fillRect(6, 2, 3, 3);
    ctx.fillRect(21, 2, 3, 3);
    ctx.fillRect(9, 16, 14, 2);
    ctx.fillRect(10, 23, 12, 2);
    ctx.fillStyle = PINK;
    ctx.fillRect(6, 26, 6, 5);
    ctx.fillRect(20, 26, 6, 5);
    ctx.fillStyle = CREAM;
    ctx.fillRect(6, 29, 6, 2);
    ctx.fillRect(20, 29, 6, 2);
  }
};
