import { CustomSpriteDrawFn } from '../types';

export const scyther: CustomSpriteDrawFn = (ctx, isBack) => {
  // Scyther - green mantis with blade arms and wings

  // Body
  ctx.fillStyle = '#68a848';
  ctx.fillRect(12, 10, 10, 12);
  ctx.fillRect(10, 12, 14, 8);

  // Head
  ctx.fillRect(12, 4, 10, 8);
  ctx.fillRect(11, 6, 12, 4);

  // Wings on back
  ctx.fillStyle = '#a0d888';
  ctx.fillRect(22, 6, 8, 4);
  ctx.fillRect(24, 4, 6, 8);
  ctx.fillRect(26, 8, 4, 6);
  // Second wing slightly lower
  ctx.fillRect(22, 12, 6, 3);
  ctx.fillRect(24, 10, 6, 4);

  // Left scythe arm
  ctx.fillStyle = '#90c870';
  ctx.fillRect(2, 8, 10, 3);
  ctx.fillRect(0, 6, 6, 3);
  ctx.fillRect(0, 4, 4, 4);
  // Blade edge
  ctx.fillStyle = '#e0f0d0';
  ctx.fillRect(0, 5, 3, 1);
  ctx.fillRect(0, 8, 2, 1);

  // Right scythe arm (forward)
  ctx.fillStyle = '#90c870';
  ctx.fillRect(4, 14, 8, 3);
  ctx.fillRect(2, 12, 5, 3);
  ctx.fillRect(0, 11, 4, 3);
  // Blade edge
  ctx.fillStyle = '#e0f0d0';
  ctx.fillRect(0, 11, 3, 1);

  // Legs
  ctx.fillStyle = '#68a848';
  ctx.fillRect(12, 22, 3, 6);
  ctx.fillRect(19, 22, 3, 6);
  // Feet
  ctx.fillStyle = '#589838';
  ctx.fillRect(10, 27, 5, 3);
  ctx.fillRect(17, 27, 5, 3);

  // Neck
  ctx.fillStyle = '#68a848';
  ctx.fillRect(14, 8, 6, 4);

  if (!isBack) {
    // Eyes - fierce
    ctx.fillStyle = '#302020';
    ctx.fillRect(13, 5, 3, 3);
    ctx.fillRect(18, 5, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(14, 5, 2, 2);
    ctx.fillRect(19, 5, 2, 2);
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(15, 9, 4, 1);
  } else {
    // Back detail - wing base
    ctx.fillStyle = '#589838';
    ctx.fillRect(14, 12, 8, 6);
  }
};
