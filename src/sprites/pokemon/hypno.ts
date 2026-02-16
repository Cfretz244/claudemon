import { CustomSpriteDrawFn } from '../types';

export const hypno: CustomSpriteDrawFn = (ctx, isBack) => {
  // Body
  ctx.fillStyle = '#d8b858';
  ctx.fillRect(8, 12, 16, 14);
  ctx.fillRect(6, 14, 20, 10);

  // White collar/ruff
  ctx.fillStyle = '#e8e0d0';
  ctx.fillRect(6, 10, 20, 5);
  ctx.fillRect(4, 11, 24, 3);
  ctx.fillRect(8, 9, 16, 2);

  // Head
  ctx.fillStyle = '#d8b858';
  ctx.fillRect(8, 0, 16, 12);
  ctx.fillRect(6, 2, 20, 8);

  // Pointed ears
  ctx.fillStyle = '#d8b858';
  ctx.fillRect(4, 0, 5, 5);
  ctx.fillRect(23, 0, 5, 5);

  // Nose
  ctx.fillStyle = '#c0a040';
  ctx.fillRect(6, 5, 4, 4);
  ctx.fillRect(4, 6, 3, 3);

  // Arms
  ctx.fillStyle = '#d8b858';
  ctx.fillRect(3, 14, 5, 8);
  ctx.fillRect(24, 14, 5, 8);

  // Left hand holding pendulum
  ctx.fillStyle = '#d8b858';
  ctx.fillRect(1, 20, 5, 4);

  // Pendulum string
  ctx.fillStyle = '#888888';
  ctx.fillRect(2, 24, 1, 4);

  // Pendulum
  ctx.fillStyle = '#c0c0c0';
  ctx.fillRect(0, 27, 4, 4);
  ctx.fillRect(1, 28, 2, 2);
  ctx.fillStyle = '#e0e000';
  ctx.fillRect(1, 28, 2, 2);

  // Feet
  ctx.fillStyle = '#c0a040';
  ctx.fillRect(8, 26, 6, 4);
  ctx.fillRect(18, 26, 6, 4);

  // Belly
  ctx.fillStyle = '#c0a040';
  ctx.fillRect(10, 18, 12, 6);

  if (!isBack) {
    // Eyes - intense/hypnotic
    ctx.fillStyle = '#302020';
    ctx.fillRect(10, 4, 4, 4);
    ctx.fillRect(18, 4, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 4, 3, 3);
    ctx.fillRect(18, 4, 3, 3);
    ctx.fillStyle = '#302020';
    ctx.fillRect(11, 5, 2, 2);
    ctx.fillRect(19, 5, 2, 2);
    // Brow
    ctx.fillStyle = '#c0a040';
    ctx.fillRect(9, 3, 5, 1);
    ctx.fillRect(18, 3, 5, 1);
    // Mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(12, 8, 6, 1);
  } else {
    // Back shading
    ctx.fillStyle = '#c8a848';
    ctx.fillRect(10, 4, 12, 6);
    ctx.fillStyle = '#c0a040';
    ctx.fillRect(10, 16, 12, 6);
    // Back collar visible
    ctx.fillStyle = '#e8e0d0';
    ctx.fillRect(8, 10, 16, 3);
  }
};
