import { CustomSpriteDrawFn } from '../types';

export const dratini: CustomSpriteDrawFn = (ctx, isBack) => {
  // Small serpentine body - curved S shape
  ctx.fillStyle = '#5888c8';

  // Head - round
  ctx.fillRect(10, 2, 10, 8);
  ctx.fillRect(8, 4, 14, 6);

  // White nose/forehead spot
  ctx.fillStyle = '#e8e8f0';
  ctx.fillRect(12, 3, 6, 3);

  // Small horn/fin on head
  ctx.fillStyle = '#e8e8f0';
  ctx.fillRect(14, 0, 4, 3);
  ctx.fillRect(13, 1, 2, 2);
  ctx.fillRect(17, 1, 2, 2);

  // Neck
  ctx.fillStyle = '#5888c8';
  ctx.fillRect(12, 10, 8, 4);

  // Body curve right
  ctx.fillRect(16, 13, 8, 5);
  ctx.fillRect(20, 12, 6, 4);

  // Body curve back left
  ctx.fillRect(10, 17, 12, 5);
  ctx.fillRect(6, 18, 8, 5);

  // Body curve right again (lower)
  ctx.fillRect(6, 22, 10, 4);
  ctx.fillRect(12, 24, 8, 4);

  // Tail tip
  ctx.fillRect(18, 26, 6, 3);
  ctx.fillRect(22, 25, 4, 3);
  // Tail tip white
  ctx.fillStyle = '#e8e8f0';
  ctx.fillRect(24, 25, 3, 3);

  // White belly stripe along curves
  ctx.fillStyle = '#e8e8f0';
  ctx.fillRect(13, 11, 6, 2);
  ctx.fillRect(17, 14, 6, 2);
  ctx.fillRect(10, 18, 8, 2);
  ctx.fillRect(8, 22, 6, 2);
  ctx.fillRect(13, 25, 6, 2);

  if (!isBack) {
    // Big innocent eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 5, 4, 4);
    ctx.fillRect(17, 5, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 5, 2, 2);
    ctx.fillRect(17, 5, 2, 2);
    // Cute little mouth
    ctx.fillStyle = '#4070a8';
    ctx.fillRect(14, 8, 3, 1);
  } else {
    // Back: smooth serpentine body, no face
    ctx.fillStyle = '#4878b0';
    ctx.fillRect(11, 3, 8, 4);
    // Back head detail
    ctx.fillStyle = '#e8e8f0';
    ctx.fillRect(14, 0, 4, 3);
  }
};
