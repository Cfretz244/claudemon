import { CustomSpriteDrawFn } from '../types';

export const vaporeon: CustomSpriteDrawFn = (ctx, isBack) => {
  // Vaporeon - blue aquatic, fin ears, mermaid tail fin, white neck ruff

  // Body
  ctx.fillStyle = '#5090c8';
  ctx.fillRect(10, 12, 12, 10);
  ctx.fillRect(8, 14, 16, 6);

  // White neck ruff
  ctx.fillStyle = '#e0e8f0';
  ctx.fillRect(8, 10, 14, 6);
  ctx.fillRect(6, 12, 18, 3);
  ctx.fillRect(10, 8, 10, 4);

  // Head
  ctx.fillStyle = '#5090c8';
  ctx.fillRect(10, 2, 12, 10);
  ctx.fillRect(8, 4, 14, 6);

  // Fin ears
  ctx.fillStyle = '#3870a8';
  ctx.fillRect(6, 0, 5, 6);
  ctx.fillRect(4, 2, 3, 4);
  ctx.fillRect(21, 0, 5, 6);
  ctx.fillRect(25, 2, 3, 4);
  // Inner fin detail
  ctx.fillStyle = '#5090c8';
  ctx.fillRect(7, 2, 3, 2);
  ctx.fillRect(22, 2, 3, 2);

  // Mermaid tail
  ctx.fillStyle = '#5090c8';
  ctx.fillRect(18, 22, 6, 3);
  ctx.fillRect(22, 20, 4, 4);
  // Tail fin
  ctx.fillStyle = '#3870a8';
  ctx.fillRect(24, 16, 5, 4);
  ctx.fillRect(26, 14, 4, 8);
  ctx.fillRect(28, 16, 3, 4);
  ctx.fillRect(24, 24, 5, 4);
  ctx.fillRect(26, 22, 4, 8);
  ctx.fillRect(28, 24, 3, 4);

  // Legs (front)
  ctx.fillStyle = '#5090c8';
  ctx.fillRect(10, 22, 3, 6);
  ctx.fillRect(15, 22, 3, 6);
  // Paws
  ctx.fillStyle = '#3870a8';
  ctx.fillRect(9, 27, 4, 2);
  ctx.fillRect(14, 27, 4, 2);

  if (!isBack) {
    // Eyes
    ctx.fillStyle = '#302020';
    ctx.fillRect(12, 5, 3, 3);
    ctx.fillRect(19, 5, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(12, 5, 2, 2);
    ctx.fillRect(19, 5, 2, 2);
    // Nose
    ctx.fillStyle = '#302020';
    ctx.fillRect(15, 8, 2, 1);
  } else {
    // Dorsal fin ridge
    ctx.fillStyle = '#3870a8';
    ctx.fillRect(14, 10, 4, 2);
    ctx.fillRect(16, 14, 4, 2);
    ctx.fillStyle = '#4080b8';
    ctx.fillRect(12, 6, 8, 4);
  }
};
