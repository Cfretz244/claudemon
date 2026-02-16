import { CustomSpriteDrawFn } from '../types';

export const onix: CustomSpriteDrawFn = (ctx, isBack) => {
  // Head - large boulder
  ctx.fillStyle = '#989890';
  ctx.fillRect(4, 0, 16, 10);
  ctx.fillRect(2, 2, 20, 6);
  ctx.fillRect(6, 0, 12, 12);

  // Horn on head
  ctx.fillStyle = '#787870';
  ctx.fillRect(10, 0, 4, 2);
  ctx.fillRect(11, 0, 2, 1);

  // Head shading
  ctx.fillStyle = '#787870';
  ctx.fillRect(4, 6, 4, 4);
  ctx.fillRect(16, 6, 4, 4);

  // Segment 2 - upper body
  ctx.fillStyle = '#a0a098';
  ctx.fillRect(14, 10, 12, 8);
  ctx.fillRect(12, 12, 14, 4);
  ctx.fillStyle = '#888880';
  ctx.fillRect(16, 12, 8, 4);

  // Segment 3 - middle
  ctx.fillStyle = '#989890';
  ctx.fillRect(6, 16, 12, 7);
  ctx.fillRect(4, 18, 14, 3);
  ctx.fillStyle = '#787870';
  ctx.fillRect(8, 18, 8, 3);

  // Segment 4 - lower
  ctx.fillStyle = '#a0a098';
  ctx.fillRect(16, 22, 12, 6);
  ctx.fillRect(14, 24, 14, 2);
  ctx.fillStyle = '#888880';
  ctx.fillRect(18, 24, 8, 2);

  // Tail segment
  ctx.fillStyle = '#989890';
  ctx.fillRect(26, 20, 6, 4);
  ctx.fillRect(28, 18, 4, 3);

  if (!isBack) {
    // Eyes - stern
    ctx.fillStyle = '#302020';
    ctx.fillRect(6, 3, 4, 3);
    ctx.fillRect(14, 3, 4, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6, 3, 3, 2);
    ctx.fillRect(14, 3, 3, 2);
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(8, 8, 8, 2);
    ctx.fillStyle = '#787870';
    ctx.fillRect(10, 9, 4, 1);
  } else {
    // Back of head - darker
    ctx.fillStyle = '#787870';
    ctx.fillRect(6, 2, 12, 6);
    ctx.fillStyle = '#888880';
    ctx.fillRect(8, 4, 8, 3);
  }
};
