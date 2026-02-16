import { CustomSpriteDrawFn } from '../types';

export const lickitung: CustomSpriteDrawFn = (ctx, isBack) => {
  // Lickitung - pink large round body, HUGE tongue sticking way out

  // Body - large round
  ctx.fillStyle = '#e898a8';
  ctx.fillRect(6, 10, 18, 14);
  ctx.fillRect(4, 12, 22, 10);
  ctx.fillRect(8, 8, 14, 16);

  // Head
  ctx.fillStyle = '#e898a8';
  ctx.fillRect(8, 4, 14, 10);
  ctx.fillRect(6, 6, 18, 6);

  // Belly lighter
  ctx.fillStyle = '#f0b0c0';
  ctx.fillRect(10, 14, 10, 8);

  // Arms
  ctx.fillStyle = '#e898a8';
  ctx.fillRect(2, 14, 4, 4);
  ctx.fillRect(24, 14, 4, 4);

  // Legs short
  ctx.fillStyle = '#d88898';
  ctx.fillRect(8, 24, 5, 4);
  ctx.fillRect(17, 24, 5, 4);

  // Tail
  ctx.fillStyle = '#e898a8';
  ctx.fillRect(24, 18, 4, 3);
  ctx.fillRect(27, 15, 3, 4);
  ctx.fillRect(29, 12, 3, 4);

  // HUGE tongue sticking out
  ctx.fillStyle = '#d06080';
  ctx.fillRect(10, 10, 4, 4);
  ctx.fillRect(6, 12, 4, 3);
  ctx.fillRect(2, 11, 5, 3);
  ctx.fillRect(0, 10, 4, 3);
  // Tongue tip
  ctx.fillStyle = '#c05070';
  ctx.fillRect(0, 10, 2, 3);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 6, 3, 3);
    ctx.fillRect(18, 6, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 6, 2, 2);
    ctx.fillRect(18, 6, 2, 2);
    // Mouth opening
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 10, 4, 2);
  } else {
    // Back - no tongue visible, show back pattern
    ctx.fillStyle = '#d88898';
    ctx.fillRect(10, 8, 10, 8);
    ctx.fillRect(12, 6, 6, 2);
  }
};
