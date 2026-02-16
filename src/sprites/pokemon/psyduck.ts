import { CustomSpriteDrawFn } from '../types';

export const psyduck: CustomSpriteDrawFn = (ctx, isBack) => {
  // Psyduck - yellow duck, hands on head, vacant confused eyes

  // Body
  ctx.fillStyle = '#e8c838';
  ctx.fillRect(8, 16, 16, 10);
  ctx.fillRect(6, 18, 20, 6);

  // Head - round
  ctx.fillStyle = '#e8c838';
  ctx.fillRect(6, 4, 20, 14);
  ctx.fillRect(8, 2, 16, 3);
  ctx.fillRect(8, 16, 16, 2);

  // Tuft of hair on top
  ctx.fillStyle = '#302020';
  ctx.fillRect(12, 1, 3, 3);
  ctx.fillRect(15, 0, 3, 3);
  ctx.fillRect(18, 1, 2, 2);

  // Beak
  ctx.fillStyle = '#d0a028';
  ctx.fillRect(10, 12, 12, 4);
  ctx.fillRect(12, 11, 8, 1);

  // Hands on head (holding head pose)
  ctx.fillStyle = '#e8c838';
  ctx.fillRect(3, 6, 5, 5);
  ctx.fillRect(24, 6, 5, 5);
  // Arms reaching up
  ctx.fillRect(4, 10, 4, 8);
  ctx.fillRect(24, 10, 4, 8);

  // Feet
  ctx.fillStyle = '#d0a028';
  ctx.fillRect(8, 26, 6, 3);
  ctx.fillRect(18, 26, 6, 3);

  // Tail (small stubby)
  ctx.fillStyle = '#e8c838';
  ctx.fillRect(24, 20, 4, 3);

  if (!isBack) {
    // Vacant/confused eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 7, 4, 4);
    ctx.fillRect(18, 7, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 7, 2, 2);
    ctx.fillRect(18, 7, 2, 2);
    // Dizzy/confused spirals (small dots)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(12, 9, 1, 1);
    ctx.fillRect(20, 9, 1, 1);
  } else {
    // Back - tuft of hair visible, no face
    ctx.fillStyle = '#302020';
    ctx.fillRect(12, 2, 8, 3);
    ctx.fillStyle = '#d0a828';
    ctx.fillRect(10, 6, 12, 6);
  }
};
