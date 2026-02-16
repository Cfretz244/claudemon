import { CustomSpriteDrawFn } from '../types';

export const bellsprout: CustomSpriteDrawFn = (ctx, isBack) => {
  // Bellsprout - thin green stem body, bell-shaped yellow head, root feet

  // Root feet
  ctx.fillStyle = '#8b6840';
  ctx.fillRect(8, 26, 4, 4);
  ctx.fillRect(20, 26, 4, 4);
  ctx.fillRect(6, 28, 3, 2);
  ctx.fillRect(23, 28, 3, 2);

  // Thin stem body
  ctx.fillStyle = '#78a830';
  ctx.fillRect(14, 14, 4, 14);
  ctx.fillRect(13, 16, 6, 4);

  // Leaves on stem
  ctx.fillStyle = '#58a020';
  ctx.fillRect(8, 16, 6, 3);
  ctx.fillRect(18, 18, 6, 3);

  // Bell-shaped yellow head
  ctx.fillStyle = '#d8b030';
  ctx.fillRect(10, 2, 12, 13);
  ctx.fillRect(8, 4, 16, 9);
  ctx.fillRect(7, 6, 18, 5);

  // Head opening (darker top)
  ctx.fillStyle = '#c09828';
  ctx.fillRect(10, 2, 12, 3);
  ctx.fillRect(12, 1, 8, 2);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 6, 3, 3);
    ctx.fillRect(19, 6, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 6, 2, 2);
    ctx.fillRect(19, 6, 2, 2);
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(13, 11, 6, 2);
    ctx.fillStyle = '#c03030';
    ctx.fillRect(14, 11, 4, 1);
  } else {
    // Back of head
    ctx.fillStyle = '#c09828';
    ctx.fillRect(10, 4, 12, 8);
  }
};
