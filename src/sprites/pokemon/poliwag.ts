import { CustomSpriteDrawFn } from '../types';

export const poliwag: CustomSpriteDrawFn = (ctx, isBack) => {
  // Poliwag - blue tadpole, spiral on white belly, small tail

  // Round body
  ctx.fillStyle = '#4080c0';
  ctx.fillRect(6, 8, 20, 16);
  ctx.fillRect(4, 10, 24, 12);
  ctx.fillRect(8, 6, 16, 4);

  // White belly circle
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(10, 12, 12, 10);
  ctx.fillRect(12, 10, 8, 2);
  ctx.fillRect(12, 22, 8, 2);

  // Spiral on belly
  ctx.fillStyle = '#302020';
  ctx.fillRect(14, 14, 4, 2);
  ctx.fillRect(12, 14, 2, 6);
  ctx.fillRect(12, 18, 8, 2);
  ctx.fillRect(18, 14, 2, 6);
  ctx.fillRect(14, 12, 6, 2);

  // Tail - thin and curved
  ctx.fillStyle = '#4080c0';
  ctx.fillRect(26, 12, 3, 3);
  ctx.fillRect(28, 10, 3, 3);
  ctx.fillRect(29, 8, 2, 3);

  // Feet / small legs
  ctx.fillStyle = '#4080c0';
  ctx.fillRect(8, 24, 5, 4);
  ctx.fillRect(19, 24, 5, 4);
  ctx.fillStyle = '#3070b0';
  ctx.fillRect(8, 27, 5, 2);
  ctx.fillRect(19, 27, 5, 2);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(9, 8, 4, 3);
    ctx.fillRect(19, 8, 4, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(9, 8, 2, 2);
    ctx.fillRect(19, 8, 2, 2);
    // Small mouth
    ctx.fillStyle = '#f07080';
    ctx.fillRect(14, 10, 4, 2);
  } else {
    // Back - plain blue, no spiral visible
    ctx.fillStyle = '#3070b0';
    ctx.fillRect(10, 12, 12, 8);
    // Tail more visible from back
    ctx.fillStyle = '#4080c0';
    ctx.fillRect(26, 11, 4, 4);
    ctx.fillRect(29, 8, 2, 4);
  }
};
