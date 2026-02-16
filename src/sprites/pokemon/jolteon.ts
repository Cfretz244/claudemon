import { CustomSpriteDrawFn } from '../types';

export const jolteon: CustomSpriteDrawFn = (ctx, isBack) => {
  // Jolteon - yellow spiky all over, jagged fur outline, white neck ruff

  // Spiky body outline - jagged yellow fur
  ctx.fillStyle = '#d8c030';
  ctx.fillRect(10, 12, 12, 10);
  ctx.fillRect(8, 14, 16, 6);
  // Spikes on back
  ctx.fillRect(20, 8, 3, 4);
  ctx.fillRect(22, 10, 3, 3);
  ctx.fillRect(24, 6, 3, 4);
  ctx.fillRect(18, 6, 3, 4);
  ctx.fillRect(16, 8, 3, 4);
  // Side spikes
  ctx.fillRect(6, 12, 3, 2);
  ctx.fillRect(4, 16, 3, 2);
  ctx.fillRect(25, 14, 3, 2);

  // White neck ruff
  ctx.fillStyle = '#e8e0c0';
  ctx.fillRect(8, 10, 10, 6);
  ctx.fillRect(6, 12, 14, 3);
  ctx.fillRect(10, 8, 8, 4);

  // Head
  ctx.fillStyle = '#d8c030';
  ctx.fillRect(8, 2, 12, 10);
  ctx.fillRect(6, 4, 14, 6);

  // Spiky ears
  ctx.fillRect(4, 0, 5, 6);
  ctx.fillRect(2, 0, 3, 3);
  ctx.fillRect(21, 0, 5, 6);
  ctx.fillRect(25, 0, 3, 3);

  // Legs
  ctx.fillStyle = '#d8c030';
  ctx.fillRect(10, 22, 3, 6);
  ctx.fillRect(19, 22, 3, 6);
  // Paws
  ctx.fillStyle = '#c0a828';
  ctx.fillRect(9, 27, 5, 3);
  ctx.fillRect(18, 27, 5, 3);

  // Spiky tail
  ctx.fillStyle = '#d8c030';
  ctx.fillRect(22, 16, 4, 3);
  ctx.fillRect(24, 14, 4, 3);
  ctx.fillRect(26, 16, 4, 3);
  ctx.fillRect(28, 14, 3, 3);

  if (!isBack) {
    // Eyes - sharp
    ctx.fillStyle = '#302020';
    ctx.fillRect(9, 5, 3, 3);
    ctx.fillRect(16, 5, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 5, 2, 2);
    ctx.fillRect(17, 5, 2, 2);
    // Nose
    ctx.fillStyle = '#302020';
    ctx.fillRect(13, 8, 2, 1);
  } else {
    // Back spikes more prominent
    ctx.fillStyle = '#c0a828';
    ctx.fillRect(12, 6, 8, 6);
    ctx.fillStyle = '#b8a020';
    ctx.fillRect(14, 8, 6, 4);
  }
};
