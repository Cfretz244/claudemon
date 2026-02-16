import { CustomSpriteDrawFn } from '../types';

export const abra: CustomSpriteDrawFn = (ctx, isBack) => {
  // Abra - yellow sitting fox-like psychic, eyes always closed

  // Tail curling behind
  ctx.fillStyle = '#a08040';
  ctx.fillRect(22, 20, 4, 3);
  ctx.fillRect(24, 17, 4, 4);
  ctx.fillRect(26, 15, 3, 3);

  // Body - sitting posture
  ctx.fillStyle = '#d8b030';
  ctx.fillRect(8, 14, 14, 10);
  ctx.fillRect(6, 16, 18, 6);

  // Brown armor segments on torso
  ctx.fillStyle = '#a08040';
  ctx.fillRect(9, 16, 12, 3);
  ctx.fillRect(10, 20, 10, 2);

  // Head - large and round
  ctx.fillStyle = '#d8b030';
  ctx.fillRect(8, 4, 14, 12);
  ctx.fillRect(6, 6, 18, 8);

  // Pointed ears
  ctx.fillStyle = '#d8b030';
  ctx.fillRect(5, 2, 4, 6);
  ctx.fillRect(21, 2, 4, 6);
  // Inner ear
  ctx.fillStyle = '#a08040';
  ctx.fillRect(6, 3, 2, 4);
  ctx.fillRect(22, 3, 2, 4);

  if (!isBack) {
    // Closed eyes - just lines (Abra is always sleeping)
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 9, 4, 1);
    ctx.fillRect(17, 9, 4, 1);
    // Nose
    ctx.fillStyle = '#302020';
    ctx.fillRect(14, 11, 2, 1);
    // Mouth - small
    ctx.fillStyle = '#302020';
    ctx.fillRect(13, 13, 4, 1);
  } else {
    // Back - armor segments visible
    ctx.fillStyle = '#a08040';
    ctx.fillRect(10, 8, 10, 6);
    ctx.fillRect(11, 15, 8, 4);
  }

  // Arms tucked in front (sitting)
  ctx.fillStyle = '#d8b030';
  ctx.fillRect(5, 16, 4, 4);
  ctx.fillRect(21, 16, 4, 4);

  // Feet tucked under
  ctx.fillStyle = '#a08040';
  ctx.fillRect(8, 24, 5, 3);
  ctx.fillRect(17, 24, 5, 3);
};
