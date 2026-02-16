import { CustomSpriteDrawFn } from '../types';

export const mrMime: CustomSpriteDrawFn = (ctx, isBack) => {
  // Mr. Mime - pink/blue humanoid with barrier hands and big round feet

  // Body - pink torso
  ctx.fillStyle = '#e898b0';
  ctx.fillRect(11, 12, 10, 10);
  ctx.fillRect(10, 14, 12, 6);

  // Head - round pink
  ctx.fillRect(10, 3, 12, 10);
  ctx.fillRect(9, 5, 14, 6);

  // Blue hair/horns on top
  ctx.fillStyle = '#7088b8';
  ctx.fillRect(10, 1, 4, 4);
  ctx.fillRect(18, 1, 4, 4);
  ctx.fillRect(12, 0, 2, 2);
  ctx.fillRect(20, 0, 2, 2);

  // Blue knee/leg markings
  ctx.fillStyle = '#7088b8';
  ctx.fillRect(11, 22, 4, 3);
  ctx.fillRect(19, 22, 4, 3);

  // Arms - thin
  ctx.fillStyle = '#e898b0';
  ctx.fillRect(5, 13, 6, 2);
  ctx.fillRect(21, 13, 6, 2);

  // Flat barrier hands - wide and flat
  ctx.fillStyle = '#e898b0';
  ctx.fillRect(0, 10, 6, 7);
  ctx.fillRect(26, 10, 6, 7);
  // Hand detail - finger lines
  ctx.fillStyle = '#d080a0';
  ctx.fillRect(1, 11, 1, 5);
  ctx.fillRect(3, 11, 1, 5);
  ctx.fillRect(27, 11, 1, 5);
  ctx.fillRect(29, 11, 1, 5);

  // Big round feet
  ctx.fillStyle = '#e898b0';
  ctx.fillRect(9, 25, 6, 4);
  ctx.fillRect(8, 26, 8, 3);
  ctx.fillRect(17, 25, 6, 4);
  ctx.fillRect(16, 26, 8, 3);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(12, 6, 3, 3);
    ctx.fillRect(19, 6, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(12, 6, 2, 2);
    ctx.fillRect(19, 6, 2, 2);
    // Pink cheeks
    ctx.fillStyle = '#d080a0';
    ctx.fillRect(10, 9, 3, 2);
    ctx.fillRect(21, 9, 3, 2);
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(15, 10, 4, 1);
  } else {
    // Back of head
    ctx.fillStyle = '#d888a0';
    ctx.fillRect(12, 5, 8, 6);
  }
};
